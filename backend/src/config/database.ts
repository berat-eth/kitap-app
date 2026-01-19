import mysql from 'mysql2/promise';
import { config } from './env';

let pool: mysql.Pool | null = null;

export const createConnection = async (): Promise<mysql.Pool> => {
  if (pool) {
    return pool;
  }

  pool = mysql.createPool({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // Uzak sunucu için timeout ayarları
    connectTimeout: 60000, // 60 saniye
    acquireTimeout: 60000,
    timeout: 60000,
    // SSL bağlantısı (eğer gerekiyorsa)
    ssl: config.database.ssl ? {
      rejectUnauthorized: config.database.sslRejectUnauthorized !== false,
    } : false,
  });

  // Test connection
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }

  return pool;
};

export const getPool = (): mysql.Pool => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call createConnection() first.');
  }
  return pool;
};

export const closeConnection = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection closed');
  }
};

