"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var books_controller_1 = require("../controllers/books.controller");
var device_middleware_1 = require("../middleware/device.middleware");
var admin_auth_middleware_1 = require("../middleware/admin-auth.middleware");
var role_middleware_1 = require("../middleware/role.middleware");
var validation_middleware_1 = require("../middleware/validation.middleware");
var validators_1 = require("../utils/validators");
var router = (0, express_1.Router)();
// Public routes (no auth required)
router.get('/featured', books_controller_1.BooksController.getFeatured);
router.get('/popular', books_controller_1.BooksController.getPopular);
router.get('/search', books_controller_1.BooksController.search);
router.get('/category/:slug', books_controller_1.BooksController.getByCategory);
// Device auth routes
router.get('/', device_middleware_1.deviceAuth, books_controller_1.BooksController.getAll);
router.get('/:id', device_middleware_1.deviceAuth, books_controller_1.BooksController.getById);
router.get('/:id/chapters', device_middleware_1.deviceAuth, books_controller_1.BooksController.getChapters);
// Admin routes
router.post('/', admin_auth_middleware_1.adminAuth, (0, role_middleware_1.requireRole)('admin'), (0, validation_middleware_1.validate)(validators_1.bookCreateSchema), books_controller_1.BooksController.create);
router.put('/:id', admin_auth_middleware_1.adminAuth, (0, role_middleware_1.requireRole)('admin'), (0, validation_middleware_1.validate)(validators_1.bookUpdateSchema), books_controller_1.BooksController.update);
router.delete('/:id', admin_auth_middleware_1.adminAuth, (0, role_middleware_1.requireRole)('admin'), books_controller_1.BooksController.delete);
exports.default = router;
