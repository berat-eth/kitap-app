const path = require('path');
const { success, error } = require('../utils/response');
const { logger } = require('../utils/logger');

const uploadsRoot = path.join(__dirname, '../../uploads');

async function uploadFile(req, res) {
  try {
    if (!req.file) return error(res, 'Dosya bulunamadı', 400);

    const relFromUploads = path.relative(uploadsRoot, req.file.path).replace(/\\/g, '/');
    if (relFromUploads.startsWith('..') || path.isAbsolute(relFromUploads)) {
      logger.error('upload.path.escape', { requestId: req.requestId, path: req.file.path });
      return error(res, 'Geçersiz dosya yolu', 500);
    }

    const base = String(
      process.env.UPLOAD_BASE_URL || process.env.PUBLIC_API_ORIGIN || ''
    )
      .trim()
      .replace(/\/+$/, '');
    let url;
    if (base) {
      url = `${base}/uploads/${relFromUploads.split('/').map(encodeURIComponent).join('/')}`;
    } else {
      const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https').toString().split(',')[0].trim();
      const host = (req.headers['x-forwarded-host'] || req.get('host')).toString().split(',')[0].trim();
      url = `${proto}://${host}/uploads/${relFromUploads.split('/').map(encodeURIComponent).join('/')}`;
    }

    logger.info('upload.file.ok', {
      requestId: req.requestId,
      rel: relFromUploads,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    return success(res, { url }, 201);
  } catch (e) {
    logger.error('upload.uploadFile.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'Dosya yükleme başarısız', 500);
  }
}

module.exports = { uploadFile };

