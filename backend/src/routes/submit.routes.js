const express = require('express');
const router = express.Router();

const { deviceAuth } = require('../middleware/deviceAuth');
const { submitBook } = require('../controllers/submit.controller');

router.post('/', deviceAuth, submitBook);

module.exports = router;

