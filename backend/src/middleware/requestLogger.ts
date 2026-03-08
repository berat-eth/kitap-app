import { Request, Response, NextFunction } from 'express';
import { logger, LOG_CONTEXT } from '../utils/logger';

const SENSITIVE_HEADERS = ['x-api-key', 'authorization', 'cookie'];
const BODY_MAX_LEN = 500;

function sanitizeHeaders(headers: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    const key = k.toLowerCase();
    if (SENSITIVE_HEADERS.some((h) => key.includes(h))) {
      out[k] = '***';
    } else if (v !== undefined && v !== null) {
      out[k] = String(v);
    }
  }
  return out;
}

function truncateBody(body: unknown): string | undefined {
  if (body === undefined || body === null) return undefined;
  try {
    const str = typeof body === 'string' ? body : JSON.stringify(body);
    return str.length > BODY_MAX_LEN ? str.slice(0, BODY_MAX_LEN) + '...' : str;
  } catch {
    return '[non-serializable]';
  }
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',').map((s) => s.trim());
    return ips[0] || req.ip || req.socket.remoteAddress || 'unknown';
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl } = req;
  const clientIp = getClientIp(req);
  const deviceId = req.headers['x-device-id'] as string | undefined;

  const meta: Record<string, unknown> = {
    clientIp,
    method,
    endpoint: originalUrl,
    deviceId: deviceId || '-',
    headers: sanitizeHeaders(req.headers as Record<string, unknown>),
  };

  if (method !== 'GET' && req.body !== undefined && Object.keys(req.body || {}).length > 0) {
    meta.body = truncateBody(req.body);
  }

  logger.info(LOG_CONTEXT.HTTP, `[BAĞLANTI] IP: ${clientIp} | ${method} ${originalUrl}`, meta);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    const meta: Record<string, unknown> = {
      clientIp: getClientIp(req),
      method,
      endpoint: originalUrl,
      status: statusCode,
      durationMs: duration,
      deviceId: deviceId || '-',
    };

    if (statusCode >= 500) {
      logger.error(LOG_CONTEXT.HTTP, 'Request completed (5xx)', meta);
    } else if (statusCode >= 400) {
      logger.warn(LOG_CONTEXT.HTTP, 'Request completed (4xx)', meta);
    } else {
      logger.info(LOG_CONTEXT.HTTP, 'Request completed', meta);
    }
  });

  next();
}
