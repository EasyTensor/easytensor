FROM golang:latest

RUN mkdir /app
WORKDIR /app
COPY . .
ENV GOBIN=/app/
RUN go install
RUN chmod 755 /app/query

CMD /app/query
