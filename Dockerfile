# buildah bud -f Dockerfile -t quay.io/jbride/emergency-console:0.0.1 .
# podman run -it --rm -d --publish 3000:3000 --name emergency-console quay.io/jbride/emergency-console:0.0.1

# ENV VARIABLES:
#  https://catalog.redhat.com/software/containers/ubi8/nodejs-12/5d3fff015a13461f5fb8635a?container-tabs=overview&gti-tabs=registry-tokens


FROM registry.redhat.io/ubi8/nodejs-12:1-45

WORKDIR /usr/src/emergency-console

COPY . ./

RUN npm install
RUN npm run-script build

RUN chmod 777 dist/assets/js/env.js

EXPOSE 8080

ENTRYPOINT [ "npm", "run", "start" ]
