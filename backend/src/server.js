require('dotenv').config();

const { createApp } = require('./app');
const { initDb } = require('./db/init');
const { logger } = require('./utils/logger');

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
  app.listen(PORT, () => {
    logger.info('server.started', { port: PORT });
  });
}

start();

