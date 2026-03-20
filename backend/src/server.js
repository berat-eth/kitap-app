// Tek env dosyası: /root/data/.env (deploy script ile)
const dotenv = require('dotenv');
const envPath = process.env.ENV_PATH || '/root/data/.env';
const dotenvResult = dotenv.config({ path: envPath, override: true });

const http = require('http');
const { createApp } = require('./app');
const { initDb } = require('./db/init');
const { logger } = require('./utils/logger');

if (dotenvResult && dotenvResult.error) {
  logger.warn('server.env.missing', {
    envPath,
    error: dotenvResult.error.message,
  });
} else {
  // Hassas veri yazmadan env'nin yüklendiğini doğrula
  logger.info('server.env.loaded', {
    envPath,
    DB_HOST: process.env.DB_HOST || null,
    DB_USER: process.env.DB_USER || null,
    DB_NAME: process.env.DB_NAME || null,
    HAS_DB_PASSWORD: Boolean(process.env.DB_PASSWORD),
    HAS_API_KEY: Boolean(process.env.API_KEY),
    HAS_UPLOAD_BASE_URL: Boolean(process.env.UPLOAD_BASE_URL),
  });
}

async function start() {
  const PORT = process.env.PORT || 3001;
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbName = process.env.DB_NAME;
  const skipDbInit = String(process.env.SKIP_DB_INIT || '').toLowerCase() === 'true';

  try {
    if (skipDbInit) {
      logger.warn('server.db.init.skipped', {
        DB_NAME: dbName,
        DB_HOST: dbHost,
        DB_USER: dbUser,
      });
    } else {
      // MySQL bazen servise geç başlıyor; kısa retry'ler için.
      const maxAttempts = 6;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          await initDb();
          logger.info('server.db.init.done', { DB_NAME: dbName, DB_HOST: dbHost, DB_USER: dbUser, attempt });
          break;
        } catch (err) {
          const isLast = attempt === maxAttempts;
          logger.error('server.db.init.attempt.failed', {
            message: err.message,
            DB_NAME: dbName,
            DB_HOST: dbHost,
            DB_USER: dbUser,
            attempt,
            isLast,
          });
          if (isLast) throw err;
          // 3s bekle, ardından tekrar dene
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }
  } catch (err) {
    logger.error('server.db.init.failed', {
      message: err.message,
      stack: err.stack,
      DB_NAME: dbName,
      DB_HOST: dbHost,
      DB_USER: dbUser,
      envPath,
    });
    process.exit(1);
  }

  const app = createApp();
  const server = http.createServer(app);

  server.listen(PORT, () => {
    logger.info('server.started', { port: PORT });
  });
}

start();

