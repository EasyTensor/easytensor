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
from controller.run import (
    Model,
    ModelFramework,
    create_deployment_object,
    create_deployment,
    delete_deployment,
    create_service_object,
    create_service,
    delete_service,
    get_model_framework_from_label,
)

logging.basicConfig()
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.DEBUG)


APPS_V1 = client.AppsV1Api()
CORE_V1 = client.CoreV1Api()


def remove_model_type_from_object_names():
    deployments = APPS_V1.list_namespaced_deployment(
        namespace=NAMESPACE, label_selector="type=model-server"
    )
    deployment_names = [d.metadata.name for d in deployments.items]

    for old_dep in deployments.items:
        LOGGER.info("Fixing deployment %s", old_dep.metadata.name)
        model = Model(
            id=old_dep.metadata.labels.get("model-id"),
            address=old_dep.metadata.labels.get("model-address"),
            framework=get_model_framework_from_label(
                old_dep.metadata.labels.get("framework")
            ),
            size=0,
            scale=old_dep.spec.replicas,
            deployment_config=old_dep,
        )

        new_deployment = create_deployment_object(model)
        if new_deployment.metadata.name == old_dep.metadata.name:
            LOGGER.info("Deployment has already been migrated. Skipping")
            continue

        # we created the new object, but the old object is still there.
        if new_deployment.metadata.name not in deployment_names:
            LOGGER.info("Creating new deployment %s", new_deployment.metadata.name)
            create_deployment(new_deployment)
        LOGGER.info("Deleting old deployment %s", old_dep.metadata.name)
        delete_deployment(old_dep.metadata.name)

    services = CORE_V1.list_namespaced_service(
        namespace=NAMESPACE, label_selector="type=model-server"
    )
    service_names = [s.metadata.name for s in services.items]
    for old_svc in services.items:
        LOGGER.info("updating service %s", old_svc.metadata.name)
        model = Model(
            id=old_svc.metadata.labels.get("model-id"),
            address=old_svc.metadata.labels.get("model-address"),
            framework=get_model_framework_from_label(
                old_svc.metadata.labels.get("framework")
            ),
            size=0,
            scale=0,
            deployment_config=old_svc,
        )

        new_service = create_service_object(model)
        if new_service.metadata.name == old_svc.metadata.name:
            LOGGER.info("Deployment has already been migrated. Skipping")
            continue

        # we created the new object, but the old object is still there.
        if new_service.metadata.name not in service_names:
            LOGGER.info("Creating new service %s", new_service.metadata.name)
            create_service(new_service)
        LOGGER.info("Deleting old service %s", old_svc.metadata.name)
        delete_service(old_svc.metadata.name)
