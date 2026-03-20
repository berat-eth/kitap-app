const winston = require('winston');
const util = require('util');

function safeInspect(value, { maxLen = 2000 } = {}) {
  if (value == null) return String(value);
  let str = util.inspect(value, {
    depth: 6,
    maxArrayLength: 50,
    breakLength: 120,
    compact: false,
  });
  // Çok uzunsa ortadan kırp.
  if (str.length > maxLen) {
    str = `${str.slice(0, Math.floor(maxLen * 0.6))}...<truncated>...${str.slice(-Math.floor(maxLen * 0.25))}`;
  }
  return str;
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = meta && Object.keys(meta).length ? ` ${safeInspect(meta)}` : '';
      return `${timestamp} ${level}: ${message}${metaStr}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

module.exports = { logger };

