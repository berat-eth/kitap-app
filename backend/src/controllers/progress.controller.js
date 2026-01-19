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
exports.ProgressController = void 0;
var database_1 = require("../config/database");
var helpers_1 = require("../utils/helpers");
var ProgressController = /** @class */ (function () {
    function ProgressController() {
    }
    ProgressController.getAll = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, progress, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!req.user) {
                            res.status(401).json((0, helpers_1.errorResponse)('UNAUTHORIZED', 'Device authentication required'));
                            return [2 /*return*/];
                        }
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute("SELECT up.*, b.title as book_title, ch.title as chapter_title\n         FROM user_progress up\n         LEFT JOIN books b ON up.book_id = b.id\n         LEFT JOIN chapters ch ON up.chapter_id = ch.id\n         WHERE up.user_id = ?\n         ORDER BY up.last_played_at DESC", [req.user.id])];
                    case 1:
                        progress = (_a.sent())[0];
                        res.status(200).json((0, helpers_1.successResponse)(progress));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to fetch progress'));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ProgressController.getByBookId = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var bookId, pool, progress, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!req.user) {
                            res.status(401).json((0, helpers_1.errorResponse)('UNAUTHORIZED', 'Device authentication required'));
                            return [2 /*return*/];
                        }
                        bookId = req.params.bookId;
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute("SELECT up.*, ch.title as chapter_title, ch.order_number\n         FROM user_progress up\n         LEFT JOIN chapters ch ON up.chapter_id = ch.id\n         WHERE up.user_id = ? AND up.book_id = ?\n         ORDER BY ch.order_number ASC", [req.user.id, bookId])];
                    case 1:
                        progress = (_a.sent())[0];
                        res.status(200).json((0, helpers_1.successResponse)(progress));
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to fetch progress'));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ProgressController.create = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, _a, book_id, chapter_id, _b, current_position_seconds, _c, is_completed, existing, updated, result, insertResult, progress, error_3;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 7, , 8]);
                        if (!req.user) {
                            res.status(401).json((0, helpers_1.errorResponse)('UNAUTHORIZED', 'Device authentication required'));
                            return [2 /*return*/];
                        }
                        pool = (0, database_1.getPool)();
                        _a = req.body, book_id = _a.book_id, chapter_id = _a.chapter_id, _b = _a.current_position_seconds, current_position_seconds = _b === void 0 ? 0 : _b, _c = _a.is_completed, is_completed = _c === void 0 ? false : _c;
                        return [4 /*yield*/, pool.execute('SELECT * FROM user_progress WHERE user_id = ? AND book_id = ? AND chapter_id = ?', [req.user.id, book_id, chapter_id])];
                    case 1:
                        existing = (_d.sent())[0];
                        if (!(existing.length > 0)) return [3 /*break*/, 4];
                        // Update existing progress
                        return [4 /*yield*/, pool.execute("UPDATE user_progress \n           SET current_position_seconds = ?, is_completed = ?, last_played_at = NOW(), updated_at = NOW()\n           WHERE id = ?", [current_position_seconds, is_completed, existing[0].id])];
                    case 2:
                        // Update existing progress
                        _d.sent();
                        return [4 /*yield*/, pool.execute('SELECT * FROM user_progress WHERE id = ?', [existing[0].id])];
                    case 3:
                        updated = (_d.sent())[0];
                        res.status(200).json((0, helpers_1.successResponse)(updated[0], 'Progress updated successfully'));
                        return [2 /*return*/];
                    case 4: return [4 /*yield*/, pool.execute("INSERT INTO user_progress (user_id, book_id, chapter_id, current_position_seconds, is_completed)\n         VALUES (?, ?, ?, ?, ?)", [req.user.id, book_id, chapter_id, current_position_seconds, is_completed])];
                    case 5:
                        result = (_d.sent())[0];
                        insertResult = result;
                        return [4 /*yield*/, pool.execute('SELECT * FROM user_progress WHERE id = ?', [insertResult.insertId])];
                    case 6:
                        progress = (_d.sent())[0];
                        res.status(201).json((0, helpers_1.successResponse)(progress[0], 'Progress created successfully'));
                        return [3 /*break*/, 8];
                    case 7:
                        error_3 = _d.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to save progress'));
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ProgressController.update = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var bookId, pool, _a, current_position_seconds, is_completed, chapter_id, existing, updates, values, updated, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        if (!req.user) {
                            res.status(401).json((0, helpers_1.errorResponse)('UNAUTHORIZED', 'Device authentication required'));
                            return [2 /*return*/];
                        }
                        bookId = req.params.bookId;
                        pool = (0, database_1.getPool)();
                        _a = req.body, current_position_seconds = _a.current_position_seconds, is_completed = _a.is_completed, chapter_id = _a.chapter_id;
                        if (!chapter_id) {
                            res.status(400).json((0, helpers_1.errorResponse)('VALIDATION_ERROR', 'chapter_id is required'));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, pool.execute('SELECT * FROM user_progress WHERE user_id = ? AND book_id = ? AND chapter_id = ?', [req.user.id, bookId, chapter_id])];
                    case 1:
                        existing = (_b.sent())[0];
                        if (existing.length === 0) {
                            res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', 'Progress not found'));
                            return [2 /*return*/];
                        }
                        updates = [];
                        values = [];
                        if (current_position_seconds !== undefined) {
                            updates.push('current_position_seconds = ?');
                            values.push(current_position_seconds);
                        }
                        if (is_completed !== undefined) {
                            updates.push('is_completed = ?');
                            values.push(is_completed);
                        }
                        if (updates.length === 0) {
                            res.status(400).json((0, helpers_1.errorResponse)('VALIDATION_ERROR', 'No fields to update'));
                            return [2 /*return*/];
                        }
                        updates.push('last_played_at = NOW()', 'updated_at = NOW()');
                        values.push(existing[0].id);
                        return [4 /*yield*/, pool.execute("UPDATE user_progress SET ".concat(updates.join(', '), " WHERE id = ?"), values)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, pool.execute('SELECT * FROM user_progress WHERE id = ?', [existing[0].id])];
                    case 3:
                        updated = (_b.sent())[0];
                        res.status(200).json((0, helpers_1.successResponse)(updated[0], 'Progress updated successfully'));
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _b.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to update progress'));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ProgressController.delete = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var bookId, pool, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!req.user) {
                            res.status(401).json((0, helpers_1.errorResponse)('UNAUTHORIZED', 'Device authentication required'));
                            return [2 /*return*/];
                        }
                        bookId = req.params.bookId;
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute('DELETE FROM user_progress WHERE user_id = ? AND book_id = ?', [
                                req.user.id,
                                bookId,
                            ])];
                    case 1:
                        _a.sent();
                        res.status(200).json((0, helpers_1.successResponse)(null, 'Progress deleted successfully'));
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to delete progress'));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ProgressController;
}());
exports.ProgressController = ProgressController;
