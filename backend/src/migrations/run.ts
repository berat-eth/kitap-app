import fs from 'fs';
import path from 'path';
import { createConnection, getPool } from '../config/database';

const runMigrations = async (): Promise<void> => {
  try {
    await createConnection();
    const pool = getPool();

    const migrationsDir = path.join(__dirname);
    const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql'));

    // Sort files to run in order
    files.sort();

    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      // Split by semicolon and execute each statement
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          await pool.execute(statement);
        }
      }

      console.log(`✅ Migration ${file} completed`);
    }

    console.log('✅ All migrations completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();

