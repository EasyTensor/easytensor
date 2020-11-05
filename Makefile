SHELL := /bin/bash

build-tusd:
	cd docker && docker build . -f tusd.Dockerfile -t easytensor/tusd

dev:
	skaffold dev --cleanup=false  --port-forward

build-all:
	docker build backend -t easytensor/backend
	docker build frontend -t easytensor/frontend
	docker build controller -t easytensor/controller
	docker build babysitter -t easytensor/babysitter

publish-all:
	docker tag easytensor/backend "gcr.io/${PROJECT_ID}/easytensor/backend:${GITHUB_SHA}"
	docker tag easytensor/frontend "gcr.io/${PROJECT_ID}/easytensor/frontend:${GITHUB_SHA}"
	docker tag easytensor/controller "gcr.io/${PROJECT_ID}/easytensor/controller:${GITHUB_SHA}"
	docker tag easytensor/babysitter "gcr.io/${PROJECT_ID}/easytensor/babysitter:${GITHUB_SHA}"

push-all:
	docker push "gcr.io/${PROJECT_ID}/easytensor/backend:${GITHUB_SHA}"
	docker push "gcr.io/${PROJECT_ID}/easytensor/frontend:${GITHUB_SHA}"
	docker push "gcr.io/${PROJECT_ID}/easytensor/controller:${GITHUB_SHA}"
	docker push "gcr.io/${PROJECT_ID}/easytensor/babysitter:${GITHUB_SHA}"

gen-secrets:
	./config/generate_secrets.sh
