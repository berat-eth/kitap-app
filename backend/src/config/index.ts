import dotenv from 'dotenv';
import path from 'path';

// .env dosyasını yükle
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || '/api',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'sesli_kitap',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || '',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    enabled: !!process.env.REDIS_HOST,
  },

  // Admin
  adminApiKey: process.env.ADMIN_API_KEY || 'default-admin-key',

  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',').map(origin => origin.trim()) || ['*'],

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 dakika
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Upload
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '50000000', 10), // 50MB
    audioPath: process.env.AUDIO_UPLOAD_PATH || './uploads/audio',
    imagePath: process.env.IMAGE_UPLOAD_PATH || './uploads/images',
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Swagger
  swaggerEnabled: process.env.SWAGGER_ENABLED === 'true',
};

// Config doğrulama
export const validateConfig = (): void => {
  const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn(`⚠️ Eksik ortam değişkenleri: ${missingVars.join(', ')}`);
  }

  console.log('✅ Config yüklendi:');
  console.log(`   - Ortam: ${config.nodeEnv}`);
  console.log(`   - Port: ${config.port}`);
  console.log(`   - Veritabanı: ${config.database.host}:${config.database.port}/${config.database.name}`);
  console.log(`   - Redis: ${config.redis.enabled ? `${config.redis.host}:${config.redis.port}` : 'Devre dışı'}`);
};

export default config;
