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
exports.BooksController = void 0;
var database_1 = require("../config/database");
var helpers_1 = require("../utils/helpers");
var BooksController = /** @class */ (function () {
    function BooksController() {
    }
    BooksController.getAll = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, page, _c, limit, category, search, featured, published, pool, offset, query, params, searchTerm, books, countQuery, countParams, searchTerm, countResult, total, error_1;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 20 : _c, category = _a.category, search = _a.search, featured = _a.featured, published = _a.published;
                        pool = (0, database_1.getPool)();
                        offset = (0, helpers_1.getOffset)(Number(page), Number(limit));
                        query = "\n        SELECT b.*, c.name as category_name, c.slug as category_slug,\n               COUNT(DISTINCT ch.id) as chapter_count\n        FROM books b\n        LEFT JOIN categories c ON b.category_id = c.id\n        LEFT JOIN chapters ch ON b.id = ch.book_id\n        WHERE 1=1\n      ";
                        params = [];
                        if (category) {
                            query += ' AND c.slug = ?';
                            params.push(category);
                        }
                        if (search) {
                            query += ' AND (b.title LIKE ? OR b.author LIKE ? OR b.description LIKE ?)';
                            searchTerm = "%".concat(search, "%");
                            params.push(searchTerm, searchTerm, searchTerm);
                        }
                        if (featured === 'true') {
                            query += ' AND b.is_featured = true';
                        }
                        if (published !== undefined) {
                            query += published === 'true' ? ' AND b.is_published = true' : ' AND b.is_published = false';
                        }
                        else {
                            // Default: only show published books for non-admin users
                            if (!req.user || req.user.role !== 'admin') {
                                query += ' AND b.is_published = true';
                            }
                        }
                        query += ' GROUP BY b.id ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
                        params.push(Number(limit), offset);
                        return [4 /*yield*/, pool.execute(query, params)];
                    case 1:
                        books = (_e.sent())[0];
                        countQuery = 'SELECT COUNT(DISTINCT b.id) as total FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE 1=1';
                        countParams = [];
                        if (category) {
                            countQuery += ' AND c.slug = ?';
                            countParams.push(category);
                        }
                        if (search) {
                            countQuery += ' AND (b.title LIKE ? OR b.author LIKE ? OR b.description LIKE ?)';
                            searchTerm = "%".concat(search, "%");
                            countParams.push(searchTerm, searchTerm, searchTerm);
                        }
                        if (featured === 'true') {
                            countQuery += ' AND b.is_featured = true';
                        }
                        if (published !== undefined) {
                            countQuery += published === 'true' ? ' AND b.is_published = true' : ' AND b.is_published = false';
                        }
                        else {
                            if (!req.user || req.user.role !== 'admin') {
                                countQuery += ' AND b.is_published = true';
                            }
                        }
                        return [4 /*yield*/, pool.execute(countQuery, countParams)];
                    case 2:
                        countResult = (_e.sent())[0];
                        total = ((_d = countResult[0]) === null || _d === void 0 ? void 0 : _d.total) || 0;
                        res.status(200).json((0, helpers_1.successResponse)((0, helpers_1.paginatedResponse)(books, Number(page), Number(limit), total), undefined, {
                            page: Number(page),
                            limit: Number(limit),
                            total: total,
                            totalPages: Math.ceil(total / Number(limit)),
                        }));
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _e.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to fetch books'));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BooksController.getById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, pool, books, book, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute("SELECT b.*, c.name as category_name, c.slug as category_slug\n         FROM books b\n         LEFT JOIN categories c ON b.category_id = c.id\n         WHERE b.id = ?", [id])];
                    case 1:
                        books = (_a.sent())[0];
                        if (books.length === 0) {
                            res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', 'Book not found'));
                            return [2 /*return*/];
                        }
                        book = books[0];
                        // Check if user can view unpublished books
                        if (!book.is_published && (!req.user || req.user.role !== 'admin')) {
                            res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', 'Book not found'));
                            return [2 /*return*/];
                        }
                        res.status(200).json((0, helpers_1.successResponse)(book));
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to fetch book'));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BooksController.getChapters = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, pool, chapters, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute('SELECT * FROM chapters WHERE book_id = ? ORDER BY order_number ASC', [id])];
                    case 1:
                        chapters = (_a.sent())[0];
                        res.status(200).json((0, helpers_1.successResponse)(chapters));
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to fetch chapters'));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BooksController.getFeatured = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, books, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute("SELECT b.*, c.name as category_name, c.slug as category_slug\n         FROM books b\n         LEFT JOIN categories c ON b.category_id = c.id\n         WHERE b.is_featured = true AND b.is_published = true\n         ORDER BY b.rating DESC, b.total_listens DESC\n         LIMIT 10")];
                    case 1:
                        books = (_a.sent())[0];
                        res.status(200).json((0, helpers_1.successResponse)(books));
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to fetch featured books'));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BooksController.getPopular = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, books, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute("SELECT b.*, c.name as category_name, c.slug as category_slug\n         FROM books b\n         LEFT JOIN categories c ON b.category_id = c.id\n         WHERE b.is_published = true\n         ORDER BY b.total_listens DESC, b.rating DESC\n         LIMIT 20")];
                    case 1:
                        books = (_a.sent())[0];
                        res.status(200).json((0, helpers_1.successResponse)(books));
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to fetch popular books'));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BooksController.search = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var q, pool, searchTerm, books, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        q = req.query.q;
                        pool = (0, database_1.getPool)();
                        if (!q || typeof q !== 'string') {
                            res.status(400).json((0, helpers_1.errorResponse)('VALIDATION_ERROR', 'Search query is required'));
                            return [2 /*return*/];
                        }
                        searchTerm = "%".concat(q, "%");
                        return [4 /*yield*/, pool.execute("SELECT b.*, c.name as category_name, c.slug as category_slug\n         FROM books b\n         LEFT JOIN categories c ON b.category_id = c.id\n         WHERE b.is_published = true\n         AND (b.title LIKE ? OR b.author LIKE ? OR b.description LIKE ?)\n         ORDER BY b.rating DESC\n         LIMIT 50", [searchTerm, searchTerm, searchTerm])];
                    case 1:
                        books = (_a.sent())[0];
                        res.status(200).json((0, helpers_1.successResponse)(books));
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to search books'));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BooksController.getByCategory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var slug, pool, books, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        slug = req.params.slug;
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute("SELECT b.*, c.name as category_name, c.slug as category_slug\n         FROM books b\n         LEFT JOIN categories c ON b.category_id = c.id\n         WHERE c.slug = ? AND b.is_published = true\n         ORDER BY b.created_at DESC", [slug])];
                    case 1:
                        books = (_a.sent())[0];
                        res.status(200).json((0, helpers_1.successResponse)(books));
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to fetch books by category'));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BooksController.create = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, _a, title, author, narrator, description, cover_image_url, category_id, _b, duration_seconds, _c, is_featured, _d, is_published, result, insertResult, books, error_8;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        if (!req.user || req.user.role !== 'admin') {
                            res.status(403).json((0, helpers_1.errorResponse)('FORBIDDEN', 'Admin access required'));
                            return [2 /*return*/];
                        }
                        pool = (0, database_1.getPool)();
                        _a = req.body, title = _a.title, author = _a.author, narrator = _a.narrator, description = _a.description, cover_image_url = _a.cover_image_url, category_id = _a.category_id, _b = _a.duration_seconds, duration_seconds = _b === void 0 ? 0 : _b, _c = _a.is_featured, is_featured = _c === void 0 ? false : _c, _d = _a.is_published, is_published = _d === void 0 ? false : _d;
                        return [4 /*yield*/, pool.execute("INSERT INTO books (title, author, narrator, description, cover_image_url, category_id, \n         duration_seconds, is_featured, is_published, created_by, published_at)\n         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                                title,
                                author,
                                narrator || null,
                                description || null,
                                cover_image_url || null,
                                category_id,
                                duration_seconds,
                                is_featured,
                                is_published,
                                req.user.id,
                                is_published ? new Date() : null,
                            ])];
                    case 1:
                        result = (_e.sent())[0];
                        insertResult = result;
                        return [4 /*yield*/, pool.execute('SELECT * FROM books WHERE id = ?', [
                                insertResult.insertId,
                            ])];
                    case 2:
                        books = (_e.sent())[0];
                        res.status(201).json((0, helpers_1.successResponse)(books[0], 'Book created successfully'));
                        return [3 /*break*/, 4];
                    case 3:
                        error_8 = _e.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to create book'));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BooksController.update = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, pool, existing, updates, values, allowedFields, _i, allowedFields_1, field, books, error_9;
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
                        return [4 /*yield*/, pool.execute('SELECT * FROM books WHERE id = ?', [id])];
                    case 1:
                        existing = (_a.sent())[0];
                        if (existing.length === 0) {
                            res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', 'Book not found'));
                            return [2 /*return*/];
                        }
                        updates = [];
                        values = [];
                        allowedFields = [
                            'title',
                            'author',
                            'narrator',
                            'description',
                            'cover_image_url',
                            'category_id',
                            'duration_seconds',
                            'is_featured',
                            'is_published',
                        ];
                        for (_i = 0, allowedFields_1 = allowedFields; _i < allowedFields_1.length; _i++) {
                            field = allowedFields_1[_i];
                            if (req.body[field] !== undefined) {
                                updates.push("".concat(field, " = ?"));
                                values.push(req.body[field]);
                            }
                        }
                        // Handle published_at
                        if (req.body.is_published !== undefined) {
                            if (req.body.is_published && !existing[0].published_at) {
                                updates.push('published_at = ?');
                                values.push(new Date());
                            }
                            else if (!req.body.is_published) {
                                updates.push('published_at = NULL');
                            }
                        }
                        if (updates.length === 0) {
                            res.status(400).json((0, helpers_1.errorResponse)('VALIDATION_ERROR', 'No fields to update'));
                            return [2 /*return*/];
                        }
                        values.push(id);
                        return [4 /*yield*/, pool.execute("UPDATE books SET ".concat(updates.join(', '), " WHERE id = ?"), values)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, pool.execute('SELECT * FROM books WHERE id = ?', [id])];
                    case 3:
                        books = (_a.sent())[0];
                        res.status(200).json((0, helpers_1.successResponse)(books[0], 'Book updated successfully'));
                        return [3 /*break*/, 5];
                    case 4:
                        error_9 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to update book'));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BooksController.delete = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, pool, existing, error_10;
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
                        return [4 /*yield*/, pool.execute('SELECT * FROM books WHERE id = ?', [id])];
                    case 1:
                        existing = (_a.sent())[0];
                        if (existing.length === 0) {
                            res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', 'Book not found'));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, pool.execute('DELETE FROM books WHERE id = ?', [id])];
                    case 2:
                        _a.sent();
                        res.status(200).json((0, helpers_1.successResponse)(null, 'Book deleted successfully'));
                        return [3 /*break*/, 4];
                    case 3:
                        error_10 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to delete book'));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return BooksController;
}());
exports.BooksController = BooksController;
