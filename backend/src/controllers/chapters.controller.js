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
exports.ChaptersController = void 0;
var database_1 = require("../config/database");
var helpers_1 = require("../utils/helpers");
var ChaptersController = /** @class */ (function () {
    function ChaptersController() {
    }
    ChaptersController.getById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, pool, chapters, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute('SELECT * FROM chapters WHERE id = ?', [id])];
                    case 1:
                        chapters = (_a.sent())[0];
                        if (chapters.length === 0) {
                            res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', 'Chapter not found'));
                            return [2 /*return*/];
                        }
                        res.status(200).json((0, helpers_1.successResponse)(chapters[0]));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to fetch chapter'));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ChaptersController.getAudioUrl = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, pool, chapters, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute('SELECT audio_file_url FROM chapters WHERE id = ?', [id])];
                    case 1:
                        chapters = (_a.sent())[0];
                        if (chapters.length === 0) {
                            res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', 'Chapter not found'));
                            return [2 /*return*/];
                        }
                        res.status(200).json((0, helpers_1.successResponse)({
                            audioUrl: chapters[0].audio_file_url,
                        }));
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to fetch audio URL'));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ChaptersController.create = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, _a, book_id, title, order_number, audio_file_url, _b, audio_file_size, _c, duration_seconds, books, result, insertResult, chapters, error_3;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 4, , 5]);
                        if (!req.user || req.user.role !== 'admin') {
                            res.status(403).json((0, helpers_1.errorResponse)('FORBIDDEN', 'Admin access required'));
                            return [2 /*return*/];
                        }
                        pool = (0, database_1.getPool)();
                        _a = req.body, book_id = _a.book_id, title = _a.title, order_number = _a.order_number, audio_file_url = _a.audio_file_url, _b = _a.audio_file_size, audio_file_size = _b === void 0 ? null : _b, _c = _a.duration_seconds, duration_seconds = _c === void 0 ? 0 : _c;
                        return [4 /*yield*/, pool.execute('SELECT id FROM books WHERE id = ?', [book_id])];
                    case 1:
                        books = (_d.sent())[0];
                        if (books.length === 0) {
                            res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', 'Book not found'));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, pool.execute("INSERT INTO chapters (book_id, title, order_number, audio_file_url, audio_file_size, duration_seconds)\n         VALUES (?, ?, ?, ?, ?, ?)", [book_id, title, order_number, audio_file_url, audio_file_size, duration_seconds])];
                    case 2:
                        result = (_d.sent())[0];
                        insertResult = result;
                        return [4 /*yield*/, pool.execute('SELECT * FROM chapters WHERE id = ?', [
                                insertResult.insertId,
                            ])];
                    case 3:
                        chapters = (_d.sent())[0];
                        res.status(201).json((0, helpers_1.successResponse)(chapters[0], 'Chapter created successfully'));
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _d.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to create chapter'));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ChaptersController.update = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, pool, existing, updates, values, allowedFields, _i, allowedFields_1, field, chapters, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!req.user || req.user.role !== 'admin') {
                            res.status(403).json((0, helpers_1.errorResponse)('FORBIDDEN', 'Admin access required'));
                            return [2 /*return*/];
                        }
                        id = req.params.id;
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute('SELECT * FROM chapters WHERE id = ?', [id])];
                    case 1:
                        existing = (_a.sent())[0];
                        if (existing.length === 0) {
                            res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', 'Chapter not found'));
                            return [2 /*return*/];
                        }
                        updates = [];
                        values = [];
                        allowedFields = ['title', 'order_number', 'audio_file_url', 'audio_file_size', 'duration_seconds'];
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
                        return [4 /*yield*/, pool.execute("UPDATE chapters SET ".concat(updates.join(', '), " WHERE id = ?"), values)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, pool.execute('SELECT * FROM chapters WHERE id = ?', [
                                id,
                            ])];
                    case 3:
                        chapters = (_a.sent())[0];
                        res.status(200).json((0, helpers_1.successResponse)(chapters[0], 'Chapter updated successfully'));
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to update chapter'));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ChaptersController.delete = function (req, res) {
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
                        return [4 /*yield*/, pool.execute('SELECT * FROM chapters WHERE id = ?', [id])];
                    case 1:
                        existing = (_a.sent())[0];
                        if (existing.length === 0) {
                            res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', 'Chapter not found'));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, pool.execute('DELETE FROM chapters WHERE id = ?', [id])];
                    case 2:
                        _a.sent();
                        res.status(200).json((0, helpers_1.successResponse)(null, 'Chapter deleted successfully'));
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to delete chapter'));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ChaptersController;
}());
exports.ChaptersController = ChaptersController;
