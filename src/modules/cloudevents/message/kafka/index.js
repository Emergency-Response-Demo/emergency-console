'use strict';

const headers_1 = require("./headers");
const parsers = require("../../parsers");
const validation_1 = require("../../event/validation")
const { CONSTANTS, Mode, ValidationError, CloudEvent } = require("cloudevents");

function deserialize(message) {
    const cleanHeaders = headers_1.sanitize(message.headers);
    const mode = getMode(cleanHeaders);
    let version = getVersion(mode, cleanHeaders, message.body);
    if (version !== "0.3" /* V03 */ && version !== "1.0" /* V1 */) {
        console.error(`Unknown spec version ${version}. Default to ${"1.0" /* V1 */}`);
        version = "1.0" /* V1 */;
    }
    switch (mode) {
        case Mode.BINARY:
            return parseBinary(message, version);
        case Mode.STRUCTURED:
            return parseStructured(message, version);
        default:
            throw new ValidationError("Unknown Message mode");
    }
    return null;
}
exports.deserialize = deserialize;

/**
 * Determines the transport mode (binary or structured) based
 * on the incoming headers.
 */
function getMode(headers) {
    const contentType = headers[CONSTANTS.HEADER_CONTENT_TYPE];
    if (contentType && contentType.startsWith(CONSTANTS.MIME_CE)) {
        return Mode.STRUCTURED;
    }
    if (headers[CONSTANTS.CE_HEADERS.ID]) {
        return Mode.BINARY;
    }
    throw new ValidationError("no cloud event detected");
}

function getVersion(mode, headers, body) {
    if (mode === Mode.BINARY) {
        // Check the headers for the version
        const versionHeader = headers[CONSTANTS.CE_HEADERS.SPEC_VERSION];
        if (versionHeader) {
            return versionHeader;
        }
    }
    else {
        // structured mode - the version is in the body
        let bodyValue = null;
        if (!body) {
            bodyValue = "";
        } else {
            bodyValue = body.toString();
        }
        return JSON.parse(bodyValue).specversion;
    }
    return "1.0" /* V1 */;
}

/**
 * Parses an incoming HTTP Message, converting it to a {CloudEvent}
 * instance if it conforms to the Cloud Event specification for this receiver.
 */
function parseBinary(message, version) {
    let body = message.body;
    const headers = headers_1.sanitize(message.headers);
    if (!headers)
        throw new ValidationError("headers is null or undefined");
    if (body) {
        validation_1.isBufferOrStringOrObjectOrThrow(body, new ValidationError("payload must be a buffer, an object or a string"));
    }
    if (headers[CONSTANTS.CE_HEADERS.SPEC_VERSION] &&
        headers[CONSTANTS.CE_HEADERS.SPEC_VERSION] !== "0.3" /* V03 */ &&
        headers[CONSTANTS.CE_HEADERS.SPEC_VERSION] !== "1.0" /* V1 */) {
        throw new ValidationError(`invalid spec version ${headers[CONSTANTS.CE_HEADERS.SPEC_VERSION]}`);
    }
    const eventObj = {};
    const parserMap = version === "1.0" /* V1 */ ? headers_1.v1binaryParsers : headers_1.v1binaryParsers;
    for (const header in parserMap) {
        if (headers[header]) {
            const mappedParser = parserMap[header];
            eventObj[mappedParser.name] = mappedParser.parser.parse(headers[header]);
            delete headers[header];
        }
    }
    // Every unprocessed header can be an extension
    for (const header in headers) {
        if (header.startsWith(CONSTANTS.EXTENSIONS_PREFIX.replace(/_/g, "-"))) {
            eventObj[header.substring(CONSTANTS.EXTENSIONS_PREFIX.length)] = headers[header];
        }
    }
    const parser = parsers.parserByContentType[eventObj.datacontenttype];
    if (parser && body) {
        body = parser.parse(body);
    }
    // At this point, if the datacontenttype is application/json and the datacontentencoding is base64
    // then the data has already been decoded as a string, then parsed as JSON. We don't need to have
    // the datacontentencoding property set - in fact, it's incorrect to do so.
    if (eventObj.datacontenttype === CONSTANTS.MIME_JSON && eventObj.datacontentencoding === CONSTANTS.ENCODING_BASE64) {
        delete eventObj.datacontentencoding;
    }
    return new CloudEvent(Object.assign(Object.assign({}, eventObj), { data: body }), false);
}

/**
 * Creates a new CloudEvent instance based on the provided payload and headers.
 *
 * @param {Message} message the incoming Message
 * @param {Version} version the spec version of this message (v1 or v03)
 * @returns {CloudEvent} a new CloudEvent instance for the provided headers and payload
 * @throws {ValidationError} if the payload and header combination do not conform to the spec
 */
function parseStructured(message, version) {
    const payload = message.body;
    const headers = message.headers;
    if (!payload)
        throw new ValidationError("payload is null or undefined");
    if (!headers)
        throw new ValidationError("headers is null or undefined");
    validation_1.isBufferOrStringOrObjectOrThrow(payload, new ValidationError("payload must be a buffer, an object or a string"));
    if (headers[CONSTANTS.CE_HEADERS.SPEC_VERSION] &&
        headers[CONSTANTS.CE_HEADERS.SPEC_VERSION] != "0.3" /* V03 */ &&
        headers[CONSTANTS.CE_HEADERS.SPEC_VERSION] != "1.0" /* V1 */) {
        throw new ValidationError(`invalid spec version ${headers[CONSTANTS.CE_HEADERS.SPEC_VERSION]}`);
    }
    // Clone and low case all headers names
    const sanitizedHeaders = headers_1.sanitize(headers);
    const contentType = sanitizedHeaders[CONSTANTS.HEADER_CONTENT_TYPE];
    const parser = contentType ? parsers.parserByContentType[contentType] : new parsers.JSONParser();
    if (!parser)
        throw new ValidationError(`invalid content type ${sanitizedHeaders[CONSTANTS.HEADER_CONTENT_TYPE]}`);
    const incoming = Object.assign({}, parser.parse(payload));
    const eventObj = {};
    const parserMap = version === "1.0" /* V1 */ ? headers_1.v1structuredParsers : headers_1.v03structuredParsers;
    for (const key in parserMap) {
        const property = incoming[key];
        if (property) {
            const parser = parserMap[key];
            eventObj[parser.name] = parser.parser.parse(property);
        }
        delete incoming[key];
    }
    // extensions are what we have left after processing all other properties
    for (const key in incoming) {
        eventObj[key] = incoming[key];
    }
    // data_base64 is a property that only exists on V1 events. For V03 events,
    // there will be a .datacontentencoding property, and the .data property
    // itself will be encoded as base64
    if (eventObj.data_base64 || eventObj.datacontentencoding === CONSTANTS.ENCODING_BASE64) {
        const data = eventObj.data_base64 || eventObj.data;
        eventObj.data = new Uint32Array(Buffer.from(data, "base64"));
        delete eventObj.data_base64;
        delete eventObj.datacontentencoding;
    }
    return new CloudEvent(eventObj, false);
}