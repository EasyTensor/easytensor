SHELL := /bin/bash

all: build-all tag-all push-all

dev:
	skaffold dev --cleanup=false  --port-forward

build-all: build-image-backend \
		build-image-frontend \
		build-image-controller \
		build-image-babysitter \
		build-image-query \
		build-image-reporter \
		build-image-pytorch_serve \
		build-image-transformer_serve

tag-all: tag-image-backend \
		tag-image-frontend \
		tag-image-controller \
		tag-image-babysitter \
		tag-image-query \
		tag-image-reporter \
		tag-image-pytorch_serve \
		tag-image-transformer_serve

push-all: push-image-backend \
		push-image-frontend \
		push-image-controller \
		push-image-babysitter \
		push-image-query \
		push-image-reporter \
		push-image-pytorch_serve \
		push-image-transformer_serve

build-image-%:
	docker build $* -t easytensor/$*

build-image-pytorch_serve:
	docker build model_server/pytorch/ -t easytensor/pytorch_serve

build-image-transformer_serve:
	docker build model_server/transformer/ -t easytensor/transformer_serve

tag-image-%:
	docker tag easytensor/$* "gcr.io/easytensor-291022/easytensor/$*:${RELEASE_VERSION}"

push-image-%:
	docker push "gcr.io/easytensor-291022/easytensor/$*:${RELEASE_VERSION}"

gen-secrets:
	./config/generate_dev_secrets.sh
