FROM python:3.9.0-alpine

RUN apk add gcc musl-dev libffi-dev

RUN mkdir /app
WORKDIR /app

RUN pip3 install kubernetes aiohttp

COPY . .

CMD python -m run
