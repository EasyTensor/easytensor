FROM python:3.9.0-alpine

RUN mkdir /app
WORKDIR /app
COPY Pipfile /app/Pipfile
RUN pip3 install -r Pipfile

COPY . .

EXPOSE 8000
ENV PYTHONPATH=/app
CMD ./start_app.sh