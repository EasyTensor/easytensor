FROM frolvlad/alpine-glibc:alpine-3.12

RUN apk add --update \
  bash curl tar gzip &&\
  rm -rf /var/cache/apk/*

ENV TUSD_VERSION "v1.4.0"

RUN \
  mkdir -p /_ &&\
  curl -L https://github.com/tus/tusd/releases/download/${TUSD_VERSION}/tusd_linux_amd64.tar.gz | tar xzv -C /_ &&\
  mv /_/tusd_linux_amd64/tusd /bin &&\
  rm -R /_ &&\
  chmod +x /bin/tusd

RUN mkdir -p /tusd-uploads

CMD [ "/bin/tusd", "-behind-proxy", "-dir", "/tusd-uploads" ]
