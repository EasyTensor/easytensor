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
import logging
from pprint import pprint, pformat
from typing import Collection
from kubernetes import client, config
import aiohttp
import asyncio
from aiohttp.client_exceptions import ClientConnectorError
from kubernetes.client.models.v1_env_from_source import V1EnvFromSource
from kubernetes.client.models.v1_projected_volume_source import V1ProjectedVolumeSource

BACKEND_SERVICE_URL = "http://backend-service"
MODELS_URL = f"{BACKEND_SERVICE_URL}:8000/models/"
NAMESPACE = "dev"

logging.basicConfig()
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.DEBUG)


class Model:
    def __init__(self, *, address: str, size: int, scale: int, deployment_config=None):
        self.size = size
        self.address = address
        self.scale = scale
        self.deployment_config = deployment_config

    def __eq__(self, other):
        if self.address is None or other.address is None:
            return False
        return self.address == other.address

    def __str__(self):
        return f"(adderss: {self.address}, size: {self.size}, scale: {self.scale})"

    def __repr__(self):
        return self.__str__()


class DeploymentNameParseException(Exception):
    """"""


def get_deployment_name_from_model(model: Model):
    return f"model.serve.tf.{model.address}"


def get_model_name_from_deployment(deployemnt_name: str):
    strs = deployemnt_name.rsplit(".", 4)
    if len(strs) != 4:
        raise DeploymentNameParseException(
            f"could not read deployment {deployemnt_name}"
        )
    return strs[-1]


def create_deployment_object(model: Model):
    deployment_name = get_deployment_name_from_model(model)
    shared_volume = client.V1Volume(
        name="model-dir", empty_dir=client.V1EmptyDirVolumeSource()
    )
    # Configureate Pod template container
    tf_serve_contaienr = client.V1Container(
        name="tf-serve",
        image="tensorflow/serving",
        ports=[
            client.V1ContainerPort(container_port=8500),
            client.V1ContainerPort(container_port=8501),
        ],
        resources=client.V1ResourceRequirements(
            requests={"cpu": "100m", "memory": f"{model.size}Mi"},
            limits={"cpu": "100m", "memory": f"{model.size}Mi"},
        ),
        volume_mounts=[
            client.V1VolumeMount(name="model-dir", mount_path="/models/model/", read_only=True)
        ],
    )
    babysitter_container = client.V1Container(
        name="babysitter",
        image="easytensor/babysitter",
        ports=[],
        resources=client.V1ResourceRequirements(
            requests={"cpu": "100m", "memory": f"100Mi"},
            limits={"cpu": "100m", "memory": f"100Mi"},
        ),
        volume_mounts=[
            client.V1VolumeMount(
                name="model-dir", mount_path="/models/model/", read_only=False
            )
        ],
        env=[client.V1EnvVar(name="MODEL_ADDRESS", value=model.address)],
        image_pull_policy="IfNotPresent",
    )

    # Create and configurate a spec section
    template = client.V1PodTemplateSpec(
        metadata=client.V1ObjectMeta(
            labels={"model-server": "tensorflow", "model-address": model.address}
        ),
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
                "model-server": "tensorflow",
                "model-address": model.address,
            }
        },
    )
    # Instantiate the deployment object
    deployment = client.V1Deployment(
        api_version="apps/v1",
        kind="Deployment",
        metadata=client.V1ObjectMeta(
            name=deployment_name,
            labels={"model-address": model.address, "model-server": "tensorflow"},
        ),
        spec=spec,
    )

    return deployment


def create_deployment(deployment, api_instance):
    # Create deployement
    api_response = api_instance.create_namespaced_deployment(
        body=deployment, namespace=NAMESPACE
    )
    LOGGER.debug("Deployment created. status='%s'" % str(api_response.status))


def delete_deployment(deployment_name, apps_v1):
    # Delete deployment
    api_response = apps_v1.delete_namespaced_deployment(
        name=deployment_name,
        namespace=NAMESPACE,
        body=client.V1DeleteOptions(
            propagation_policy="Foreground", grace_period_seconds=5
        ),
    )
    LOGGER.debug("Deployment deleted. status='%s'" % str(api_response.status))


async def get_model_list():
    async with aiohttp.ClientSession() as session:
        response = await session.get(MODELS_URL)
        return await response.json()


async def get_idea_model_state():
    model_list = await get_model_list()
    return [
        Model(address=model["address"], size=model["size"], scale=model["scale"])
        for model in model_list
    ]


def get_deployed_model_list(apps_v1):
    namespace = NAMESPACE
    deployments = apps_v1.list_namespaced_deployment(
        namespace=namespace, label_selector="model-server=tensorflow"
    )
    models = []
    for dep in deployments.items:
        models.append(
            Model(
                address=dep.metadata.labels.get("model-address"),
                size=0,
                scale=dep.spec.replicas,
                deployment_config=dep,
            )
        )
    return models


def delete_models(models: Collection[Model], apps_v1):
    # Delete deployment
    for model in models:
        LOGGER.debug("deleting deployment %s", model.address)
        deployment_name = get_deployment_name_from_model(model)
        delete_deployment(deployment_name, apps_v1)


def create_models(models: Collection[Model], apps_v1):
    # Delete deployment
    for model in models:
        LOGGER.debug("creating deployment %s", model.address)
        deployment = create_deployment_object(model)
        create_deployment(deployment, apps_v1)


def scale_patcher(ideal_model, current_model, apps_v1):
    if ideal_model.scale != current_model.scale:
        apps_v1.patch_namespaced_deployment(
            name=current_model.deployment_config.metadata.name,
            namespace=NAMESPACE,
            body={"spec": {"replicas": int(ideal_model.scale)}},
        )


def edit_models(to_edit: Collection[Model], ideal_models: Collection[Model], apps_v1):
    editors = [scale_patcher]
    for current_model in to_edit:
        ideal_model = ideal_models[ideal_models.index(current_model)]
        for editor in editors:
            editor(ideal_model, current_model, apps_v1)


async def correct_state(
    ideal_models: list[Model], current_models: list[Model], apps_v1
):
    # TODO: optimize these lookups to save time.
    to_delete = [m for m in current_models if m not in ideal_models]
    to_create = [m for m in ideal_models if m not in current_models]
    to_edit = [m for m in current_models if m not in to_delete and m not in to_create]
    delete_models(to_delete, apps_v1)
    create_models(to_create, apps_v1)
    edit_models(to_edit, ideal_models, apps_v1)


async def control():
    # global LOGGER
    failures = 0
    config.load_incluster_config()
    apps_v1 = client.AppsV1Api()
    while True:
        LOGGER.warning("im here with logging")
        print("im here")
        try:
            ideal_models = await get_idea_model_state()
            LOGGER.debug("ideal models: %s", pformat(ideal_models))
            print(ideal_models)
        except ClientConnectorError:
            LOGGER.warning("failed to contact backend service")
            if failures > 5:
                raise Exception("5 consecurtive failures. Quitting")
            await asyncio.sleep(3)  # 3 seconds
        else:
            print("ideal models:")
            current_models = get_deployed_model_list(apps_v1)
            LOGGER.debug("current models: %s", pformat(current_models))
            await correct_state(ideal_models, current_models, apps_v1)
            await asyncio.sleep(3)  # 3 seconds


async def main():
    await control()


if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(main())
