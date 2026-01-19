"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthService = void 0;
var bcryptjs_1 = require("bcryptjs");
var jsonwebtoken_1 = require("jsonwebtoken");
var database_1 = require("../config/database");
var env_1 = require("../config/env");
var logger_1 = require("../utils/logger");
var AdminAuthService = /** @class */ (function () {
    function AdminAuthService() {
    }
    AdminAuthService.login = function (email, password) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, users, user, isValid, payload, accessToken, refreshToken;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute('SELECT * FROM users WHERE email = ? AND role = ?', [email, 'admin'])];
                    case 1:
                        users = (_a.sent())[0];
                        if (users.length === 0) {
                            throw new Error('Invalid email or password');
                        }
                        user = users[0];
                        if (!user.password_hash) {
                            throw new Error('Invalid email or password');
                        }
                        return [4 /*yield*/, bcryptjs_1.default.compare(password, user.password_hash)];
                    case 2:
                        isValid = _a.sent();
                        if (!isValid) {
                            throw new Error('Invalid email or password');
                        }
                        if (!user.is_active) {
                            throw new Error('Account is inactive');
                        }
                        payload = {
                            userId: user.id,
                            email: user.email,
                            role: user.role,
                        };
                        accessToken = jsonwebtoken_1.default.sign(payload, env_1.config.adminJwt.secret, {
                            expiresIn: env_1.config.adminJwt.expiresIn,
                        });
                        refreshToken = jsonwebtoken_1.default.sign(payload, env_1.config.adminJwt.refreshSecret, {
                            expiresIn: env_1.config.adminJwt.refreshExpiresIn,
                        });
                        // Update last_active_at
                        return [4 /*yield*/, pool.execute('UPDATE users SET last_active_at = NOW() WHERE id = ?', [user.id])];
                    case 3:
                        // Update last_active_at
                        _a.sent();
                        logger_1.default.info("Admin login: ".concat(email));
                        return [2 /*return*/, {
                                user: user,
                                tokens: {
                                    accessToken: accessToken,
                                    refreshToken: refreshToken,
                                },
                            }];
                }
            });
        });
    };
    AdminAuthService.verifyToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var decoded;
            return __generator(this, function (_a) {
                try {
                    decoded = jsonwebtoken_1.default.verify(token, env_1.config.adminJwt.secret);
                    return [2 /*return*/, decoded];
                }
                catch (error) {
                    if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                        throw new Error('Invalid token');
                    }
                    if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                        throw new Error('Token expired');
                    }
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    AdminAuthService.refreshToken = function (refreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            var decoded, pool, users, payload, accessToken, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.config.adminJwt.refreshSecret);
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute('SELECT * FROM users WHERE id = ? AND email = ? AND role = ? AND is_active = ?', [decoded.userId, decoded.email, 'admin', true])];
                    case 1:
                        users = (_a.sent())[0];
                        if (users.length === 0) {
                            throw new Error('Invalid refresh token');
                        }
                        payload = {
                            userId: decoded.userId,
                            email: decoded.email,
                            role: decoded.role,
                        };
                        accessToken = jsonwebtoken_1.default.sign(payload, env_1.config.adminJwt.secret, {
                            expiresIn: env_1.config.adminJwt.expiresIn,
                        });
                        return [2 /*return*/, { accessToken: accessToken }];
                    case 2:
                        error_1 = _a.sent();
                        if (error_1 instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                            throw new Error('Invalid refresh token');
                        }
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AdminAuthService.hashPassword = function (password) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, bcryptjs_1.default.hash(password, 10)];
            });
        });
    };
    AdminAuthService.comparePassword = function (password, hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, bcryptjs_1.default.compare(password, hash)];
            });
        });
    };
    return AdminAuthService;
}());
exports.AdminAuthService = AdminAuthService;
