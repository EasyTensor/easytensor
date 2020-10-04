FROM ubuntu:18.04

RUN apt update && apt install -y curl python3

RUN mkdir /gcloud && \
    curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-312.0.0-linux-x86_64.tar.gz \
    && tar -xzf google-cloud-sdk-312.0.0-linux-x86_64.tar.gz -C /gcloud && \
    /gcloud/google-cloud-sdk/install.sh --quiet --additional-components kubectl && \
    rm -rf google-cloud-sdk-312.0.0-linux-x86_64.tar.gz

ENV PATH="/gcloud/google-cloud-sdk/bin:${PATH}"

RUN mkdir /easytensor

COPY . /easytensor