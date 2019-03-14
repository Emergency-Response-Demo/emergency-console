'use strict';

/* This script updates a JSON data file with Keycloak configuration data about server address and keycloak enabled/disabled */

const editJsonFile = require('edit-json-file');
const keycloakPath = `${__dirname}/dist/assets/data/keycloak.json`;
const authUrl = process.env.AUTH_URL || 'https://sso/auth';
const enabled = process.env.KEYCLOAK || false;

let file = editJsonFile(keycloakPath);

const urlKey = 'url';
console.log(`Setting \"${urlKey}\" to ${authUrl} in ${keycloakPath}\n`);
file.set(urlKey, authUrl);

const enabledKey = 'enabled';
console.log(`Setting \"${enabledKey}\" to ${enabled} in ${keycloakPath}\n`);
file.set(enabledKey, enabled);

file.save();

console.log(file.get());
