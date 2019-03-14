#!/usr/bin/env bash

oc project naps-emergency-response

oc new-app \
--image-stream=nodejs \
--code=https://github.com/NAPS-emergency-response-project/emergency-console \
--name=emergency-console

oc expose svc/emergency-console
