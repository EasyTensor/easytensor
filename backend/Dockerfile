FROM python:3.9.0-alpine

RUN apk add bash gcc musl-dev libffi-dev libressl-dev postgresql postgresql-dev


RUN mkdir /app
WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip3 install -r requirements.txt
ENV DJANGO_SETTINGS_MODULE=backend.settings
COPY . .

ENV PYTHONPATH=/app
CMD ./start_app.sh
