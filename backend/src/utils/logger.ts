import winston from 'winston';
import { config } from '../config';
import path from 'path';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Log formatı
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Logger instance
const logger = winston.createLogger({
  level: config.logLevel,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    // Konsol çıktısı
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
  ],
});

// Production'da dosyaya da yaz
if (config.isProduction) {
  logger.add(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

export default logger;
