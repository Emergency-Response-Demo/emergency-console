#!/usr/bin/env bash

oc project naps-emergency-response

app_name=emergency-console
oc new-app \
--image-stream=nodejs \
--code=https://github.com/NAPS-emergency-response-project/${app_name} \
--name=${app_name}

oc create route edge --service=${app_name} --cert=server.cert --key=server.key

oc set env --from=configmap/sso-config dc/${app_name}
