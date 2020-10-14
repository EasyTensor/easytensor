SHELL := /bin/bash

build-tusd:
	cd docker && docker build . -f tusd.Dockerfile -t easytensor/tusd

dev:
	skaffold dev --cleanup=false --port-forward
