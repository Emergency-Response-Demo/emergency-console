#!/bin/bash

oc project naps-emergency-response
oc delete all --selector app=frontend-manager
