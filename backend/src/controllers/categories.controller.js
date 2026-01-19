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
exports.CategoriesController = void 0;
var database_1 = require("../config/database");
var helpers_1 = require("../utils/helpers");
var CategoriesController = /** @class */ (function () {
    function CategoriesController() {
    }
    CategoriesController.getAll = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, categories, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute('SELECT * FROM categories WHERE is_active = true ORDER BY name ASC')];
                    case 1:
                        categories = (_a.sent())[0];
                        res.status(200).json((0, helpers_1.successResponse)(categories));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to fetch categories'));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CategoriesController.getById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, pool, categories, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        pool = (0, database_1.getPool)();
                        return [4 /*yield*/, pool.execute('SELECT * FROM categories WHERE id = ?', [id])];
                    case 1:
                        categories = (_a.sent())[0];
                        if (categories.length === 0) {
                            res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', 'Category not found'));
                            return [2 /*return*/];
                        }
                        res.status(200).json((0, helpers_1.successResponse)(categories[0]));
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to fetch category'));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CategoriesController.create = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, _a, name_1, slug, description, icon_url, result, insertResult, categories, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        if (!req.user || req.user.role !== 'admin') {
                            res.status(403).json((0, helpers_1.errorResponse)('FORBIDDEN', 'Admin access required'));
                            return [2 /*return*/];
                        }
                        pool = (0, database_1.getPool)();
                        _a = req.body, name_1 = _a.name, slug = _a.slug, description = _a.description, icon_url = _a.icon_url;
                        return [4 /*yield*/, pool.execute('INSERT INTO categories (name, slug, description, icon_url) VALUES (?, ?, ?, ?)', [name_1, slug, description || null, icon_url || null])];
                    case 1:
                        result = (_b.sent())[0];
                        insertResult = result;
                        return [4 /*yield*/, pool.execute('SELECT * FROM categories WHERE id = ?', [insertResult.insertId])];
                    case 2:
                        categories = (_b.sent())[0];
                        res.status(201).json((0, helpers_1.successResponse)(categories[0], 'Category created successfully'));
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _b.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to create category'));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CategoriesController.update = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, pool, existing, updates, values, allowedFields, _i, allowedFields_1, field, categories, error_4;
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
                        return [4 /*yield*/, pool.execute('SELECT * FROM categories WHERE id = ?', [id])];
                    case 1:
                        existing = (_a.sent())[0];
                        if (existing.length === 0) {
                            res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', 'Category not found'));
                            return [2 /*return*/];
                        }
                        updates = [];
                        values = [];
                        allowedFields = ['name', 'slug', 'description', 'icon_url', 'is_active'];
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
                        return [4 /*yield*/, pool.execute("UPDATE categories SET ".concat(updates.join(', '), " WHERE id = ?"), values)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, pool.execute('SELECT * FROM categories WHERE id = ?', [id])];
                    case 3:
                        categories = (_a.sent())[0];
                        res.status(200).json((0, helpers_1.successResponse)(categories[0], 'Category updated successfully'));
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to update category'));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CategoriesController.delete = function (req, res) {
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
                        return [4 /*yield*/, pool.execute('SELECT * FROM categories WHERE id = ?', [id])];
                    case 1:
                        existing = (_a.sent())[0];
                        if (existing.length === 0) {
                            res.status(404).json((0, helpers_1.errorResponse)('NOT_FOUND', 'Category not found'));
                            return [2 /*return*/];
                        }
                        // Soft delete by setting is_active to false
                        return [4 /*yield*/, pool.execute('UPDATE categories SET is_active = false WHERE id = ?', [id])];
                    case 2:
                        // Soft delete by setting is_active to false
                        _a.sent();
                        res.status(200).json((0, helpers_1.successResponse)(null, 'Category deleted successfully'));
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        res.status(500).json((0, helpers_1.errorResponse)('INTERNAL_ERROR', 'Failed to delete category'));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return CategoriesController;
}());
exports.CategoriesController = CategoriesController;
