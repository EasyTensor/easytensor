FROM frolvlad/alpine-glibc:alpine-3.12

RUN apk add --update \
  bash curl unzip &&\
  rm -rf /var/cache/apk/*

ENV TERRAFORM_VERSION "0.13.4"

RUN \
  curl -LOJ https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
  unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip &&\
  rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip &&\
  mv terraform /bin &&\
  chmod +x /bin/terraform