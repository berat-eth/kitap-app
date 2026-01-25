import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { ApiResponse } from '../types';

// Genel API rate limiter
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // .env'den
  max: config.rateLimit.max, // .env'den
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
  } as ApiResponse,
  keyGenerator: (req) => {
    // Device ID varsa onu kullan, yoksa IP
    const deviceId = req.headers['x-device-id'] as string;
    return deviceId || req.ip || 'unknown';
  },
});

// Admin endpoint'leri için daha sıkı limit
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 50, // 15 dakikada maksimum 50 istek
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Admin rate limit aşıldı. Lütfen bekleyin.',
  } as ApiResponse,
});

// Dosya yükleme için limit
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 20, // 1 saatte maksimum 20 yükleme
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Dosya yükleme limiti aşıldı. 1 saat sonra tekrar deneyin.',
  } as ApiResponse,
});
