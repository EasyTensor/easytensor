FROM python:3.9.0-alpine

RUN apk add gcc musl-dev libffi-dev


RUN mkdir /app
WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 8000
ENV PYTHONPATH=/app
CMD ./start_app.sh