"""
Creates, updates, and deletes a deployment using AppsV1Api.
"""
import logging
from kubernetes import client
from controller.config import NAMESPACE

logging.basicConfig()
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.DEBUG)


APPS_V1 = client.AppsV1Api()

image = (
    "easytensor/babysitter:latest" if NAMESPACE == "dev" else
    "gcr.io/easytensor-291022/easytensor/babysitter:0.1.8"
)

def include_model_id_in_babysitter_env():
    deployments = APPS_V1.list_namespaced_deployment(
        namespace=NAMESPACE, label_selector="framework=tensorflow"
    )

    for dep in deployments.items:
        LOGGER.info("updating deployment %s", dep.metadata.name)
        LOGGER.info(dep.metadata.labels)
        APPS_V1.patch_namespaced_deployment(
            name=dep.metadata.name,
            namespace=NAMESPACE,
            body={
                "spec": {
                    "template": {
                        "spec": {
                            "containers": [
                                {
                                    "name": "babysitter",
                                    "image": image,
                                    "env": [
                                        {
                                            "name": "MODEL_ID",
                                            "value": dep.metadata.labels["model-id"],
                                        }
                                    ],
                                }
                            ]
                        }
                    }
                }
            },
        )
