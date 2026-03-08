import mysql from 'mysql2/promise';
import { env } from './env';
import { logger, LOG_CONTEXT } from '../utils/logger';

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  waitForConnections: true,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+00:00',
});

export async function testConnection(): Promise<void> {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
  logger.info(LOG_CONTEXT.DB, 'MySQL connection pool established', {
    host: env.DB_HOST,
    database: env.DB_NAME,
    connectionLimit: env.DB_CONNECTION_LIMIT,
  });
}

export default pool;
