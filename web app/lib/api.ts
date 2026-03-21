import { Book, Chapter } from './types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

// Device ID yönetimi (localStorage)
const DEVICE_ID_KEY = 'sesli_kitap_device_id';

export const getDeviceId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DEVICE_ID_KEY);
};

export const setDeviceId = (deviceId: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
};

// API Response type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Backend payload'ları (web UI contract'ına map etmek için)
interface ApiBook {
  id: string;
  title: string;
  author: string;
  description?: string | null;
  narrator?: string | null;
  cover_image?: string | null;
  cover_url?: string | null;
  duration?: number;
  duration_seconds?: number;
  rating?: number;
  play_count?: number;
  category?: string | { name?: string | null } | null;
}

interface ApiChapter {
  id: string;
  book_id?: string;
  title: string;
  order_no?: number;
  order_num?: number;
  audio_url?: string;
}

function mapApiBookToWebBook(api: ApiBook): Book {
  const coverImage = api.cover_image || api.cover_url || '';
  const categoryName =
    typeof api.category === 'string' ? api.category : (api.category as any)?.name || '';

  return {
    id: api.id,
    title: api.title,
    author: api.author,
    description: api.description ?? '',
    coverImage,
    category: categoryName,
    duration: api.duration ?? api.duration_seconds ?? undefined,
  };
}

function mapApiChapterToWebChapter(api: ApiChapter): Chapter {
  return {
    id: api.id,
    bookId: api.book_id || '',
    title: api.title,
    order: api.order_no ?? api.order_num ?? 0,
    audioUrl: api.audio_url || '',
    duration: undefined,
  };
}

// Fetch wrapper
const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const deviceId = getDeviceId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
    ...(options.headers as Record<string, string> || {}),
  };

  if (deviceId) {
    headers['X-Device-ID'] = deviceId;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    return await response.json();
  } catch (error) {
    console.error('API hatası:', error);
    return { success: false, error: 'Bağlantı hatası' };
  }
};

// Cihaz kaydı
export const registerDevice = async (
  deviceName?: string,
  platform: string = 'web'
): Promise<string | null> => {
  const existingId = getDeviceId();
  if (existingId) return existingId;
  
  const result = await apiFetch<{ deviceId: string }>('/device/register', {
    method: 'POST',
    body: JSON.stringify({ deviceName, platform }),
  });
  
  if (result.success && result.data?.deviceId) {
    setDeviceId(result.data.deviceId);
    return result.data.deviceId;
  }
  
  return null;
};

// Kitap API'leri
export const getBooks = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
}): Promise<Book[]> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.category) queryParams.set('category', params.category);
  if (params?.search) queryParams.set('search', params.search);
  if (params?.featured) queryParams.set('featured', 'true');
  
  const query = queryParams.toString();
  const endpoint = `/books${query ? `?${query}` : ''}`;
  
  const result = await apiFetch<ApiBook[]>(endpoint);
  return result.success && result.data ? result.data.map(mapApiBookToWebBook) : [];
};

export const getBookById = async (id: string): Promise<Book> => {
  const result = await apiFetch<ApiBook>(`/books/${id}`);
  
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Kitap bulunamadı');
  }
  
  return mapApiBookToWebBook(result.data);
};

export const getFeaturedBooks = async (): Promise<Book[]> => {
  const result = await apiFetch<ApiBook[]>('/books/featured');
  return result.success && result.data ? result.data.map(mapApiBookToWebBook) : [];
};

export const getPopularBooks = async (): Promise<Book[]> => {
  const result = await apiFetch<ApiBook[]>('/books/popular');
  return result.success && result.data ? result.data.map(mapApiBookToWebBook) : [];
};

export const searchBooks = async (query: string): Promise<Book[]> => {
  if (!query.trim()) return [];
  
  const result = await apiFetch<ApiBook[]>(`/books/search?q=${encodeURIComponent(query)}`);
  return result.success && result.data ? result.data.map(mapApiBookToWebBook) : [];
};

// Bölüm API'leri
export const getChapters = async (bookId: string): Promise<Chapter[]> => {
  const result = await apiFetch<ApiChapter[]>(`/books/${bookId}/chapters`);
  return result.success && result.data ? result.data.map(mapApiChapterToWebChapter) : [];
};

export const getAudioUrl = async (chapterId: string): Promise<string> => {
  const result = await apiFetch<{ audioUrl: string }>(`/chapters/${chapterId}/stream`);
  return result.data?.audioUrl || '';
};

// Kategori API'leri
interface CategoryWithCount {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  bookCount: number;
}

export const getCategories = async (): Promise<string[]> => {
  const result = await apiFetch<CategoryWithCount[]>('/categories');
  if (result.success && result.data) {
    return result.data.map(c => c.name);
  }
  return [];
};

export const getCategoriesWithDetails = async (): Promise<CategoryWithCount[]> => {
  const result = await apiFetch<CategoryWithCount[]>('/categories');
  return result.success && result.data ? result.data : [];
};

export const getBooksByCategory = async (slug: string): Promise<Book[]> => {
  const result = await apiFetch<{ books: ApiBook[] }>(`/categories/${slug}/books`);
  return result.success && result.data?.books ? result.data.books.map(mapApiBookToWebBook) : [];
};

// Progress API'leri (Device ID gerekli)
export const getProgress = async (bookId: string) => {
  const result = await apiFetch(`/device/progress/${bookId}`);
  return result.success ? result.data : null;
};

export const saveProgress = async (
  bookId: string,
  chapterId: number,
  currentTime: number,
  isCompleted: boolean = false
) => {
  const result = await apiFetch(`/device/progress/${bookId}`, {
    method: 'POST',
    body: JSON.stringify({ chapterId, currentTime, isCompleted }),
  });
  return result.success;
};

// Favoriler API'leri
export const getFavorites = async (): Promise<Book[]> => {
  const result = await apiFetch<ApiBook[]>('/device/favorites');
  return result.success && result.data ? result.data.map(mapApiBookToWebBook) : [];
};

export const addToFavorites = async (bookId: string): Promise<boolean> => {
  const result = await apiFetch(`/device/favorites/${bookId}`, { method: 'POST' });
  return result.success;
};

export const removeFromFavorites = async (bookId: string): Promise<boolean> => {
  const result = await apiFetch(`/device/favorites/${bookId}`, { method: 'DELETE' });
  return result.success;
};

