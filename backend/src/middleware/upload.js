const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const audioDir = path.join(__dirname, '../../uploads/audio');
const coversDir = path.join(__dirname, '../../uploads/covers');
ensureDir(audioDir);
ensureDir(coversDir);

const UPLOAD_MAX_BYTES = (() => {
  const mb = parseInt(process.env.UPLOAD_MAX_SIZE_MB || '50', 10);
  const bytes = mb * 1024 * 1024;
  return Number.isFinite(bytes) ? bytes : 50 * 1024 * 1024;
})();

function getDestForFile(file) {
  if (file.mimetype && file.mimetype.startsWith('audio/')) return audioDir;
  if (file.mimetype && file.mimetype.startsWith('image/')) return coversDir;
  // fallback
  return audioDir;
}

function getExt(file) {
  const extFromName = path.extname(file.originalname || '');
  if (extFromName) return extFromName;
  if (file.mimetype === 'image/png') return '.png';
  if (file.mimetype === 'image/webp') return '.webp';
  if (file.mimetype === 'image/jpeg') return '.jpg';
  return '.bin';
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, getDestForFile(file));
    },
    filename: (req, file, cb) => {
      cb(null, `${uuidv4()}${getExt(file)}`);
    },
  }),
  limits: { fileSize: UPLOAD_MAX_BYTES },
  fileFilter: (req, file, cb) => {
    const isAudio = file.mimetype && file.mimetype.startsWith('audio/');
    const isImage = file.mimetype && file.mimetype.startsWith('image/');
    if (!isAudio && !isImage) {
      return cb(new Error('Sadece audio veya image dosyaları kabul edilir'));
    }
    cb(null, true);
  },
});

module.exports = { upload };

