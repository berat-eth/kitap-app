"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
var zod_1 = require("zod");
var helpers_1 = require("../utils/helpers");
var validate = function (schema) {
    return function (req, res, next) {
        try {
            schema.parse(__assign(__assign(__assign({}, req.body), req.params), req.query));
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json((0, helpers_1.errorResponse)('VALIDATION_ERROR', 'Validation failed', error.errors));
                return;
            }
            next(error);
        }
    };
};
exports.validate = validate;
