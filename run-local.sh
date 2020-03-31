#!/usr/bin/env bash

export PORT=4200
export INCIDENT="http://incident-service.apps.erdemo-df1a.open.redhat.com"
export ALERT="http://alert-service-naps-emergency-response.apps.753d.openshift.opentlc.com"
export RESPONDER="http://responder-service.apps.erdemo-df1a.open.redhat.com"
export MISSION="http://mission-service.apps.erdemo-df1a.open.redhat.com"
export PRIORITY="http://incident-priority-service.apps.erdemo-df1a.open.redhat.com"
export DISASTER="http://localhost:8081/"
export DISASTER_SIMULATOR="http://user60-disaster-simulator.apps.cluster-242b.242b.example.opentlc.com/"
export PROCESS_VIEWER="http://process-viewer.apps.erdemo-df1a.open.redhat.com"
export AUTH_URL="https://sso-sso.apps.erdemo-df1a.open.redhat.com/auth"
export KEYCLOAK="true"
export POLLING="10000"
export REALM="emergency-realm"
export CLIENTID="js"

# https://account.mapbox.com/access-tokens/
export TOKEN=${MAPBOX_TOKEN}

npm run start