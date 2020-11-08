FROM node:alpine

WORKDIR /app

COPY package.json /app/package.json
RUN npm install
COPY . /app

#https://github.com/facebook/create-react-app/issues/8688#issuecomment-642309787
ENV CI=true

CMD npm start
