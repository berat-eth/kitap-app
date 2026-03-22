/** .env / kopyala-yapıştır kaynaklı BOM ve zero-width karakterleri temizler */
function normalizeSecret(v) {
  if (v == null || v === '') return '';
  return String(v)
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

module.exports = { normalizeSecret };
