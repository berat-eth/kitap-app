"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var categories_controller_1 = require("../controllers/categories.controller");
var admin_auth_middleware_1 = require("../middleware/admin-auth.middleware");
var role_middleware_1 = require("../middleware/role.middleware");
var validation_middleware_1 = require("../middleware/validation.middleware");
var validators_1 = require("../utils/validators");
var router = (0, express_1.Router)();
// Public routes
router.get('/', categories_controller_1.CategoriesController.getAll);
router.get('/:id', categories_controller_1.CategoriesController.getById);
// Admin routes
router.post('/', admin_auth_middleware_1.adminAuth, (0, role_middleware_1.requireRole)('admin'), (0, validation_middleware_1.validate)(validators_1.categoryCreateSchema), categories_controller_1.CategoriesController.create);
router.put('/:id', admin_auth_middleware_1.adminAuth, (0, role_middleware_1.requireRole)('admin'), (0, validation_middleware_1.validate)(validators_1.categoryUpdateSchema), categories_controller_1.CategoriesController.update);
router.delete('/:id', admin_auth_middleware_1.adminAuth, (0, role_middleware_1.requireRole)('admin'), categories_controller_1.CategoriesController.delete);
exports.default = router;
