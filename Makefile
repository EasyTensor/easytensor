up:
	docker-compose up -d

build-tusd:
	cd docker && docker build . -f tusd.Dockerfile -t easytensor/tusd
