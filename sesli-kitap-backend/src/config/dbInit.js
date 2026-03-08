const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'sesli_kitap';

async function initDatabase() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    await conn.query(`USE \`${DB_NAME}\``);

    const schemaPath = path.join(__dirname, '../../sql/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    const statements = schema
      .split(';')
      .map((s) =>
        s
          .split('\n')
          .filter((line) => !line.trim().startsWith('--'))
          .join('\n')
          .trim()
      )
      .filter((s) => s && !s.toUpperCase().startsWith('USE'));

    for (const stmt of statements) {
      if (stmt.toUpperCase().startsWith('CREATE DATABASE')) continue;
      const modifiedStmt = stmt.toUpperCase().startsWith('CREATE TABLE')
        ? stmt.replace(/^CREATE TABLE\s+(?:IF NOT EXISTS\s+)?/i, 'CREATE TABLE IF NOT EXISTS ')
        : stmt;
      await conn.query(modifiedStmt);
    }
  } finally {
    await conn.end();
  }
}

module.exports = { initDatabase };
