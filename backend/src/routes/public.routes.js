"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var books_controller_1 = require("../controllers/books.controller");
var categories_controller_1 = require("../controllers/categories.controller");
var router = (0, express_1.Router)();
// Public routes - no authentication required
router.get('/books', books_controller_1.BooksController.getAll);
router.get('/categories', categories_controller_1.CategoriesController.getAll);
exports.default = router;
