const { success, error } = require('../utils/response');
const { logger } = require('../utils/logger');

async function uploadFile(req, res) {
  try {
    if (!req.file) return error(res, 'Dosya bulunamadı', 400);

    const mimetype = req.file.mimetype || '';
    const filename = req.file.filename;
    const isAudio = mimetype.startsWith('audio/');

    // Frontend (web) farklı domain'den görsel isteyebilir; bu yüzden mutlak URL döndür.
    const proto = (req.headers['x-forwarded-proto'] || 'https').toString();
    const host = (req.headers['x-forwarded-host'] || req.get('host')).toString();
    const url = isAudio
      ? `${proto}://${host}/uploads/audio/${filename}`
      : `${proto}://${host}/uploads/covers/${filename}`;

    return success(res, { url }, 201);
  } catch (e) {
    logger.error('upload.uploadFile.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'Dosya yükleme başarısız', 500);
  }
}

module.exports = { uploadFile };

