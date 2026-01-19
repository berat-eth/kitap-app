"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var admin_controller_1 = require("../controllers/admin.controller");
var admin_auth_middleware_1 = require("../middleware/admin-auth.middleware");
var role_middleware_1 = require("../middleware/role.middleware");
var router = (0, express_1.Router)();
// All routes require admin authentication
router.use(admin_auth_middleware_1.adminAuth);
router.use((0, role_middleware_1.requireRole)('admin'));
router.get('/dashboard/stats', admin_controller_1.AdminController.getDashboardStats);
router.get('/users', admin_controller_1.AdminController.getUsers);
router.get('/users/:id', admin_controller_1.AdminController.getUserById);
router.put('/users/:id', admin_controller_1.AdminController.updateUser);
router.delete('/users/:id', admin_controller_1.AdminController.deleteUser);
exports.default = router;
