"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.uploadAvatar = exports.uploadAudio = exports.uploadCover = exports.upload = void 0;
var multer_1 = require("multer");
var path_1 = require("path");
var storage_1 = require("../config/storage");
var helpers_1 = require("../utils/helpers");
var helpers_2 = require("../utils/helpers");
// Storage configuration
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        var uploadPath;
        if (file.fieldname === 'cover') {
            uploadPath = path_1.default.join(storage_1.uploadConfig.uploadDir, 'covers');
        }
        else if (file.fieldname === 'audio') {
            var now = new Date();
            var year = now.getFullYear();
            var month = String(now.getMonth() + 1).padStart(2, '0');
            uploadPath = path_1.default.join(storage_1.uploadConfig.uploadDir, 'audio', 'chapters', String(year), month);
        }
        else if (file.fieldname === 'avatar') {
            uploadPath = path_1.default.join(storage_1.uploadConfig.uploadDir, 'avatars');
        }
        else {
            uploadPath = storage_1.uploadConfig.uploadDir;
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        var ext = path_1.default.extname(file.originalname);
        var name = (0, helpers_1.sanitizeFilename)(path_1.default.basename(file.originalname, ext));
        var timestamp = Date.now();
        var random = Math.round(Math.random() * 1e9);
        cb(null, "".concat(name, "_").concat(timestamp, "_").concat(random).concat(ext));
    },
});
// File filter
var fileFilter = function (req, file, cb) {
    var allowedMimes = {
        cover: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
        avatar: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    };
    var fieldMimes = allowedMimes[file.fieldname] || [];
    if (fieldMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type for ".concat(file.fieldname, ". Allowed: ").concat(fieldMimes.join(', '))));
    }
};
// Multer instance
exports.upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: storage_1.uploadConfig.maxFileSize,
    },
});
// Middleware for cover upload
exports.uploadCover = exports.upload.single('cover');
// Middleware for audio upload
exports.uploadAudio = exports.upload.single('audio');
// Middleware for avatar upload
exports.uploadAvatar = exports.upload.single('avatar');
// Error handler for multer
var handleUploadError = function (err, _req, res, next) {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json((0, helpers_2.errorResponse)('FILE_TOO_LARGE', 'File size exceeds maximum allowed size'));
            return;
        }
        res.status(400).json((0, helpers_2.errorResponse)('UPLOAD_ERROR', err.message));
        return;
    }
    if (err.message.includes('Invalid file type')) {
        res.status(400).json((0, helpers_2.errorResponse)('INVALID_FILE_TYPE', err.message));
        return;
    }
    next(err);
};
exports.handleUploadError = handleUploadError;
