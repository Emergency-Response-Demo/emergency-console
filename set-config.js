'use strict';

/* This script updates env.js with deployment environment variables. Allows keycloak off/on and changing mapbox tokens */

const replace = require('replace');

doReplace('url', process.env.AUTH_URL);
doReplace('enabled', process.env.KEYCLOAK);
doReplace('accessToken', process.env.TOKEN);

function doReplace(key, value) {
  const regex = key + ' = \'.*\'';
  const replacement = key + ' = \''+ value +'\'';

  replace({
    regex: regex,
    replacement: replacement,
    paths: [`${__dirname}/dist/assets/js/env.js`]
  });
}
