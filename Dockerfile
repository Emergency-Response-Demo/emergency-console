FROM node:10

WORKDIR /usr/src/emergency-console

COPY . ./

RUN npm install
RUN npm run-script build

EXPOSE 8080

ENTRYPOINT [ "npm", "run", "start" ]
