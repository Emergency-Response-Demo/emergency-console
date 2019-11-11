FROM node:10

WORKDIR /usr/src/emergency-console

COPY . ./

RUN npm install
RUN npm run-script build

RUN chmod 777 dist/assets/js/env.js

EXPOSE 8080

ENTRYPOINT [ "npm", "run", "start" ]
