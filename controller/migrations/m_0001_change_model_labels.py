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
from kubernetes import client
from controller.config import NAMESPACE

logging.basicConfig()
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.DEBUG)


APPS_V1 = client.AppsV1Api()
CORE_V1 = client.CoreV1Api()


def change_model_labels():
    deployments = APPS_V1.list_namespaced_deployment(
        namespace=NAMESPACE, label_selector="model-server=tensorflow"
    )

    for dep in deployments.items:
        LOGGER.info("updating deployment %s", dep.metadata.name)
        APPS_V1.patch_namespaced_deployment(
            name=dep.metadata.name,
            namespace=NAMESPACE,
            body={
                "metadata": {
                    "labels": {
                        "type": "model-server",
                        "framework": "tensorflow",
                    }
                }
            },
        )

    services = CORE_V1.list_namespaced_service(
        namespace=NAMESPACE, label_selector="model-server=tensorflow"
    )

    for svc in services.items:
        LOGGER.info("updating service %s", svc.metadata.name)
        CORE_V1.patch_namespaced_service(
            name=svc.metadata.name,
            namespace=NAMESPACE,
            body={
                "metadata": {
                    "labels": {
                        "type": "model-server",
                        "framework": "tensorflow",
                    }
                }
            },
        )
