import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiLogger } from '../utils/logger';

// API Configuration - Tüm ayarlar burada
export const API_CONFIG = {
  // 443 (HTTPS) şimdilik çalışmıyorsa 80 (HTTP) üzerinden istek atabilmek için fallback'i HTTP yaptık.
  baseURL:
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.EXPO_PUBLIC_API_URL_PROD ??
    'http://api.wirbooks.com.tr/api',

  apiKey: process.env.EXPO_PUBLIC_API_KEY ?? '',

  timeout: 60000,
};

// Device ID Storage Key
const DEVICE_ID_KEY = '@sesli_kitap_device_id';

// Device ID'yi al veya oluştur
export const getDeviceId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(DEVICE_ID_KEY);
  } catch {
    return null;
  }
};

// Device ID'yi kaydet
export const setDeviceId = async (deviceId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  } catch (error) {
    console.error('Device ID kaydedilemedi:', error);
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  // Device
  DEVICE_REGISTER: '/device/register',
  DEVICE_STATS: '/device/stats',
  
  // Books (Public)
  BOOKS: '/books',
  BOOKS_FEATURED: '/books/featured',
  BOOKS_POPULAR: '/books/popular',
  BOOKS_SEARCH: '/books/search',
  BOOK_BY_ID: (id: string | number) => `/books/${id}`,
  BOOK_CHAPTERS: (id: string | number) => `/books/${id}/chapters`,
  BOOK_REVIEWS: (id: string | number) => `/books/${id}/reviews`,
  
  // Chapters (Public)
  CHAPTER_BY_ID: (id: string | number) => `/chapters/${id}`,
  CHAPTER_STREAM: (id: string | number) => `/chapters/${id}/stream`,
  
  // Categories (Public)
  CATEGORIES: '/categories',
  CATEGORY_BY_SLUG: (slug: string) => `/categories/${slug}`,
  CATEGORY_BOOKS: (slug: string) => `/categories/${slug}/books`,
  
  // Progress (Device Auth Required)
  DEVICE_PROGRESS: '/device/progress',
  DEVICE_PROGRESS_BOOK: (bookId: string | number) => `/device/progress/${bookId}`,
  
  // Favorites (Device Auth Required)
  DEVICE_FAVORITES: '/device/favorites',
  DEVICE_FAVORITE_ADD: (bookId: string | number) => `/device/favorites/${bookId}`,
  DEVICE_FAVORITE_REMOVE: (bookId: string | number) => `/device/favorites/${bookId}`,
  
  // Reviews (Device Auth Required)
  DEVICE_REVIEW_ADD: (bookId: string | number) => `/device/reviews/${bookId}`,
  
  // Submit Book
  SUBMIT_BOOK: '/submit-book',
  SUBMIT_BOOK_MY: '/submit-book/my',
  UPLOAD: '/upload',
};

// Fetch wrapper with API key + device ID headers
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const deviceId = await getDeviceId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': API_CONFIG.apiKey,
    ...(options.headers as Record<string, string> || {}),
  };

  if (deviceId) {
    headers['X-Device-ID'] = deviceId;
  }
  
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();

  const logHeaders = { ...headers };
  if (logHeaders['X-API-Key']) logHeaders['X-API-Key'] = '***';

  const logMeta: Record<string, unknown> = { headers: logHeaders };
  if (options.body && method !== 'GET') {
    logMeta.body = typeof options.body === 'string' ? options.body : '[FormData]';
  }
  apiLogger.request(method, endpoint, logMeta);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;
    apiLogger.response(method, endpoint, response.status, durationMs);

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;
    apiLogger.response(method, endpoint, 0, durationMs, { error: String(error) });
    apiLogger.error('apiFetch', endpoint, error);
    throw error;
  }
};

// registerDevice eşzamanlı çağrıları engelle
let registerDevicePromise: Promise<string | null> | null = null;

// Cihaz kaydı yap
export const registerDevice = async (
  deviceName?: string,
  platform?: string
): Promise<string | null> => {
  const existingId = await getDeviceId();
  if (existingId) {
    apiLogger.request('POST', API_ENDPOINTS.DEVICE_REGISTER, { cached: true, headers: { 'X-API-Key': '***' } });
    return existingId;
  }

  if (registerDevicePromise) {
    return registerDevicePromise;
  }

  registerDevicePromise = (async () => {
    try {
      apiLogger.request('POST', API_ENDPOINTS.DEVICE_REGISTER, {
        body: { deviceName, platform },
        headers: { 'Content-Type': 'application/json', 'X-API-Key': '***' },
      });
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.DEVICE_REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_CONFIG.apiKey,
        },
        body: JSON.stringify({ deviceName, platform }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      const durationMs = Date.now() - startTime;
      apiLogger.response('POST', API_ENDPOINTS.DEVICE_REGISTER, response.status, durationMs);

      if (data.success && data.data?.id) {
        const deviceId = data.data.id;
        await setDeviceId(deviceId);
        return deviceId;
      }
      return null;
    } catch (error) {
      apiLogger.error('registerDevice', 'Cihaz kaydı hatası', error);
      return null;
    } finally {
      registerDevicePromise = null;
    }
  })();

  return registerDevicePromise;
};

// Helper function to get full URL
export const getFullUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

// Dosya yükle (cover veya ses)
export const uploadFile = async (uri: string, type: string, name: string): Promise<string> => {
  const deviceId = await getDeviceId();
  apiLogger.request('POST', API_ENDPOINTS.UPLOAD, {
    body: { type, name },
    headers: { 'X-API-Key': '***', 'X-Device-ID': deviceId ? '***' : undefined },
  });

  const formData = new FormData();
  formData.append('file', {
    uri,
    type,
    name: name || 'file',
  } as any);

  const headers: Record<string, string> = {
    'X-API-Key': API_CONFIG.apiKey,
  };
  if (deviceId) headers['X-Device-ID'] = deviceId;

  const startTime = Date.now();
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.UPLOAD}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();
  const durationMs = Date.now() - startTime;
  apiLogger.response('POST', API_ENDPOINTS.UPLOAD, response.status, durationMs);

  if (!data.success || !data.data?.url) {
    apiLogger.error('uploadFile', data.message || 'Dosya yüklenemedi');
    throw new Error(data.message || 'Dosya yüklenemedi');
  }
  return data.data.url;
};

// Kitap gönder
export const submitBook = async (payload: {
  title: string;
  author: string;
  narrator: string;
  description?: string;
  category: string;
  cover_image?: string;
  chapters: { title: string; order_num?: number; audio_url: string }[];
}): Promise<{ id: string; status: string }> => {
  apiLogger.request('POST', API_ENDPOINTS.SUBMIT_BOOK, {
    body: { title: payload.title, author: payload.author, chapterCount: payload.chapters?.length },
    headers: { 'Content-Type': 'application/json', 'X-API-Key': '***' },
  });

  const response = await apiFetch(API_ENDPOINTS.SUBMIT_BOOK, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!data.success) {
    apiLogger.error('submitBook', data.message || 'Kitap gönderilemedi');
    throw new Error(data.message || 'Kitap gönderilemedi');
  }
  return data.data;
};

