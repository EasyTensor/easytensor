FROM node:alpine

WORKDIR /app

COPY package.json /app/package.json
RUN npm install
RUN npm install -g serve

COPY . /app
# These need to be backed in at build time
# https://create-react-app.dev/docs/adding-custom-environment-variables/
ENV REACT_APP_BACKEND_SERVER_ADDRESS=app.easytensor.com
ENV REACT_APP_BACKEND_SERVER_PORT=443
ENV REACT_APP_BACKEND_SERVER_PROTOCOL=https

ENV REACT_APP_QUERY_SERVER_PORT=443
ENV REACT_APP_QUERY_SERVER_ADDRESS=app.easytensor.com
ENV REACT_APP_QUERY_SERVER_PROTOCOL=https

ENV REACT_APP_REPORTER_SERVER_PORT=443
ENV REACT_APP_REPORTER_SERVER_ADDRESS=app.easytensor.com
ENV REACT_APP_REPORTER_SERVER_PROTOCOL=https

RUN npm run build
#https://github.com/facebook/create-react-app/issues/8688#issuecomment-642309787
ENV CI=true


CMD serve -l 3000 -s build
