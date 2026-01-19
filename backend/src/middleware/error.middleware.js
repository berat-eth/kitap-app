"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
var helpers_1 = require("../utils/helpers");
var logger_1 = require("../utils/logger");
var errorHandler = function (err, req, res, next) {
    logger_1.default.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    // MySQL errors
    if (err.message.includes('ER_DUP_ENTRY')) {
        res.status(409).json((0, helpers_1.errorResponse)('DUPLICATE_ENTRY', 'Resource already exists'));
        return;
    }
    if (err.message.includes('ER_NO_REFERENCED_ROW')) {
        res.status(400).json((0, helpers_1.errorResponse)('INVALID_REFERENCE', 'Referenced resource does not exist'));
        return;
    }
    // Default error
    res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Internal server error'));
};
exports.errorHandler = errorHandler;
var notFoundHandler = function (req, res) {
    res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', "Route ".concat(req.method, " ").concat(req.path, " not found")));
};
exports.notFoundHandler = notFoundHandler;
