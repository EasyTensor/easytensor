FROM python:3.9.0-alpine

RUN apk add bash curl gcc musl-dev libffi-dev libressl-dev postgresql \
    postgresql-dev openssl-dev cargo

RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
RUN source ~/.poetry/env

RUN mkdir /app
WORKDIR /app
COPY pyproject.toml poetry.lock /app/
RUN ~/.poetry/bin/poetry config virtualenvs.create false
RUN ~/.poetry/bin/poetry install --verbose
ENV DJANGO_SETTINGS_MODULE=backend.settings
COPY . .

ENV PYTHONPATH=/app
CMD ./start_app.sh
