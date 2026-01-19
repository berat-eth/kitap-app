"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var downloads_controller_1 = require("../controllers/downloads.controller");
var device_middleware_1 = require("../middleware/device.middleware");
var router = (0, express_1.Router)();
// All routes require device authentication
router.use(device_middleware_1.deviceAuth);
router.get('/', downloads_controller_1.DownloadsController.getAll);
router.post('/:bookId', downloads_controller_1.DownloadsController.add);
router.delete('/:bookId', downloads_controller_1.DownloadsController.remove);
router.get('/:bookId/status', downloads_controller_1.DownloadsController.getStatus);
exports.default = router;
