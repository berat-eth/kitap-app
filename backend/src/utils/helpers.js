"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidUUID = exports.getOffset = exports.sanitizeFilename = exports.generateSlug = exports.formatDuration = exports.paginatedResponse = exports.errorResponse = exports.successResponse = void 0;
var successResponse = function (data, message, meta) {
    return {
        success: true,
        data: data,
        message: message,
        meta: meta,
    };
};
exports.successResponse = successResponse;
var errorResponse = function (code, message, details) {
    return {
        success: false,
        error: {
            code: code,
            message: message,
            details: details,
        },
    };
};
exports.errorResponse = errorResponse;
var paginatedResponse = function (items, page, limit, total) {
    return {
        items: items,
        pagination: {
            page: page,
            limit: limit,
            total: total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
exports.paginatedResponse = paginatedResponse;
var formatDuration = function (seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = seconds % 60;
    if (hours > 0) {
        return "".concat(hours, "sa ").concat(minutes, "dk");
    }
    return "".concat(minutes, "dk ").concat(secs, "sn");
};
exports.formatDuration = formatDuration;
var generateSlug = function (text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
exports.generateSlug = generateSlug;
var sanitizeFilename = function (filename) {
    return filename
        .replace(/[^a-z0-9.-]/gi, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
};
exports.sanitizeFilename = sanitizeFilename;
var getOffset = function (page, limit) {
    return (page - 1) * limit;
};
exports.getOffset = getOffset;
var isValidUUID = function (uuid) {
    var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};
exports.isValidUUID = isValidUUID;
