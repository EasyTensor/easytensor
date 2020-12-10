# Copyright 2016 The Kubernetes Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
Creates, updates, and deletes a deployment using AppsV1Api.
"""
import os
from pathlib import Path

from typing import List
import json
import logging
from pprint import pformat
from typing import Collection
from kubernetes import client, config
import aiohttp
import asyncio
from aiohttp.client_exceptions import ClientConnectorError

from controller.config import (
    CONTROLLER_USERNAME,
    CONTROLLER_EMAIL,
    CONTROLLER_PASSWORD,
    MIGRATION_STATE,
    MODELS_URL,
    AUTH_URL,
    NAMESPACE,
    BABYSITTER_IMAGE,
)


logging.basicConfig()
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.DEBUG)


config.load_incluster_config()
APPS_V1 = client.AppsV1Api()
CORE_V1 = client.CoreV1Api()

ACCESS_TOKEN = ""
REFRESH_TOKEN = ""
CONSECUTIVE_FAILURES = 0
FAILURE_THRESHOLD = 5


def reset_consecutive_failures():
    add_healthy_file()


def report_consecutive_failure():
    global CONSECUTIVE_FAILURES
    CONSECUTIVE_FAILURES += 1
    if CONSECUTIVE_FAILURES > FAILURE_THRESHOLD:
        remove_healthy_file()


def remove_healthy_file():
    Path("/app/healthy").unlink()


def add_healthy_file():
    Path("/app/healthy").touch()


def get_request_header():
    return {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }


def set_authentication_credentials(access_token, refresh_token):
    global ACCESS_TOKEN, REFRESH_TOKEN
    ACCESS_TOKEN = access_token
    REFRESH_TOKEN = refresh_token


class ExpiredTokenError(Exception):
    """"""


class Model:
    def __init__(
        self,
        *,
        id: str,
        address: str,
        size: int,
        scale: int,
        framework: str,
        deployment_config=None,
    ):
        self.id = id
        self.size = size
        self.address = address
        self.scale = scale
        self.framework = framework
        self.deployment_config = deployment_config

    def __eq__(self, other):
        if self.id is None or other.id is None:
            return False
        return self.address == other.address

    def __str__(self):
        return f"(id: {self.id}, adderss: {self.address}, size: {self.size}, scale: {self.scale})"

    def __repr__(self):
        return self.__str__()


class DeploymentNameParseException(Exception):
    """"""

    pass


class ServiceNameParseException(Exception):
    """"""

    pass


def get_framework_label_from_model(model: Model):
    return {"TF": "tensorflow", "PT": "pytorch"}[model.framework]


def get_labels_from_model(model: Model) -> dict:
    return {
        "type": "model-server",
        "framework": get_framework_label_from_model(model),
        "model-address": model.address,
        "model-id": model.id,
    }


def get_deployment_name_from_model(model: Model):
    return f"model.serve.tf.{model.id}"


# TODO: remove these if i dont end up using them
def get_model_name_from_deployment(deployemnt_name: str):
    """
    works in tandem with get_deployment_name_from_model.
    assuumes model.serve.tf.{model.id}
    """
    strs = deployemnt_name.rsplit(".", 4)
    if len(strs) != 4:
        raise DeploymentNameParseException(
            f"could not read deployment {deployemnt_name}"
        )
    return strs[-1]


def get_service_name_from_model(model: Model) -> str:
    return f"model-serve-tf-{model.id}"


# TODO: remove these if i dont end up using them
def get_model_name_from_service(service_name: str):
    """
    works in tandem with get_service_name_from_model.
    assuumes model-serve-tf-{model.id}
    """
    strs = service_name.rsplit("-")
    if str is []:
        raise ServiceNameParseException(f"could not read deployment {service_name}")
    return str(strs[3:])


def get_service_ports_for_model(model: Model) -> List[client.V1ServicePort]:
    """
    TODO: add difference based on pytorch vs tensorflow
    """
    return [
        client.V1ServicePort(name="http", port=8501),
        client.V1ServicePort(name="grpc", port=8500),
    ]


def create_service_object(model: Model):
    """
    Creates a service for this model to connect
    to the deployment.
    """
    service_name = get_service_name_from_model(model)
    service_spec = client.V1ServiceSpec(
        selector=get_labels_from_model(model), ports=get_service_ports_for_model(model),
    )
    return client.V1Service(
        api_version="v1",
        kind="Service",
        spec=service_spec,
        metadata=client.V1ObjectMeta(
            name=service_name, labels=get_labels_from_model(model),
        ),
    )


def get_memory_request(model):
    """
    Returns the memory request in Mi (megabyte).
    Calculates as the model size + ~10 MB needed
    for operation
    """
    return str(round(model.size / (1024 ** 2)) + 10) + "Mi"


def get_memory_limit(model):
    """
    Returns the memory request in Mi (megabyte).
    Calculates as the model size + ~100 MB needed
    for operation
    """
    return str(round(model.size / (1024 ** 2)) + 1024) + "Mi"


def create_service(service):
    # Create deployement
    api_response = CORE_V1.create_namespaced_service(body=service, namespace=NAMESPACE)
    LOGGER.debug("Service created. status='%s'" % str(api_response.status))


def create_deployment_object(model: Model):
    deployment_name = get_deployment_name_from_model(model)
    shared_volume = client.V1Volume(
        name="model-dir", empty_dir=client.V1EmptyDirVolumeSource()
    )
    # Configureate Pod template container
    tf_serve_contaienr = client.V1Container(
        name="tf-serve",
        image="tensorflow/serving:2.3.0",
        ports=[
            client.V1ContainerPort(container_port=8500),
            client.V1ContainerPort(container_port=8501),
        ],
        resources=client.V1ResourceRequirements(
            requests={"cpu": "100m", "memory": f"{get_memory_request(model)}"},
            limits={"cpu": "100m", "memory": f"{get_memory_limit(model)}"},
        ),
        volume_mounts=[
            client.V1VolumeMount(
                name="model-dir", mount_path="/models/", read_only=False
            )
        ],
    )
    babysitter_container = client.V1Container(
        name="babysitter",
        image=BABYSITTER_IMAGE,
        ports=[],
        resources=client.V1ResourceRequirements(
            requests={"cpu": "100m", "memory": f"100Mi"},
            limits={"cpu": "100m", "memory": f"100Mi"},
        ),
        volume_mounts=[
            client.V1VolumeMount(
                name="model-dir", mount_path="/models/", read_only=False
            )
        ],
        env=[
            client.V1EnvVar(name="MODEL_ADDRESS", value=model.address),
            client.V1EnvVar(
                "EXTRACT_MODEL", value=str(model.framework == "TF").lower()
            ),
        ],
        env_from=[
            client.V1EnvFromSource(
                config_map_ref=client.V1ConfigMapEnvSource(name="mesh-account-cred")
            ),
            client.V1EnvFromSource(
                config_map_ref=client.V1ConfigMapEnvSource(name="service-routing")
            ),
        ],
        image_pull_policy="IfNotPresent",
    )

    # Create and configurate a spec section
    template = client.V1PodTemplateSpec(
        metadata=client.V1ObjectMeta(labels=get_labels_from_model(model)),
        spec=client.V1PodSpec(
            containers=[tf_serve_contaienr, babysitter_container],
            volumes=[shared_volume],
        ),
    )
    # Create the specification of deployment
    spec = client.V1DeploymentSpec(
        replicas=model.scale,
        template=template,
        selector={
            "matchLabels": {
                "type": "model-server",
                "framework": "tensorflow",
                "model-address": model.address,
            }
        },
    )
    # Instantiate the deployment object
    deployment = client.V1Deployment(
        api_version="apps/v1",
        kind="Deployment",
        metadata=client.V1ObjectMeta(
            name=deployment_name, labels=get_labels_from_model(model),
        ),
        spec=spec,
    )

    return deployment


def create_deployment(deployment):
    # Create deployement
    api_response = APPS_V1.create_namespaced_deployment(
        body=deployment, namespace=NAMESPACE
    )
    LOGGER.debug("Deployment created. status='%s'" % str(api_response.status))


def delete_deployment(deployment_name):
    # Delete deployment
    api_response = APPS_V1.delete_namespaced_deployment(
        name=deployment_name,
        namespace=NAMESPACE,
        body=client.V1DeleteOptions(
            propagation_policy="Foreground", grace_period_seconds=5
        ),
    )
    LOGGER.debug("Deployment deleted. status='%s'" % str(api_response.status))


def delete_service(service_name):
    # Delete deployment
    api_response = CORE_V1.delete_namespaced_service(
        name=service_name,
        namespace=NAMESPACE,
        body=client.V1DeleteOptions(
            propagation_policy="Foreground", grace_period_seconds=5
        ),
    )
    LOGGER.debug("service_name deleted. status='%s'" % str(api_response.status))


async def get_model_list():
    async with aiohttp.ClientSession(headers=get_request_header()) as session:
        response = await session.get(MODELS_URL)
        if response.status == 401:
            detail = await response.json()
            detail = detail["detail"]
            LOGGER.info("Auth token expired.")
            raise ExpiredTokenError(f"Unauthorized. {detail}")
        return await response.json()


async def get_idea_model_state():
    model_list = await get_model_list()
    return [
        Model(
            id=model["id"],
            address=model["address"],
            size=model["size"],
            scale=model["scale"],
            framework=model["framework"],
        )
        for model in model_list
        if model["deployed"]
    ]


def get_deployed_model_list():
    deployments = APPS_V1.list_namespaced_deployment(
        namespace=NAMESPACE, label_selector="type=model-server"
    )

    models = []

    for dep in deployments.items:
        models.append(
            Model(
                id=dep.metadata.labels.get("model-id"),
                address=dep.metadata.labels.get("model-address"),
                framework=dep.metadata.labels.get("model-address"),
                size=0,
                scale=dep.spec.replicas,
                deployment_config=dep,
            )
        )
    return models


def get_serviced_model_list():
    services = CORE_V1.list_namespaced_service(
        namespace=NAMESPACE, label_selector="type=model-server"
    )
    models = []

    for svc in services.items:
        models.append(
            Model(
                id=svc.metadata.labels.get("model-id"),
                address=svc.metadata.labels.get("model-address"),
                framework=None,
                size=0,
                scale=0,
                deployment_config=svc,
            )
        )
    return models


def delete_model_deployments(models: Collection[Model]):
    # Delete deployment
    for model in models:
        LOGGER.debug("deleting deployment %s", model.id)
        deployment_name = get_deployment_name_from_model(model)
        delete_deployment(deployment_name)


def create_model_deployments(models: Collection[Model]):
    # Delete deployment
    for model in models:
        LOGGER.debug("creating deployment %s", model.id)
        deployment = create_deployment_object(model)
        create_deployment(deployment)


def scale_patcher(ideal_model, current_model):
    if ideal_model.scale != current_model.scale:
        APPS_V1.patch_namespaced_deployment(
            name=current_model.deployment_config.metadata.name,
            namespace=NAMESPACE,
            body={"spec": {"replicas": int(ideal_model.scale)}},
        )


def edit_models(to_edit: Collection[Model], ideal_models: Collection[Model]):
    editors = [scale_patcher]
    for current_model in to_edit:
        ideal_model = ideal_models[ideal_models.index(current_model)]
        for editor in editors:
            editor(ideal_model, current_model)


def correct_deployments(ideal_models: list[Model], deployed_models: list[Model]):
    to_delete = [m for m in deployed_models if m not in ideal_models]
    to_create = [m for m in ideal_models if m not in deployed_models]
    to_edit = [m for m in deployed_models if m not in to_delete and m not in to_create]
    delete_model_deployments(to_delete)
    create_model_deployments(to_create)
    edit_models(to_edit, ideal_models)


def delete_model_services(models: Collection[Model]):
    # Delete deployment
    for model in models:
        LOGGER.debug("deleting service %s", model.id)
        service_name = get_service_name_from_model(model)
        delete_service(service_name)


def create_model_services(models: Collection[Model]):
    for model in models:
        LOGGER.debug("creating service %s", model.id)
        service = create_service_object(model)
        create_service(service)


def correct_services(ideal_models: list[Model], serviced_models: list[Model]):
    to_delete = [m for m in serviced_models if m not in ideal_models]
    to_create = [m for m in ideal_models if m not in serviced_models]
    delete_model_services(to_delete)
    create_model_services(to_create)


async def correct_state(
    ideal_models: list[Model],
    deployed_models: list[Model],
    serviced_models: List[Model],
):
    # TODO: optimize these lookups to save time.
    correct_deployments(ideal_models, deployed_models)
    correct_services(ideal_models, serviced_models)


async def control():
    LOGGER.debug("initializing first authentication")
    await retry_forever(func=authenticate, async_fun=True)
    LOGGER.debug("Controlling namespace %s", NAMESPACE)
    failures = 0
    while True:
        if failures > 5:
            raise Exception("5 consecurtive failures. Quitting")
        try:
            ideal_models = await get_idea_model_state()
            LOGGER.debug("ideal models: %s", pformat(ideal_models))
            print(ideal_models)
        except ExpiredTokenError:
            await authenticate()
            failures += 1
        except ClientConnectorError:
            LOGGER.warning("failed to contact backend service")
            failures += 1
            await asyncio.sleep(3)  # 3 seconds
        else:
            failures = 0
            print("ideal models:")
            deployed_models = get_deployed_model_list()
            serviced_models = get_serviced_model_list()
            LOGGER.debug("deployed models: %s", pformat(deployed_models))
            LOGGER.debug("serviced_models: %s", pformat(serviced_models))
            await correct_state(ideal_models, deployed_models, serviced_models)
            await asyncio.sleep(3)  # 3 seconds


async def retry_forever(func, report_failure=True, async_fun=False, *args, **kwargs):
    """
    Retries the passed func until completion.
    Sleeps for a second after every failure.
    """
    while True:
        try:
            if async_fun:
                result = await func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)
            reset_consecutive_failures()
            return result
        except Exception as e:
            LOGGER.debug(e)
            if report_failure:
                report_consecutive_failure()
            await asyncio.sleep(1)


async def authenticate():
    """
    Add retry forever if you want to block on a successful authentication to
    proceed.
    """
    async with aiohttp.ClientSession(
        headers={"Content-type": "application/json"}
    ) as session:
        # TODO: change this to application tokens
        body = json.dumps(
            {
                "username": CONTROLLER_USERNAME,
                "email": CONTROLLER_EMAIL,
                "password": CONTROLLER_PASSWORD,
            }
        )
        try:
            response = await session.post(AUTH_URL, data=body)
            if response.status == 200:
                response = await response.json()
                set_authentication_credentials(
                    response["access_token"], response["refresh_token"]
                )
                return
        except ClientConnectorError:
            pass
        else:
            LOGGER.error("Could not login to backend server.")
            LOGGER.error(await response.json())


async def main():
    await control()


if __name__ == "__main__":
    from controller.migrations.apply import run_migrations

    run_migrations(MIGRATION_STATE)
    asyncio.get_event_loop().run_until_complete(main())
