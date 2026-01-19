"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var chapters_controller_1 = require("../controllers/chapters.controller");
var device_middleware_1 = require("../middleware/device.middleware");
var admin_auth_middleware_1 = require("../middleware/admin-auth.middleware");
var role_middleware_1 = require("../middleware/role.middleware");
var validation_middleware_1 = require("../middleware/validation.middleware");
var validators_1 = require("../utils/validators");
var router = (0, express_1.Router)();
// Device auth routes
router.get('/:id', device_middleware_1.deviceAuth, chapters_controller_1.ChaptersController.getById);
router.get('/:id/audio', device_middleware_1.deviceAuth, chapters_controller_1.ChaptersController.getAudioUrl);
// Admin routes
router.post('/', admin_auth_middleware_1.adminAuth, (0, role_middleware_1.requireRole)('admin'), (0, validation_middleware_1.validate)(validators_1.chapterCreateSchema), chapters_controller_1.ChaptersController.create);
router.put('/:id', admin_auth_middleware_1.adminAuth, (0, role_middleware_1.requireRole)('admin'), (0, validation_middleware_1.validate)(validators_1.chapterUpdateSchema), chapters_controller_1.ChaptersController.update);
router.delete('/:id', admin_auth_middleware_1.adminAuth, (0, role_middleware_1.requireRole)('admin'), chapters_controller_1.ChaptersController.delete);
exports.default = router;
