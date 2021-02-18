'use strict';

const { ValidationError, CONSTANTS } = require("cloudevents");
const validation_1 = require("./event/validation")

class Parser {
}
exports.Parser = Parser;

class JSONParser {
    constructor(decorator) {
        this.decorator = decorator;
    }
    /**
     * Parses the payload with an optional decorator
     * @param {object|string} payload the JSON payload
     * @return {object} the parsed JSON payload.
     */
    parse(payload) {
        if (this.decorator) {
            payload = this.decorator.parse(payload);
        }
        validation_1.isDefinedOrThrow(payload, new ValidationError("null or undefined payload"));
        validation_1.isBufferOrStringOrObjectOrThrow(payload, new ValidationError("invalid payload type, allowed are: uffer, string or object"));
        const parseJSON = (v) => (validation_1.isBuffer(v) ? JSON.parse(v.toString()) : validation_1.isString(v) ? JSON.parse(v) : v);
        return parseJSON(payload);
    }
}
exports.JSONParser = JSONParser;

class PassThroughParser extends Parser {
    parse(payload) {
        return payload;
    }
}
exports.PassThroughParser = PassThroughParser;

class DateParser extends Parser {
    parse(payload) {
        let date = new Date(Date.parse(payload));
        if (date.toString() === "Invalid Date") {
            date = new Date();
        }
        return date.toISOString();
    }
}
exports.DateParser = DateParser;

const jsonParser = new JSONParser();
exports.parserByContentType = {
    [CONSTANTS.MIME_JSON]: jsonParser,
    [CONSTANTS.MIME_CE_JSON]: jsonParser,
    [CONSTANTS.DEFAULT_CONTENT_TYPE]: jsonParser,
    [CONSTANTS.DEFAULT_CE_CONTENT_TYPE]: jsonParser,
    [CONSTANTS.MIME_OCTET_STREAM]: new PassThroughParser(),
};