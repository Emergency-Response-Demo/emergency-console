'use strict';

let compression = require('compression');
let express = require('express');
let logger = require('morgan');
let https = require('https');
let http = require('http');
let fs = require('fs');
let path = require('path');
let proxy = require('http-proxy-middleware');
const { Kafka, logLevel } = require('kafkajs')
const { CloudEvent } = require("cloudevents");
const { KafkaMessage } = require("./src/modules/cloudevents")
let socketIO = require('socket.io');
let cors = require('cors');

let app = express();
app.use(cors());

// these ENV variables are only set for local development. Default to services on Openshift
app.set('port', process.env.PORT || 8080);
app.set('incident-service', process.env.INCIDENT || 'http://incident-service:8080');
app.set('disaster-service', process.env.DISASTER || 'http://disaster-service:8080');
app.set('alert-service', process.env.ALERT || 'http://alert-service:8080');
app.set('responder-service', process.env.RESPONDER || 'http://responder-service:8080');
app.set('mission-service', process.env.MISSION || 'http://mission-service:8080');
app.set('incident-priority-service', process.env.PRIORITY || 'http://incident-priority-service:8080');
app.set('process-viewer', process.env.PROCESS_VIEWER || 'http://process-viewer:8080');
app.set('responder-simulator', process.env.RESPONDER_SIMULATOR || 'http://responder-simulator:8080');
app.set('disaster-simulator', process.env.DISASTER_SIMULATOR || 'http://disaster-simulator:8080');
app.set('disaster-simulator-route', process.env.DISASTER_SIMULATOR_ROUTE || 'http://disaster-simulator:8080');
app.set('kafka-host', process.env.KAFKA_HOST.split(','));
app.set('kafka-message-topic', ['topic-mission-event', 'topic-responder-location-update', 'topic-incident-event', 'topic-responder-event', 'topic-incident-command', 'topic-responder-command']);
if (process.env.KAFKA_TOPIC) {
  app.set('kafka-message-topic', process.env.KAFKA_TOPIC.split(','));
}
app.set('kafka-groupid', process.env.KAFKA_GROUP_ID || 'emergency-console-group');

app.use(compression());

app.use(logger('combined'));

app.use(express.static(path.join(__dirname, 'dist')));

// setup server
const certConfig = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

let server = app.get('port') != 8080 ? https.createServer(certConfig, app) : http.createServer(app);

// setup socket
let io = socketIO(server);
io.on('connection', socket => {
  socket.emit('init', { message: 'Socket initialization' });
});
io.of('/shelters').on('connection', socket => {
  socket.emit('init', { message: 'Shelters init' });
});

// setup kafka connection
const kafka = new Kafka({
  logLevel: logLevel.INFO,
  brokers: app.get('kafka-host'),
  connectionTimeout: 3000
});
const consumer = kafka.consumer({ groupId: app.get('kafka-groupid') });

const run = async () => {
  console.log('Setting up Kafka client for ', app.get('kafka-host'));
  await consumer.connect();

  app.get('kafka-message-topic').forEach((t) => {
      const run2 = async () => {
          console.log('Setting up Kafka client for ', app.get('kafka-host'), 'on topic', t);
          await consumer.subscribe({ topic: t });
      }
      run2().catch(e => console.error(`[server.js] ${e.message}`, e))
  });

  await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
          try {
              const event = KafkaMessage.toEvent({ headers: message.headers, body: message.value });
              io.sockets.emit(topic, event);
          } catch (err) {
              console.error(`Error when transforming incoming message to CloudEvent. ${err.message}`, err);
              console.error('    Topic: ', topic);
              console.error('    Message:', message);
          }
      },
  })
};

run().catch(e => console.error(`[server.js] ${e.message}`, e))

// disaster server proxy
app.use(
  '/disaster-service/*',
  proxy({
    target: app.get('disaster-service'),
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/disaster-service': ''
    }
  })
);

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

// mission server proxy
app.use(
  '/mission-service/*',
  proxy({
    target: app.get('mission-service'),
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/mission-service': ''
    }
  })
);

// incident priority server proxy
app.use(
  '/incident-priority-service/*',
  proxy({
    target: app.get('incident-priority-service'),
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/incident-priority-service': ''
    }
  })
);

// process viewer proxy
app.use(
  '/process-viewer/*',
  proxy({
    target: app.get('process-viewer'),
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/process-viewer': ''
    }
  })
);

app.use(
  '/disaster-simulator$', function(req, res) {
    res.redirect(app.get("disaster-simulator-route"));
  }
);

// disaster simulator proxy
app.use(
  '/disaster-simulator/*',
  proxy({
    target: app.get('disaster-simulator'),
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/disaster-simulator': ''
    }
  })
);

// responder simulator proxy
app.use(
  '/responder-simulator/*',
  proxy({
    target: app.get('responder-simulator'),
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/responder-simulator': ''
    }
  })
);

// mapbox directions service
app.use(
  '/mapbox/*',
  proxy({
    target: 'https://api.mapbox.com',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/mapbox': ''
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

server.listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'));
});
