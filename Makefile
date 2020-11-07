SHELL := /bin/bash

build-tusd:
	cd docker && docker build . -f tusd.Dockerfile -t easytensor/tusd

dev:
	skaffold dev --cleanup=false  --port-forward

build-all:
	build-service-backend
	build-service-frontend
	build-service-controller
	build-service-babysitter
	build-service-query

publish-all:
	tag-image-backend
	tag-image-frontend
	tag-image-controller
	tag-image-babysitter
	tag-image-query

push-all:
	push-image-backend
	push-image-frontend
	push-image-controller
	push-image-babysitter
	push-image-query

build-service-%:
	docker build $* -t easytensor/$*

tag-image-%:
	docker tag easytensor/$* "gcr.io/${PROJECT_ID}/easytensor/$*:${GITHUB_SHA}"

push-image-%:
	docker push "gcr.io/${PROJECT_ID}/easytensor/$*:${GITHUB_SHA}"

gen-secrets:
	./config/generate_secrets.sh
