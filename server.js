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

app.set('port', process.argv[2] || 8080);

app.use(compression());

app.use(logger('combined'));

app.use(express.static(path.join(__dirname, 'dist')));

// configure backend api whitelist to prevent CORS errors
let proxyContext = '/springboot-api/*';
let proxyOptions = {
  target: 'http://springboot-app:8080',
  logLevel: 'debug',
  pathRewrite: {
    '^/springboot-app': ''
  }
};
let backendProxy = proxy(proxyOptions);
app.use(proxyContext, backendProxy);

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
