import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  // Database
  database: {
    url: process.env.DATABASE_URL || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'audiobook_db',
    // Uzak sunucu için SSL ayarları
    ssl: process.env.DB_SSL === 'true',
    sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  },

  // Admin JWT
  adminJwt: {
    secret: process.env.ADMIN_JWT_SECRET || '',
    refreshSecret: process.env.ADMIN_JWT_REFRESH_SECRET || '',
    expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.ADMIN_JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Device ID
  device: {
    headerName: process.env.DEVICE_ID_HEADER || 'X-Device-ID',
  },

  // File Upload (moved to storage.ts)

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    enabled: process.env.REDIS_ENABLED === 'true',
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    enabled: process.env.EMAIL_ENABLED === 'true',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    adminMaxRequests: parseInt(process.env.ADMIN_RATE_LIMIT_MAX_REQUESTS || '1000', 10),
  },
};

// Validation
if (!config.adminJwt.secret) {
  throw new Error('ADMIN_JWT_SECRET is required');
}

if (!config.adminJwt.refreshSecret) {
  throw new Error('ADMIN_JWT_REFRESH_SECRET is required');
}

