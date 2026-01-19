"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var favorites_controller_1 = require("../controllers/favorites.controller");
var device_middleware_1 = require("../middleware/device.middleware");
var router = (0, express_1.Router)();
// All routes require device authentication
router.use(device_middleware_1.deviceAuth);
router.get('/', favorites_controller_1.FavoritesController.getAll);
router.post('/', favorites_controller_1.FavoritesController.add);
router.delete('/:bookId', favorites_controller_1.FavoritesController.remove);
exports.default = router;
