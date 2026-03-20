const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { requestLogger } = require('./middleware/requestLogger');
const { apiKeyOptional } = require('./middleware/apiKeyOptional');

const deviceRoutes = require('./routes/device.routes');
const booksRoutes = require('./routes/books.routes');
const categoriesRoutes = require('./routes/categories.routes');
const uploadRoutes = require('./routes/upload.routes');
const submitRoutes = require('./routes/submit.routes');
const chaptersRoutes = require('./routes/chapters.routes');

function createApp() {
  const app = express();

  // Nginx proxy arkasında Express'e gerçek client IP'leri (X-Forwarded-For)
  // doğru yansısın diye gerekli. Aksi halde express-rate-limit
  // ERR_ERL_UNEXPECTED_X_FORWARDED_FOR hatası üretebilir.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors());

  app.use(
    express.json({
      limit: '2mb',
    })
  );

  // Çok detaylı request log (body/files dahil)
  app.use(requestLogger);

  // API rate limit
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: 'Çok fazla istek. Lütfen tekrar deneyin.' },
  });
  app.use('/api', limiter);

  // İsteğe bağlı API key doğrulama (X-API-Key)
  app.use('/api', apiKeyOptional);

  // Upload statik servis
  app.use(
    '/uploads',
    express.static(path.join(__dirname, '../uploads'), {
      fallthrough: false,
    })
  );

  app.use('/api/device', deviceRoutes);
  app.use('/api/books', booksRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/submit-book', submitRoutes);
  app.use('/api/chapters', chaptersRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Wirbooks API', timestamp: new Date().toISOString() });
  });

  // Global error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    const { logger } = require('./utils/logger');
    const requestId = req.requestId;
    logger.error('http.error', {
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      query: req.query,
      status,
      message: err.message,
      stack: err.stack,
    });
    res.status(status).json({ success: false, message: err.message || 'Sunucu hatası' });
  });

  return app;
}

module.exports = { createApp };

