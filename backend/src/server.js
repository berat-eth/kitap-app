// Tek env dosyası: /root/data/.env (deploy script ile)
const dotenv = require('dotenv');
const envPath = process.env.ENV_PATH || '/root/data/.env';
const dotenvResult = dotenv.config({ path: envPath });

const http = require('http');
const { createApp } = require('./app');
const { initDb } = require('./db/init');
const { logger } = require('./utils/logger');

const { Server } = require('socket.io');
const { registerVoiceChatSocket } = require('./sockets/voiceChatSocket');
const pool = require('./db/pool');

if (dotenvResult && dotenvResult.error) {
  logger.warn('server.env.missing', {
    envPath,
    error: dotenvResult.error.message,
  });
}

async function start() {
  const PORT = process.env.PORT || 3001;

  try {
    await initDb();
    logger.info('server.db.init.done', { DB_NAME: process.env.DB_NAME });
  } catch (err) {
    logger.error('server.db.init.failed', { message: err.message, stack: err.stack });
    process.exit(1);
  }

  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  registerVoiceChatSocket(io, { pool, logger });

  server.listen(PORT, () => {
    logger.info('server.started', { port: PORT });
  });
}

start();

