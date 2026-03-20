const mysql = require('mysql2/promise');
const { statements, DB_NAME } = require('./schema');
const { logger } = require('../utils/logger');

async function initDb() {
  const { DB_HOST, DB_USER, DB_PASSWORD } = process.env;
  const host = DB_HOST || 'localhost';
  const user = DB_USER || 'root';
  const password = DB_PASSWORD || '';

  const conn = await mysql.createConnection({
    host,
    user,
    password,
    multipleStatements: true,
  });

  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    await conn.query(`USE \`${DB_NAME}\``);

    for (const stmt of statements) {
      try {
        await conn.query(stmt);
      } catch (e) {
        logger.error('db.init.statement.failed', { DB_NAME, sql: stmt, error: e.message, stack: e.stack });
        throw e;
      }
    }
    logger.info('db.init.ok', { DB_NAME });
  } finally {
    await conn.end();
  }
}

module.exports = { initDb };

