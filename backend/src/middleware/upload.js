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

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const AUDIO_EXT = new Set([
  '.mp3',
  '.m4a',
  '.aac',
  '.wav',
  '.ogg',
  '.oga',
  '.opus',
  '.webm',
  '.flac',
]);

function extOf(file) {
  return path.extname(file.originalname || '').toLowerCase();
}

function looksLikeImage(file) {
  if (file.mimetype && file.mimetype.startsWith('image/')) return true;
  return IMAGE_EXT.has(extOf(file));
}

function looksLikeAudio(file) {
  if (file.mimetype && file.mimetype.startsWith('audio/')) return true;
  if (
    (file.mimetype === 'application/octet-stream' || !file.mimetype) &&
    AUDIO_EXT.has(extOf(file))
  ) {
    return true;
  }
  return AUDIO_EXT.has(extOf(file));
}

function getDestForFile(file) {
  if (looksLikeImage(file)) return coversDir;
  if (looksLikeAudio(file)) return audioDir;
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
    if (looksLikeImage(file) || looksLikeAudio(file)) {
      return cb(null, true);
    }
    return cb(
      new Error(
        'Desteklenen türler: ses (mp3, m4a, aac, wav, ogg, opus, webm, flac, …) veya görsel (jpg, png, webp, gif)'
      )
    );
  },
});

module.exports = { upload };

