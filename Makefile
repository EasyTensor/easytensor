SHELL := /bin/bash

all: build-all tag-all push-all

dev:
	skaffold dev --cleanup=false  --port-forward

build-all: build-image-backend \
		build-image-frontend \
		build-image-controller \
		build-image-babysitter \
		build-image-query \
		build-image-reporter

tag-all: tag-image-backend \
		tag-image-frontend \
		tag-image-controller \
		tag-image-babysitter \
		tag-image-query \
		tag-image-reporter

push-all: push-image-backend \
		push-image-frontend \
		push-image-controller \
		push-image-babysitter \
		push-image-query \
		push-image-reporter

build-image-%:
	docker build $* -t easytensor/$*

tag-image-%:
	docker tag easytensor/$* "gcr.io/easytensor-291022/easytensor/$*:${RELEASE_VERSION}"

push-image-%:
	docker push "gcr.io/easytensor-291022/easytensor/$*:${RELEASE_VERSION}"

gen-secrets:
	./config/generate_secrets.sh
