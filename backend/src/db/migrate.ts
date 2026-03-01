import fs from 'fs';
import path from 'path';
import pool, { testConnection } from '../config/database';
import { env } from '../config/env';

async function migrate(): Promise<void> {
  await testConnection();

  // Veritabanını açıkça seç (shared hosting uyumluluğu)
  const dbEscaped = '`' + env.DB_NAME.replace(/`/g, '``') + '`';
  await pool.execute(`USE ${dbEscaped}`);
  const [rows] = await pool.execute<[{ database: string }[]]>('SELECT DATABASE() as database');
  const dbName = (rows as any)[0]?.database;
  console.log('Using database:', dbName);

  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => {
      if (!s || s.startsWith('--')) return false;
      const upper = s.toUpperCase();
      if (upper.startsWith('CREATE DATABASE') || upper.startsWith('USE ')) return false;
      return true;
    });

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.slice(0, 80).replace(/\n/g, ' ');
    try {
      await pool.execute(statement);
      console.log(`[${i + 1}/${statements.length}] OK:`, preview, '...');
    } catch (err: any) {
      console.error(`[${i + 1}/${statements.length}] FAILED:`, preview);
      console.error('Error:', err.message);
      throw err;
    }
  }

  console.log('Migration completed successfully.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
