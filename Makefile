SHELL := /bin/bash

up:
	docker-compose up -d

build-tusd:
	cd docker && docker build . -f tusd.Dockerfile -t easytensor/tusd

build-terraform:
	cd docker && docker build . -f terraform.Dockerfile -t easytensor/terraform

dev:
	skaffold dev --cleanup=false --port-forward