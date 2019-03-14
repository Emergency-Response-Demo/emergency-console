#!/usr/bin/env bash

oc project naps-emergency-response

oc new-app \
--image-stream=nodejs \
--code=https://github.com/NAPS-emergency-response-project/emergency-console \
--name=emergency-console

oc create route edge --service=nodejs-app --cert=server.cert --key=server.key

oc set env --from=configmap/ntier-config dc/nodejs-app
