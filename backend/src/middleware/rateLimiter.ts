import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { logger, LOG_CONTEXT } from '../utils/logger';

export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'You have exceeded the request limit. Please try again later.',
  },
  handler: (req, res, _next, options) => {
    logger.warn(LOG_CONTEXT.HTTP, 'Rate limit exceeded', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
    });
    res.status(options.statusCode).json(options.message);
  },
});

export const strictRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many requests to this endpoint. Please slow down.',
  },
});
