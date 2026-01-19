"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
var helpers_1 = require("../utils/helpers");
var requireRole = function () {
    var roles = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        roles[_i] = arguments[_i];
    }
    return function (req, res, next) {
        if (!req.user) {
            res.status(401).json((0, helpers_1.errorResponse)('UNAUTHORIZED', 'Authentication required'));
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json((0, helpers_1.errorResponse)('FORBIDDEN', "Access denied. Required role: ".concat(roles.join(' or '))));
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
