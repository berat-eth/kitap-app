const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const UPLOAD_MAX_SIZE = parseInt(process.env.UPLOAD_MAX_SIZE, 10) || 52428800; // 50MB

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/audio/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp3';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/covers/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const audioUpload = multer({
  storage: audioStorage,
  limits: { fileSize: UPLOAD_MAX_SIZE },
  fileFilter: (req, file, cb) => {
    const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Sadece ses dosyaları kabul edilir (mp3, wav, ogg)'));
  },
});

const coverUpload = multer({
  storage: coverStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Sadece resim dosyaları kabul edilir (jpg, png, webp)'));
  },
});

module.exports = { audioUpload, coverUpload };
