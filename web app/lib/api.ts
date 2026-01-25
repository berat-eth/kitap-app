import { Book, Chapter } from './types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

// Fetch wrapper
const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const deviceId = getDeviceId();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (deviceId) {
    (headers as Record<string, string>)['X-Device-ID'] = deviceId;
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
  
  const result = await apiFetch<Book[]>(endpoint);
  return result.success && result.data ? result.data : [];
};

export const getBookById = async (id: string): Promise<Book> => {
  const result = await apiFetch<Book>(`/books/${id}`);
  
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Kitap bulunamadı');
  }
  
  return result.data;
};

export const getFeaturedBooks = async (): Promise<Book[]> => {
  const result = await apiFetch<Book[]>('/books/featured');
  return result.success && result.data ? result.data : [];
};

export const getPopularBooks = async (): Promise<Book[]> => {
  const result = await apiFetch<Book[]>('/books/popular');
  return result.success && result.data ? result.data : [];
};

export const searchBooks = async (query: string): Promise<Book[]> => {
  if (!query.trim()) return [];
  
  const result = await apiFetch<Book[]>(`/books/search?q=${encodeURIComponent(query)}`);
  return result.success && result.data ? result.data : [];
};

// Bölüm API'leri
export const getChapters = async (bookId: string): Promise<Chapter[]> => {
  const result = await apiFetch<Chapter[]>(`/books/${bookId}/chapters`);
  return result.success && result.data ? result.data : [];
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
  const result = await apiFetch<{ books: Book[] }>(`/categories/${slug}/books`);
  return result.success && result.data?.books ? result.data.books : [];
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
  const result = await apiFetch<Book[]>('/device/favorites');
  return result.success && result.data ? result.data : [];
};

export const addToFavorites = async (bookId: string): Promise<boolean> => {
  const result = await apiFetch(`/device/favorites/${bookId}`, { method: 'POST' });
  return result.success;
};

export const removeFromFavorites = async (bookId: string): Promise<boolean> => {
  const result = await apiFetch(`/device/favorites/${bookId}`, { method: 'DELETE' });
  return result.success;
};

