/**
 * Wirbooks API — sunucu tarafı (SSR)
 */

function getBase() {
  return (process.env.API_BASE || 'https://api.wirbooks.com.tr/api').replace(/\/+$/, '');
}

function fileOrigin() {
  const b = getBase();
  return b.replace(/\/api\/?$/i, '') || b;
}

export function resolveUrl(u) {
  if (!u) return '';
  const s = String(u);
  if (/^https?:\/\//i.test(s)) return s;
  const o = fileOrigin();
  return s.startsWith('/') ? o + s : `${o}/${s}`;
}

async function apiGet(path) {
  const headers = { 'Content-Type': 'application/json' };
  const k = process.env.API_KEY;
  if (k) headers['X-API-Key'] = k;
  const res = await fetch(`${getBase()}${path}`, { headers });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.success) return null;
  return data.data;
}

export function mapBook(row) {
  if (!row) return null;
  const cat = row.category;
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    narrator: row.narrator || '',
    description: row.description || '',
    cover: resolveUrl(row.cover_image || row.cover_url),
    durationSec: Number(row.duration ?? row.duration_seconds ?? 0),
    rating: Number(row.rating ?? 0),
    categoryName: cat?.name || '',
    categorySlug: cat?.slug || '',
  };
}

export function mapChapter(row) {
  return {
    id: row.id,
    title: row.title,
    order: Number(row.order_num ?? row.order_no ?? 0),
    durationSec: Number(row.duration ?? row.duration_seconds ?? 0),
  };
}

export async function fetchFeatured() {
  const rows = await apiGet('/books/featured');
  if (!Array.isArray(rows)) return [];
  return rows.map(mapBook).filter(Boolean);
}

export async function fetchPopular() {
  const rows = await apiGet('/books/popular');
  if (!Array.isArray(rows)) return [];
  return rows.map(mapBook).filter(Boolean);
}

export async function fetchCategories() {
  const rows = await apiGet('/categories');
  if (!Array.isArray(rows)) return [];
  return rows.map((c) => ({
    id: String(c.id),
    name: c.name,
    slug: c.slug,
  }));
}

export async function fetchBook(id) {
  const row = await apiGet(`/books/${encodeURIComponent(id)}`);
  return mapBook(row);
}

export async function fetchChapters(bookId) {
  const rows = await apiGet(`/books/${encodeURIComponent(bookId)}/chapters`);
  if (!Array.isArray(rows)) return [];
  return rows.map(mapChapter);
}

export async function searchBooks(q) {
  const query = String(q || '').trim();
  if (!query) return [];
  const rows = await apiGet(`/books/search?q=${encodeURIComponent(query)}`);
  if (!Array.isArray(rows)) return [];
  return rows.map(mapBook).filter(Boolean);
}

export async function fetchBooksByCategory(slug, limit = 24) {
  const rows = await apiGet(`/books?category=${encodeURIComponent(slug)}&limit=${limit}`);
  if (!Array.isArray(rows)) return [];
  return rows.map(mapBook).filter(Boolean);
}
