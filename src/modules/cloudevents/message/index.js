'use strict';

const kafka = require("./kafka")
exports.KafkaMessage = {
    toEvent: kafka.deserialize
};