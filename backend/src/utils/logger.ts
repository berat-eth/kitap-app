/**
 * Detaylı loglama yardımcısı
 * Seviyeler: debug < info < warn < error
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel;
const MIN_LEVEL = LEVEL_PRIORITY[LOG_LEVEL] ?? 1;

function timestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, context: string, message: string, meta?: object): string {
  const metaStr = meta ? ' ' + JSON.stringify(meta) : '';
  return `[${timestamp()}] [${level.toUpperCase().padEnd(5)}] [${context}] ${message}${metaStr}`;
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= MIN_LEVEL;
}

export const logger = {
  debug(context: string, message: string, meta?: object): void {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', context, message, meta));
    }
  },

  info(context: string, message: string, meta?: object): void {
    if (shouldLog('info')) {
      console.info(formatMessage('info', context, message, meta));
    }
  },

  warn(context: string, message: string, meta?: object): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', context, message, meta));
    }
  },

  error(context: string, message: string, meta?: object): void {
    if (shouldLog('error')) {
      console.error(formatMessage('error', context, message, meta));
    }
  },

  /** Hata nesnesi ile loglama (stack trace dahil) */
  errorEx(context: string, message: string, err: Error): void {
    if (shouldLog('error')) {
      console.error(formatMessage('error', context, message, {
        name: err.name,
        message: err.message,
        stack: err.stack,
      }));
    }
  },
};

export const LOG_CONTEXT = {
  SERVER: 'Server',
  DB: 'Database',
  HTTP: 'HTTP',
  API_KEY: 'ApiKey',
  ADMIN: 'Admin',
  BOOKS: 'Books',
  CHAPTERS: 'Chapters',
  CATEGORIES: 'Categories',
  DEVICE: 'Device',
  SUBMIT: 'SubmitBook',
  UPLOAD: 'Upload',
  VOICE: 'VoiceChat',
  ERROR: 'Error',
} as const;
