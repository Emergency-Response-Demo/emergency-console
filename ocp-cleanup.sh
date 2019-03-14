#!/usr/bin/env bash

oc project naps-emergency-response
oc delete all --selector app=emergency-console
