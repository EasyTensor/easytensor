FROM golang:latest

RUN mkdir /app
WORKDIR /app
COPY . .
ENV GOBIN=/app/
RUN go install
RUN ls .
RUN chmod 755 /app/reporter

CMD /app/reporter
