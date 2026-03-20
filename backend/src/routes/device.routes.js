const express = require('express');
const router = express.Router();

const deviceController = require('../controllers/device.controller');
const { deviceAuth } = require('../middleware/deviceAuth');

router.post('/register', deviceController.register);

router.get('/favorites', deviceAuth, deviceController.getFavorites);
router.post('/favorites/:bookId', deviceAuth, deviceController.addFavorite);
router.delete('/favorites/:bookId', deviceAuth, deviceController.removeFavorite);

router.get('/progress/:bookId', deviceAuth, deviceController.getProgress);
router.post('/progress/:bookId', deviceAuth, deviceController.saveProgress);

module.exports = router;

