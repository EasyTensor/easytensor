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
from pprint import pprint
from kubernetes import client, config
import aiohttp
import asyncio

DEPLOYMENT_NAME = "nginx-deployment"
BACKEND_SERVICE_URL = "http://backend-service"
MODELS_URL = f"{BACKEND_SERVICE_URL}:8000/models/"


class Model:
    def __init__(self, *, address: str, size: int, scale: int):
        self.size = size
        self.address = address
        self.scale = scale

    def __eq__(self, other):
        if self.address is None or other.address is None:
            return False
        return self.address == other.address

    def __str__(self):
        return f"(adderss: {self.address}, size: {self.size}, scale: {self.scale})"

    def __repr__(self):
        return self.__str__()

def create_deployment_object(model: Model):
    deployment_name = f"model-serve-tf-{model.address}"
    # Configureate Pod template container
    tf_serve_contaienr = client.V1Container(
        name="tf-serve",
        image="tensorflow/serving",
        ports=[
            client.V1ContainerPort(container_port=8500),
            client.V1ContainerPort(container_port=8501),
        ],
        resources=client.V1ResourceRequirements(
            requests={"cpu": "100m", "memory": f"{model.size}m"},
            limits={"cpu": "100m", "memory": f"{model.size}m"},
        ),
    )
    # Create and configurate a spec section
    template = client.V1PodTemplateSpec(
        metadata=client.V1ObjectMeta(
            labels={"model-server": "tensorflow", "model-address": model.address}
        ),
        spec=client.V1PodSpec(containers=[tf_serve_contaienr]),
    )
    # Create the specification of deployment
    spec = client.V1DeploymentSpec(
        replicas=3,
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


def create_deployment(api_instance, deployment):
    # Create deployement
    api_response = api_instance.create_namespaced_deployment(
        body=deployment, namespace="dev"
    )
    print("Deployment created. status='%s'" % str(api_response.status))


def delete_deployment(api_instance):
    # Delete deployment
    api_response = api_instance.delete_namespaced_deployment(
        name=DEPLOYMENT_NAME,
        namespace="dev",
        body=client.V1DeleteOptions(
            propagation_policy="Foreground", grace_period_seconds=5
        ),
    )
    print("Deployment deleted. status='%s'" % str(api_response.status))


async def get_model_list():
    async with aiohttp.ClientSession() as session:
        response = await session.get(MODELS_URL)
        return await response.json()


async def get_idea_model_state():
    model_list = await get_model_list()
    pprint(model_list)
    return list(
        Model(address=model["address"], size=model["size"], scale=model["scale"])
        for model in model_list
    )


def get_deployed_model_list(apps_v1):
    namespace = "dev"
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
            )
        )
    return models


async def control():
    config.load_incluster_config()
    apps_v1 = client.AppsV1Api()
    while True:
        ideal_models = await get_idea_model_state()
        print("ideal models:")
        pprint(ideal_models)
        current = get_deployed_model_list(apps_v1)
        print("current models:")
        pprint(current)
        import time

        time.sleep(3)  # 10 seconds


async def main():
    await control()


if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(main())
