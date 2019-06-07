#!/usr/bin/env bash

oc project naps-emergency-response

oc new-app \
--image-stream=nodejs \
--code=https://github.com/Emergency-Response-Demo/emergency-console \
--name=emergency-console

oc create route edge --service=emergency-console --cert=server.cert --key=server.key

oc set env --from=configmap/sso-config dc/emergency-console

# https://account.mapbox.com/access-tokens/
oc create configmap emergency-console-config \
--from-literal=TOKEN=${MAPBOX_TOKEN} \
--from-literal=POLLING=10000

oc set env --from=configmap/emergency-console-config dc/emergency-console
