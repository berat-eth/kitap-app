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
exports.FavoritesController = void 0;
var database_1 = require("../config/database");
var helpers_1 = require("../utils/helpers");
var FavoritesController = /** @class */ (function () {
    function FavoritesController() {
    }
    FavoritesController.getAll = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, favorites, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!req.user) {
                            res.status(401).json((0, helpers_1.errorResponse)('UNAUTHORIZED', 'Device authentication required'));
                            return [2 /*return*/];
                        }
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute("SELECT b.*, uf.created_at as favorited_at\n         FROM user_favorites uf\n         LEFT JOIN books b ON uf.book_id = b.id\n         WHERE uf.user_id = ? AND b.is_published = true\n         ORDER BY uf.created_at DESC", [req.user.id])];
                    case 1:
                        favorites = (_a.sent())[0];
                        res.status(200).json((0, helpers_1.successResponse)(favorites));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to fetch favorites'));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FavoritesController.add = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var bookId, pool, books, existing, result, insertResult, favorites, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!req.user) {
                            res.status(401).json((0, helpers_1.errorResponse)('UNAUTHORIZED', 'Device authentication required'));
                            return [2 /*return*/];
                        }
                        bookId = req.body.bookId;
                        pool = (0, database_1.getPool)();
                        if (!bookId) {
                            res.status(400).json((0, helpers_1.errorResponse)('VALIDATION_ERROR', 'bookId is required'));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, pool.execute('SELECT id FROM books WHERE id = ?', [bookId])];
                    case 1:
                        books = (_a.sent())[0];
                        if (books.length === 0) {
                            res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', 'Book not found'));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, pool.execute('SELECT * FROM user_favorites WHERE user_id = ? AND book_id = ?', [req.user.id, bookId])];
                    case 2:
                        existing = (_a.sent())[0];
                        if (existing.length > 0) {
                            res.status(200).json((0, helpers_1.successResponse)(existing[0], 'Book already in favorites'));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, pool.execute('INSERT INTO user_favorites (user_id, book_id) VALUES (?, ?)', [req.user.id, bookId])];
                    case 3:
                        result = (_a.sent())[0];
                        insertResult = result;
                        return [4 /*yield*/, pool.execute('SELECT * FROM user_favorites WHERE id = ?', [insertResult.insertId])];
                    case 4:
                        favorites = (_a.sent())[0];
                        res.status(201).json((0, helpers_1.successResponse)(favorites[0], 'Book added to favorites'));
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to add favorite'));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    FavoritesController.remove = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var bookId, pool, existing, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!req.user) {
                            res.status(401).json((0, helpers_1.errorResponse)('UNAUTHORIZED', 'Device authentication required'));
                            return [2 /*return*/];
                        }
                        bookId = req.params.bookId;
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute('SELECT * FROM user_favorites WHERE user_id = ? AND book_id = ?', [req.user.id, bookId])];
                    case 1:
                        existing = (_a.sent())[0];
                        if (existing.length === 0) {
                            res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', 'Favorite not found'));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, pool.execute('DELETE FROM user_favorites WHERE user_id = ? AND book_id = ?', [
                                req.user.id,
                                bookId,
                            ])];
                    case 2:
                        _a.sent();
                        res.status(200).json((0, helpers_1.successResponse)(null, 'Book removed from favorites'));
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to remove favorite'));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return FavoritesController;
}());
exports.FavoritesController = FavoritesController;
