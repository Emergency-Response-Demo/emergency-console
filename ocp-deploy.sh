#!/usr/bin/env bash

oc project naps-emergency-response

oc new-app \
--image-stream=nodejs \
--code=https://github.com/NAPS-emergency-response-project/frontend-manager \
--name=frontend-manager

oc expose svc/frontend-manager
