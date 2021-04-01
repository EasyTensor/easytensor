FROM node:15.12.0-alpine3.10

RUN apk add git

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

ENV REACT_APP_STRIPE_PUBLIC_KEY="pk_live_51IWi1NDCzbZohuMOF3sdxC3LbDp7V539re2UTj2QSpe4kuZr4X1HXtx2cka7wc1nITavIv2KBBtn6du0cnwOnKXH00f7reI4Kq"

RUN npm run build
#https://github.com/facebook/create-react-app/issues/8688#issuecomment-642309787
ENV CI=true


CMD serve -l 3000 -s build
