const { success, error } = require('../utils/response');
const { logger } = require('../utils/logger');

async function uploadFile(req, res) {
  try {
    if (!req.file) return error(res, 'Dosya bulunamadı', 400);

    const filename = req.file.filename;
    const destPath = String(req.file.path || '').replace(/\\/g, '/');
    const subdir = /\/covers\//.test(destPath) ? 'covers' : 'audio';

    const base = String(
      process.env.UPLOAD_BASE_URL || process.env.PUBLIC_API_ORIGIN || ''
    )
      .trim()
      .replace(/\/+$/, '');
    let url;
    if (base) {
      url = `${base}/uploads/${subdir}/${filename}`;
    } else {
      // Frontend (web) farklı domain'den görsel isteyebilir; bu yüzden mutlak URL döndür.
      const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https').toString().split(',')[0].trim();
      const host = (req.headers['x-forwarded-host'] || req.get('host')).toString().split(',')[0].trim();
      url = `${proto}://${host}/uploads/${subdir}/${filename}`;
    }

    return success(res, { url }, 201);
  } catch (e) {
    logger.error('upload.uploadFile.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'Dosya yükleme başarısız', 500);
  }
}

module.exports = { uploadFile };

