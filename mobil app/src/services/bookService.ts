import { apiFetch, API_ENDPOINTS, API_CONFIG } from '../config/api';
import { Book, Category, Chapter } from '../types';

// ── API response types ──────────────────────────────────────────────────────
interface ApiBook {
  id: string;
  title: string;
  author: string;
  narrator?: string;
  description?: string;
  cover_image?: string;
  category_id?: string;
  category?: { id: string; name: string; slug: string };
  duration: number;
  rating: number;
  is_featured?: boolean;
  is_popular?: boolean;
  play_count?: number;
}

interface ApiChapter {
  id: string;
  book_id: string;
  title: string;
  order_num: number;
  audio_url: string;
  duration: number;
}

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  book_count?: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0dk';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}sa ${m}dk`;
  return `${m}dk`;
}

function mapApiBookToBook(api: ApiBook, chapters?: Chapter[]): Book {
  const categoryName = api.category?.name ?? '';
  return {
    id: api.id,
    title: api.title,
    author: api.author,
    narrator: api.narrator,
    coverImage: api.cover_image || 'https://via.placeholder.com/400x600?text=Kitap',
    duration: formatDuration(api.duration),
    rating: Number(api.rating) || 0,
    category: categoryName,
    description: api.description,
    chapters,
  };
}

function mapApiChapterToChapter(api: ApiChapter): Chapter {
  let audioUrl = api.audio_url;
  if (!audioUrl.startsWith('http')) {
    const base = API_CONFIG.baseURL.replace(/\/api\/?$/, '');
    audioUrl = api.audio_url.startsWith('/') ? `${base}${api.audio_url}` : `${base}/${api.audio_url}`;
  }
  return {
    id: api.id,
    title: api.title,
    duration: formatDuration(api.duration),
    audioUrl,
  };
}

function mapApiCategoryToCategory(api: ApiCategory): Category {
  return { id: api.slug || api.id, name: api.name };
}

// ── API calls ───────────────────────────────────────────────────────────────

export async function getFeaturedBooks(): Promise<Book[]> {
  const res = await apiFetch(API_ENDPOINTS.BOOKS_FEATURED);
  const data = await res.json();
  if (!data.success || !Array.isArray(data.data)) return [];
  return data.data.map((b: ApiBook) => mapApiBookToBook(b));
}

export async function getPopularBooks(): Promise<Book[]> {
  const res = await apiFetch(API_ENDPOINTS.BOOKS_POPULAR);
  const data = await res.json();
  if (!data.success || !Array.isArray(data.data)) return [];
  return data.data.map((b: ApiBook) => mapApiBookToBook(b));
}

export async function getBooks(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<{ books: Book[]; total: number }> {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.category) q.set('category', params.category);
  if (params?.search) q.set('search', params.search);
  const query = q.toString();
  const endpoint = query ? `${API_ENDPOINTS.BOOKS}?${query}` : API_ENDPOINTS.BOOKS;
  const res = await apiFetch(endpoint);
  const data = await res.json();
  if (!data.success) return { books: [], total: 0 };
  const books = (data.data || []).map((b: ApiBook) => mapApiBookToBook(b));
  const total = data.pagination?.total ?? books.length;
  return { books, total };
}

export async function searchBooks(q: string): Promise<Book[]> {
  if (!q.trim()) return [];
  const res = await apiFetch(`${API_ENDPOINTS.BOOKS_SEARCH}?q=${encodeURIComponent(q.trim())}`);
  const data = await res.json();
  if (!data.success || !Array.isArray(data.data)) return [];
  return data.data.map((b: ApiBook) => mapApiBookToBook(b));
}

export async function getBookById(id: string): Promise<Book | null> {
  const res = await apiFetch(API_ENDPOINTS.BOOK_BY_ID(id));
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.success || !data.data) return null;
  const apiBook = data.data as ApiBook;
  const chaptersRes = await apiFetch(API_ENDPOINTS.BOOK_CHAPTERS(id));
  let chapters: Chapter[] = [];
  if (chaptersRes.ok) {
    const chData = await chaptersRes.json();
    if (chData.success && Array.isArray(chData.data)) {
      chapters = chData.data.map((c: ApiChapter) => mapApiChapterToChapter(c));
    }
  }
  return mapApiBookToBook(apiBook, chapters);
}

export async function getBookChapters(bookId: string): Promise<Chapter[]> {
  const res = await apiFetch(API_ENDPOINTS.BOOK_CHAPTERS(bookId));
  const data = await res.json();
  if (!data.success || !Array.isArray(data.data)) return [];
  return data.data.map((c: ApiChapter) => mapApiChapterToChapter(c));
}

export async function getCategories(): Promise<Category[]> {
  const res = await apiFetch(API_ENDPOINTS.CATEGORIES);
  const data = await res.json();
  if (!data.success || !Array.isArray(data.data)) return [];
  const categories = data.data.map((c: ApiCategory) => mapApiCategoryToCategory(c));
  return [{ id: 'all', name: 'Tümü' }, ...categories];
}

export async function getFavoriteBooks(): Promise<Book[]> {
  const res = await apiFetch(API_ENDPOINTS.DEVICE_FAVORITES);
  const data = await res.json();
  if (!data.success || !Array.isArray(data.data)) return [];
  const bookIds = data.data.map((f: { book_id: string }) => f.book_id);
  const books: Book[] = [];
  for (const id of bookIds) {
    const b = await getBookById(id);
    if (b) books.push(b);
  }
  return books;
}

export async function addFavorite(bookId: string): Promise<boolean> {
  const res = await apiFetch(API_ENDPOINTS.DEVICE_FAVORITE_ADD(bookId), { method: 'POST' });
  const data = await res.json();
  return data.success === true;
}

export async function removeFavorite(bookId: string): Promise<boolean> {
  const res = await apiFetch(API_ENDPOINTS.DEVICE_FAVORITE_REMOVE(bookId), { method: 'DELETE' });
  const data = await res.json();
  return data.success === true;
}
