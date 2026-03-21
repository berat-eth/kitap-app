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

    // Existing DB'lerde kolonlar IF NOT EXISTS ile eklenemediği için
    // hata yakalayıp "duplicate column" durumlarını yutuyoruz.
    const bookAlterStatements = [
      `ALTER TABLE books ADD COLUMN device_id CHAR(36) NULL`,
      `ALTER TABLE books ADD COLUMN narrator VARCHAR(255) NULL`,
      `ALTER TABLE books ADD COLUMN status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'`,
      `ALTER TABLE books ADD COLUMN admin_note TEXT NULL`,
      `ALTER TABLE books ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    ];

    for (const stmt of bookAlterStatements) {
      try {
        await conn.query(stmt);
      } catch (e) {
        // MySQL: Duplicate column name / Duplicate entry gibi şeylerde devam et.
        const msg = String(e && e.message ? e.message : e);
        if (
          msg.includes('Duplicate column name') ||
          msg.includes('ER_DUP_FIELDNAME') ||
          msg.includes('already exists')
        ) {
          continue;
        }
        // Diğer hatalarda initDb'yi durdur.
        logger.warn('db.init.bookAlter.ignored', { DB_NAME, sql: stmt, error: e.message });
        // eslint-disable-next-line no-unneeded-ternary
        throw e;
      }
    }

    // status/admin_note olmayan eski kayıtlar için status'u is_active'e göre güncelle.
    try {
      await conn.query(
        `
        UPDATE books
        SET status = CASE
          WHEN is_active = 1 THEN 'approved'
          ELSE 'pending'
        END
        WHERE status IS NULL OR status = ''
      `
      );

      // Reddedilmiş kayıtları admin_note varlığıyla işaretle (eski veri için).
      await conn.query(
        `
        UPDATE books
        SET status = 'rejected'
        WHERE admin_note IS NOT NULL AND admin_note <> '' AND status <> 'rejected'
      `
      );
    } catch (e) {
      logger.warn('db.init.books.statusSync.failed', { DB_NAME, error: e.message });
      // status sync başarısız olsa bile çalışmaya devam et; admin endpointlerde null'lar COALESCE ile ele alınır.
    }

    logger.info('db.init.ok', { DB_NAME });
  } finally {
    await conn.end();
  }
}

module.exports = { initDb };

