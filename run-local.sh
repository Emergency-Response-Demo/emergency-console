#!/usr/bin/env bash

export PORT=4200
export INCIDENT="http://incident-service-naps-emergency-response.apps.753d.openshift.opentlc.com"
export ALERT="http://alert-service-naps-emergency-response.apps.753d.openshift.opentlc.com"
export RESPONDER="http://responder-service-naps-emergency-response.apps.753d.openshift.opentlc.com"
export MISSION="http://mission-service-naps-emergency-response.apps.753d.openshift.opentlc.com"
export AUTH_URL="https://sso-naps-emergency-response.apps.753d.openshift.opentlc.com/auth"
export KEYCLOAK="true"
export TOKEN="pk.eyJ1IjoibWVjaGV2YXJyaWEiLCJhIjoiY2pxbXNuMXF0MGwzNTQ5bzJwNGtyMTRqdyJ9.WZfALlPxuOveabQDrroLcQ"

npm run start
