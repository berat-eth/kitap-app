const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');
const { getRequestId, runWithRequestContext } = require('../utils/requestContext');

const SENSITIVE_HEADER_KEYS = new Set([
  'x-api-key',
  'authorization',
  'cookie',
  'set-cookie',
]);

const SENSITIVE_BODY_KEYS = new Set([
  'password',
  'refreshToken',
  'refresh_token',
  'token',
  'accessToken',
  'apiKey',
]);

function maskString(value) {
  if (value == null) return value;
  if (typeof value !== 'string') return value;

  // Looks like a JWT (header.payload.signature)
  if (value.split('.').length === 3) return '***JWT***';

  // Long values are typically secrets; mask them
  if (value.length > 80) return `${value.slice(0, 6)}***${value.slice(-4)}`;

  // Email-like values: keep first char, mask domain
  if (value.includes('@')) {
    const [user, domain] = value.split('@');
    const safeUser = user ? user[0] + '***' : '***';
    return `${safeUser}@***`;
  }

  return '***';
}

function maskObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(maskObject);

  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const keyLower = k.toLowerCase();
    if (SENSITIVE_BODY_KEYS.has(k) || SENSITIVE_BODY_KEYS.has(k.replace(/([A-Z])/g, '_$1').toLowerCase()) || keyLower.includes('password') || keyLower.includes('token')) {
      out[k] = maskString(v);
    } else {
      out[k] = maskObject(v);
    }
  }
  return out;
}

function maskHeaders(headers) {
  const out = {};
  for (const [k, v] of Object.entries(headers || {})) {
    const keyLower = k.toLowerCase();
    out[k] = SENSITIVE_HEADER_KEYS.has(keyLower) ? '***' : v;
  }
  return out;
}

function getFileMeta(req) {
  const files = [];
  if (req.file) {
    files.push({
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename,
    });
  }
  if (Array.isArray(req.files)) {
    for (const f of req.files) {
      files.push({
        fieldname: f.fieldname,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        filename: f.filename,
      });
    }
  }
  return files;
}

function getMultipartFormMeta(req) {
  // multipart/form-data için multer file meta önceliklidir; form alanlarını değerleriyle yazmayacağız
  return {
    hasFormFields: req.body && typeof req.body === 'object' ? Object.keys(req.body).length > 0 : false,
    fieldCount: req.body && typeof req.body === 'object' ? Object.keys(req.body).length : 0,
  };
}

function requestLogger(req, res, next) {
  const requestId = uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  const start = Date.now();
  const originalUrl = req.originalUrl || req.url;

  runWithRequestContext(requestId, () => {
    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const isMultipart = (req.headers['content-type'] || '').includes('multipart/form-data');

      const logPayload = {
        requestId: getRequestId(),
        method: req.method,
        path: originalUrl,
        query: req.query,
        status: res.statusCode,
        durationMs,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        headers: maskHeaders(req.headers),
      };

      if (!isMultipart) {
        logPayload.body = maskObject(req.body);
      } else {
        logPayload.files = getFileMeta(req);
        logPayload.multipart = getMultipartFormMeta(req);
      }

      logger.info('http.request', logPayload);
    });

    next();
  });
}

module.exports = { requestLogger };

