const mysql = require('mysql2/promise');
const { logger } = require('../utils/logger');
const { getRequestId } = require('../utils/requestContext');

function maskValue(v) {
  if (v == null) return v;
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v;

  if (typeof v === 'string') {
    if (v.split('.').length === 3) return '***JWT***';
    if (v.length > 120) return `${v.slice(0, 10)}***${v.slice(-8)}`;
    if (v.includes('@')) return `${v[0] || '*'}***@***`;
    return v.length > 80 ? `${v.slice(0, 8)}***${v.slice(-6)}` : '***';
  }

  // Objects: avoid logging huge data structures
  if (typeof v === 'object') return '[object]';

  return '***';
}

function maskParams(params) {
  if (!params) return params;
  if (!Array.isArray(params)) return maskValue(params);
  return params.map((p) => maskValue(p));
}

function limitSql(sql) {
  if (!sql) return sql;
  if (sql.length > 1000) return `${sql.slice(0, 500)}...<truncated>${sql.slice(-200)}`;
  return sql;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wirbooks',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Wrap pool.query for timing + SQL/param logging
const originalQuery = pool.query.bind(pool);
pool.query = async (sql, params) => {
  const requestId = getRequestId();
  const startedAt = process.hrtime.bigint();
  const maskedParams = maskParams(params);
  const logBase = {
    requestId,
    sql: limitSql(sql),
    params: maskedParams,
  };

  logger.info('db.query.start', logBase);

  try {
    const result = await originalQuery(sql, params);
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    logger.info('db.query.ok', { ...logBase, durationMs });
    return result;
  } catch (err) {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    logger.error('db.query.err', {
      ...logBase,
      durationMs,
      error: err.message,
      stack: err.stack,
    });
    throw err;
  }
};

module.exports = pool;

