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
exports.AdminController = void 0;
var database_1 = require("../config/database");
var helpers_1 = require("../utils/helpers");
var AdminController = /** @class */ (function () {
    function AdminController() {
    }
    AdminController.getDashboardStats = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, userStats, bookStats, listeningStats, revenueStats, error_1;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 5, , 6]);
                        if (!req.user || req.user.role !== 'admin') {
                            res.status(403).json((0, helpers_1.errorResponse)('FORBIDDEN', 'Admin access required'));
                            return [2 /*return*/];
                        }
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute("SELECT \n          COUNT(*) as total,\n          SUM(CASE WHEN last_active_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as active\n         FROM users WHERE role = 'user'")];
                    case 1:
                        userStats = (_g.sent())[0];
                        return [4 /*yield*/, pool.execute("SELECT \n          COUNT(*) as total,\n          SUM(CASE WHEN is_published = true THEN 1 ELSE 0 END) as published\n         FROM books")];
                    case 2:
                        bookStats = (_g.sent())[0];
                        return [4 /*yield*/, pool.execute("SELECT \n          COALESCE(SUM(duration_seconds), 0) / 3600 as total_hours\n         FROM user_progress up\n         LEFT JOIN chapters ch ON up.chapter_id = ch.id\n         WHERE up.is_completed = true")];
                    case 3:
                        listeningStats = (_g.sent())[0];
                        return [4 /*yield*/, pool.execute("SELECT COALESCE(SUM(amount), 0) as total\n         FROM donations\n         WHERE payment_status = 'completed'\n         AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)")];
                    case 4:
                        revenueStats = (_g.sent())[0];
                        res.status(200).json((0, helpers_1.successResponse)({
                            users: {
                                total: ((_a = userStats[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
                                active: ((_b = userStats[0]) === null || _b === void 0 ? void 0 : _b.active) || 0,
                            },
                            books: {
                                total: ((_c = bookStats[0]) === null || _c === void 0 ? void 0 : _c.total) || 0,
                                published: ((_d = bookStats[0]) === null || _d === void 0 ? void 0 : _d.published) || 0,
                            },
                            listening: {
                                totalHours: ((_e = listeningStats[0]) === null || _e === void 0 ? void 0 : _e.total_hours) || 0,
                            },
                            revenue: {
                                monthly: ((_f = revenueStats[0]) === null || _f === void 0 ? void 0 : _f.total) || 0,
                            },
                        }));
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _g.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to fetch dashboard stats'));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    AdminController.getUsers = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, _a, _b, page, _c, limit, offset, users, countResult, total, error_2;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        if (!req.user || req.user.role !== 'admin') {
                            res.status(403).json((0, helpers_1.errorResponse)('FORBIDDEN', 'Admin access required'));
                            return [2 /*return*/];
                        }
                        pool = (0, database_1.getPool)();
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 20 : _c;
                        offset = (Number(page) - 1) * Number(limit);
                        return [4 /*yield*/, pool.execute("SELECT id, device_id, email, name, avatar_url, role, is_active, created_at, last_active_at\n         FROM users\n         WHERE role = 'user'\n         ORDER BY created_at DESC\n         LIMIT ? OFFSET ?", [Number(limit), offset])];
                    case 1:
                        users = (_e.sent())[0];
                        return [4 /*yield*/, pool.execute('SELECT COUNT(*) as total FROM users WHERE role = ?', ['user'])];
                    case 2:
                        countResult = (_e.sent())[0];
                        total = ((_d = countResult[0]) === null || _d === void 0 ? void 0 : _d.total) || 0;
                        res.status(200).json((0, helpers_1.successResponse)(users, undefined, {
                            page: Number(page),
                            limit: Number(limit),
                            total: total,
                            totalPages: Math.ceil(total / Number(limit)),
                        }));
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _e.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to fetch users'));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AdminController.getUserById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, pool, users, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!req.user || req.user.role !== 'admin') {
                            res.status(403).json((0, helpers_1.errorResponse)('FORBIDDEN', 'Admin access required'));
                            return [2 /*return*/];
                        }
                        id = req.params.id;
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute('SELECT * FROM users WHERE id = ?', [id])];
                    case 1:
                        users = (_a.sent())[0];
                        if (users.length === 0) {
                            res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', 'User not found'));
                            return [2 /*return*/];
                        }
                        res.status(200).json((0, helpers_1.successResponse)(users[0]));
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to fetch user'));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AdminController.updateUser = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, pool, updates, values, allowedFields, _i, allowedFields_1, field, users, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!req.user || req.user.role !== 'admin') {
                            res.status(403).json((0, helpers_1.errorResponse)('FORBIDDEN', 'Admin access required'));
                            return [2 /*return*/];
                        }
                        id = req.params.id;
                        pool = (0, database_1.getPool)();
                        updates = [];
                        values = [];
                        allowedFields = ['name', 'avatar_url', 'is_active'];
                        for (_i = 0, allowedFields_1 = allowedFields; _i < allowedFields_1.length; _i++) {
                            field = allowedFields_1[_i];
                            if (req.body[field] !== undefined) {
                                updates.push("".concat(field, " = ?"));
                                values.push(req.body[field]);
                            }
                        }
                        if (updates.length === 0) {
                            res.status(400).json((0, helpers_1.errorResponse)('VALIDATION_ERROR', 'No fields to update'));
                            return [2 /*return*/];
                        }
                        values.push(id);
                        return [4 /*yield*/, pool.execute("UPDATE users SET ".concat(updates.join(', '), " WHERE id = ?"), values)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, pool.execute('SELECT * FROM users WHERE id = ?', [id])];
                    case 2:
                        users = (_a.sent())[0];
                        res.status(200).json((0, helpers_1.successResponse)(users[0], 'User updated successfully'));
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to update user'));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AdminController.deleteUser = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, pool, existing, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!req.user || req.user.role !== 'admin') {
                            res.status(403).json((0, helpers_1.errorResponse)('FORBIDDEN', 'Admin access required'));
                            return [2 /*return*/];
                        }
                        id = req.params.id;
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute('SELECT role FROM users WHERE id = ?', [
                                id,
                            ])];
                    case 1:
                        existing = (_a.sent())[0];
                        if (existing.length === 0) {
                            res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', 'User not found'));
                            return [2 /*return*/];
                        }
                        if (existing[0].role === 'admin') {
                            res.status(403).json((0, helpers_1.errorResponse)('FORBIDDEN', 'Cannot delete admin user'));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, pool.execute('DELETE FROM users WHERE id = ?', [id])];
                    case 2:
                        _a.sent();
                        res.status(200).json((0, helpers_1.successResponse)(null, 'User deleted successfully'));
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to delete user'));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return AdminController;
}());
exports.AdminController = AdminController;
