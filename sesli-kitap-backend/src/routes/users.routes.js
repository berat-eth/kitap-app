const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

router.get('/', authMiddleware, adminMiddleware, usersController.list);
router.put('/profile', authMiddleware, usersController.updateProfile);
router.post('/device-token', authMiddleware, usersController.saveDeviceToken);

module.exports = router;
