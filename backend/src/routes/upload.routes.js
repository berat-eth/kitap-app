const express = require('express');
const { upload } = require('../middleware/upload');
const { resolveBookAudioUpload } = require('../middleware/resolveBookAudioUpload');
const uploadController = require('../controllers/upload.controller');

const router = express.Router();

router.post('/', resolveBookAudioUpload, upload.single('file'), uploadController.uploadFile);

module.exports = router;

