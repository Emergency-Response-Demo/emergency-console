'use strict';

exports.isString = (v) => typeof v === "string";
exports.isObject = (v) => typeof v === "object";
exports.isBuffer = (value) => value instanceof Buffer;
exports.isDefined = (v) => v && typeof v !== "undefined";
exports.isDefinedOrThrow = (v, t) => exports.isDefined(v)
    ? true
    : (() => {
        throw t;
    })();
exports.isBufferOrStringOrObjectOrThrow = (v, t) => exports.isBuffer(v)
    ? true
    : exports.isString(v)
        ? true
        : exports.isObject(v)
            ? true
            : (() => {
                throw t;
    })();