function success(res, data, status = 200, meta) {
  const payload = { success: true, data };
  if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
    Object.assign(payload, meta);
  } else if (meta !== undefined) {
    payload.meta = meta;
  }
  return res.status(status).json(payload);
}

function error(res, message, status = 400, meta) {
  const payload = { success: false, message };
  if (meta !== undefined) payload.meta = meta;
  return res.status(status).json(payload);
}

module.exports = { success, error };

