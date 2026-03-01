import mysql from 'mysql2/promise';
import { env } from './env';

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
  console.log('MySQL connection pool established successfully.');
}

export default pool;
