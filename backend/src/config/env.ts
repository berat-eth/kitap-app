import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const env = {
  PORT: parseInt(optionalEnv('PORT', '3001'), 10),
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),

  API_KEY: requireEnv('API_KEY'),
  ADMIN_API_KEY: requireEnv('ADMIN_API_KEY'),

  DB_HOST: requireEnv('DB_HOST'),
  DB_PORT: parseInt(optionalEnv('DB_PORT', '3306'), 10),
  DB_USER: requireEnv('DB_USER'),
  DB_PASSWORD: requireEnv('DB_PASSWORD'),
  DB_NAME: requireEnv('DB_NAME'),
  DB_CONNECTION_LIMIT: parseInt(optionalEnv('DB_CONNECTION_LIMIT', '10'), 10),

  ALLOWED_ORIGINS: optionalEnv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',').map((o) => o.trim()),

  RATE_LIMIT_WINDOW_MS: parseInt(optionalEnv('RATE_LIMIT_WINDOW_MS', '60000'), 10),
  RATE_LIMIT_MAX: parseInt(optionalEnv('RATE_LIMIT_MAX', '100'), 10),

  LOG_LEVEL: optionalEnv('LOG_LEVEL', 'info'),
} as const;
