import fs from 'fs';
import path from 'path';
import pool, { testConnection } from '../config/database';

async function migrate(): Promise<void> {
  await testConnection();

  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => {
      if (!s || s.startsWith('--')) return false;
      const upper = s.toUpperCase();
      // Veritabanı bağlantısı pool tarafından yönetilir, bu komutları atla
      if (upper.startsWith('CREATE DATABASE') || upper.startsWith('USE ')) return false;
      return true;
    });

  for (const statement of statements) {
    await pool.execute(statement);
    console.log('Executed:', statement.slice(0, 60).replace(/\n/g, ' '), '...');
  }

  console.log('Migration completed successfully.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
