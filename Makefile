SHELL := /bin/bash

build-tusd:
	cd docker && docker build . -f tusd.Dockerfile -t easytensor/tusd

dev:
	skaffold dev --cleanup=false  --port-forward

build-all:
	docker build backend -t easytensor/backend
	docker build frontend -t easytensor/frontend
	docker build upload -t easytensor/upload
	docker build controller -t easytensor/controller
