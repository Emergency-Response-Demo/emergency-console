#!/usr/bin/env bash

# https://docs.openshift.com/container-platform/3.11/dev_guide/port_forwarding.html

name='postgresql'
port=5432

pod_name=$(oc get pods --selector app=${name} | { read line1 ; read line2 ; echo "$line2" ; } | awk '{print $1;}')

echo "Setup ${name} connection in your IDE with localhost and port ${port}"
oc port-forward ${pod_name} ${port}:${port}
