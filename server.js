'use strict';

let compression = require('compression');
let express = require('express');
let logger = require('morgan');
let https = require('https');
let http = require('http');
let fs = require('fs');
let path = require('path');
let proxy = require('http-proxy-middleware');

let app = express();

// these ENV variables are only set for local development. Default to services on Openshift
app.set('port', process.env.PORT || 8080);
app.set('incident-service', process.env.INCIDENT || 'http://incident-service:8080');
app.set('alert-service', process.env.ALERT || 'http://alert-service:8080');
app.set('responder-service', process.env.RESPONDER || 'http://responder-service:8080');

app.use(compression());

app.use(logger('combined'));

app.use(express.static(path.join(__dirname, 'dist')));

// incident server proxy
app.use(
  '/incident-service/*',
  proxy({
    target: app.get('incident-service'),
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/incident-service': ''
    }
  })
);

// alert server proxy
app.use(
  '/alert-service/*',
  proxy({
    target: app.get('alert-service'),
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/alert-service': ''
    }
  })
);

// responder server proxy
app.use(
  '/responder-service/*',
  proxy({
    target: app.get('responder-service'),
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/responder-service': ''
    }
  })
);

app.use((req, res) => {
  // respond with index to process links
  if (req.accepts('html')) {
    res.sendFile(__dirname + '/dist/index.html');
    return;
  }

  // otherwise resource was not found
  res.status(404);
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  res.type('txt').send('Not found');
});

// start server
http.createServer(app).listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'));
});
