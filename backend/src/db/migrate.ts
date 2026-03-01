import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from '../config/env';

async function migrate(): Promise<void> {
  // Pool yerine direkt connection kullan (USE komutu için)
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    charset: 'utf8mb4',
    multipleStatements: false,
  });

  console.log('MySQL connection established successfully.');
  console.log('Using database:', env.DB_NAME);

  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  // Yorumları temizle ve CREATE TABLE bloklarını ayır
  const cleaned = sql
    .replace(/--[^\n]*/g, '')   // satır yorumları
    .replace(/\/\*[\s\S]*?\*\//g, ''); // blok yorumları

  // Noktalı virgülle böl ama COMMENT içindeki noktalı virgülleri koru
  const statements = cleaned
    .split(';')
    .map((s) => s.trim())
    .filter((s) => {
      if (!s) return false;
      const upper = s.toUpperCase();
      if (upper.startsWith('CREATE DATABASE') || upper.startsWith('USE ')) return false;
      return true;
    });

  console.log(`Found ${statements.length} statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.slice(0, 80).replace(/\n/g, ' ');
    try {
      await connection.execute(statement);
      console.log(`[${i + 1}/${statements.length}] OK: ${preview}`);
    } catch (err: any) {
      console.error(`[${i + 1}/${statements.length}] FAILED: ${preview}`);
      console.error('Error:', err.message);
      await connection.end();
      throw err;
    }
  }

  await connection.end();
  console.log('Migration completed successfully.');

  // Tabloları doğrula
  const conn2 = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    charset: 'utf8mb4',
  });
  const [tables] = await conn2.execute('SHOW TABLES');
  console.log('Tables in database:');
  (tables as any[]).forEach((row) => console.log(' -', Object.values(row)[0]));
  await conn2.end();

  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
