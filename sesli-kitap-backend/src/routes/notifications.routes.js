const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

router.post('/send', authMiddleware, adminMiddleware, notificationsController.send);
router.get('/', authMiddleware, adminMiddleware, notificationsController.list);

module.exports = router;
