FROM python:3.9.0

RUN apt update && apt install -y vim && rm -rf /var/lib/apt/lists/*

RUN mkdir /app
WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip3 install -r requirements.txt

ENV PYTHONPATH=/app/:/models/model/

COPY . .
CMD ./start_app.sh