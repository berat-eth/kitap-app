"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var device_controller_1 = require("../controllers/device.controller");
var device_middleware_1 = require("../middleware/device.middleware");
var validation_middleware_1 = require("../middleware/validation.middleware");
var validators_1 = require("../utils/validators");
var router = (0, express_1.Router)();
// All routes require device authentication
router.use(device_middleware_1.deviceAuth);
router.post('/register', device_controller_1.DeviceController.register);
router.get('/me', device_controller_1.DeviceController.getMe);
router.put('/me', (0, validation_middleware_1.validate)(validators_1.userUpdateSchema), device_controller_1.DeviceController.updateMe);
exports.default = router;
