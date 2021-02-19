'use strict';

const { CONSTANTS, ValidationError } = require("cloudevents");
const parsers = require("../../parsers");

/**
 * Sanitizes incoming headers:
 * - transform to String if Buffer
 * - replaces '_' with '-' 
 */
function sanitize(headers) {
    const sanitized = {};
    Array.from(Object.keys(headers))
        .filter((header) => Object.hasOwnProperty.call(headers, header))
        .forEach((header) => {
            let headerValue = null;
            if (!(headers[header])) {
                headerValue = "";
            } else {
                headerValue = headers[header].toString();
            }
            sanitized[header.replace(/_/g, "-").toLowerCase()] = headerValue; 
        });
    return sanitized;
}
exports.sanitize = sanitize;

function parser(name, parser = new parsers.PassThroughParser()) {
    return { name: name, parser: parser };
}

exports.v1binaryParsers = Object.freeze({
    [CONSTANTS.CE_HEADERS.TYPE]: parser(CONSTANTS.CE_ATTRIBUTES.TYPE),
    [CONSTANTS.CE_HEADERS.SPEC_VERSION]: parser(CONSTANTS.CE_ATTRIBUTES.SPEC_VERSION),
    [CONSTANTS.CE_HEADERS.SOURCE]: parser(CONSTANTS.CE_ATTRIBUTES.SOURCE),
    [CONSTANTS.CE_HEADERS.ID]: parser(CONSTANTS.CE_ATTRIBUTES.ID),
    [CONSTANTS.CE_HEADERS.TIME]: parser(CONSTANTS.CE_ATTRIBUTES.TIME, new parsers.DateParser()),
    [CONSTANTS.BINARY_HEADERS_1.DATA_SCHEMA]: parser(CONSTANTS.STRUCTURED_ATTRS_1.DATA_SCHEMA),
    [CONSTANTS.CE_HEADERS.SUBJECT]: parser(CONSTANTS.CE_ATTRIBUTES.SUBJECT),
    [CONSTANTS.CE_ATTRIBUTES.CONTENT_TYPE]: parser(CONSTANTS.CE_ATTRIBUTES.CONTENT_TYPE),
    [CONSTANTS.HEADER_CONTENT_TYPE]: parser(CONSTANTS.CE_ATTRIBUTES.CONTENT_TYPE),
});

exports.v1structuredParsers = Object.freeze({
    [CONSTANTS.CE_ATTRIBUTES.TYPE]: parser(CONSTANTS.CE_ATTRIBUTES.TYPE),
    [CONSTANTS.CE_ATTRIBUTES.SPEC_VERSION]: parser(CONSTANTS.CE_ATTRIBUTES.SPEC_VERSION),
    [CONSTANTS.CE_ATTRIBUTES.SOURCE]: parser(CONSTANTS.CE_ATTRIBUTES.SOURCE),
    [CONSTANTS.CE_ATTRIBUTES.ID]: parser(CONSTANTS.CE_ATTRIBUTES.ID),
    [CONSTANTS.CE_ATTRIBUTES.TIME]: parser(CONSTANTS.CE_ATTRIBUTES.TIME, new parsers.DateParser()),
    [CONSTANTS.STRUCTURED_ATTRS_1.DATA_SCHEMA]: parser(CONSTANTS.STRUCTURED_ATTRS_1.DATA_SCHEMA),
    [CONSTANTS.CE_ATTRIBUTES.CONTENT_TYPE]: parser(CONSTANTS.CE_ATTRIBUTES.CONTENT_TYPE),
    [CONSTANTS.CE_ATTRIBUTES.SUBJECT]: parser(CONSTANTS.CE_ATTRIBUTES.SUBJECT),
    [CONSTANTS.CE_ATTRIBUTES.DATA]: parser(CONSTANTS.CE_ATTRIBUTES.DATA),
    [CONSTANTS.STRUCTURED_ATTRS_1.DATA_BASE64]: parser(CONSTANTS.STRUCTURED_ATTRS_1.DATA_BASE64),
});

exports.v03structuredParsers = Object.freeze({
    [CONSTANTS.CE_ATTRIBUTES.TYPE]: parser(CONSTANTS.CE_ATTRIBUTES.TYPE),
    [CONSTANTS.CE_ATTRIBUTES.SPEC_VERSION]: parser(CONSTANTS.CE_ATTRIBUTES.SPEC_VERSION),
    [CONSTANTS.CE_ATTRIBUTES.SOURCE]: parser(CONSTANTS.CE_ATTRIBUTES.SOURCE),
    [CONSTANTS.CE_ATTRIBUTES.ID]: parser(CONSTANTS.CE_ATTRIBUTES.ID),
    [CONSTANTS.CE_ATTRIBUTES.TIME]: parser(CONSTANTS.CE_ATTRIBUTES.TIME, new parsers.DateParser()),
    [CONSTANTS.STRUCTURED_ATTRS_03.SCHEMA_URL]: parser(CONSTANTS.STRUCTURED_ATTRS_03.SCHEMA_URL),
    [CONSTANTS.STRUCTURED_ATTRS_03.CONTENT_ENCODING]: parser(CONSTANTS.STRUCTURED_ATTRS_03.CONTENT_ENCODING),
    [CONSTANTS.CE_ATTRIBUTES.CONTENT_TYPE]: parser(CONSTANTS.CE_ATTRIBUTES.CONTENT_TYPE),
    [CONSTANTS.CE_ATTRIBUTES.SUBJECT]: parser(CONSTANTS.CE_ATTRIBUTES.SUBJECT),
    [CONSTANTS.CE_ATTRIBUTES.DATA]: parser(CONSTANTS.CE_ATTRIBUTES.DATA),
});