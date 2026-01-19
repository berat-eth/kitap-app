"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var progress_controller_1 = require("../controllers/progress.controller");
var device_middleware_1 = require("../middleware/device.middleware");
var validation_middleware_1 = require("../middleware/validation.middleware");
var validators_1 = require("../utils/validators");
var router = (0, express_1.Router)();
// All routes require device authentication
router.use(device_middleware_1.deviceAuth);
router.get('/', progress_controller_1.ProgressController.getAll);
router.get('/:bookId', progress_controller_1.ProgressController.getByBookId);
router.post('/', (0, validation_middleware_1.validate)(validators_1.progressCreateSchema), progress_controller_1.ProgressController.create);
router.put('/:bookId', (0, validation_middleware_1.validate)(validators_1.progressUpdateSchema), progress_controller_1.ProgressController.update);
router.delete('/:bookId', progress_controller_1.ProgressController.delete);
exports.default = router;
