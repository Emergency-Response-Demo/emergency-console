#!/usr/bin/env bash

export PORT=4200
export INCIDENT="http://user4-incident-service.apps.cluster-e222.e222.example.opentlc.com"
export KAFKA_HOST="localhost:9092"
export ALERT="http://alert-service-naps-emergency-response.apps.753d.openshift.opentlc.com"
export RESPONDER="http://user4-responder-service.apps.cluster-e222.e222.example.opentlc.com"
export MISSION="http://user4-mission-service.apps.cluster-e222.e222.example.opentlc.com"
export PROCESS_VIEWER="http://user4-process-viewer.apps.cluster-e222.e222.example.opentlc.com"
export AUTH_URL="https://sso-user-sso.apps.cluster-e222.e222.example.opentlc.com/auth"
export KEYCLOAK="false"
export POLLING="10000"
export REALM="emergency-realm"
export CLIENTID="js"

export JASON_MAPBOX_TOKEN=pk.eyJ1IjoiamFzb25yZWRoYXQiLCJhIjoiY2lseHVmZmkwMDVzMTgza3NiazZzZXg4ciJ9.5iDS06m7GN2wuv2hwQePpQ
export TOKEN=${JASON_MAPBOX_TOKEN}

# https://account.mapbox.com/access-tokens/
export TOKEN="pk.eyJ1IjoiYW5keWtyb2hnIiwiYSI6ImNrNTQ4OXhxejBncXgzdG1jbW5rNDltd2UifQ.RZRBlpS3XZcnbs13uhwVlg"

npm run start
