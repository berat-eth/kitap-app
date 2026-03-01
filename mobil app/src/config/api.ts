import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration - Tüm ayarlar burada
export const API_CONFIG = {
  baseURL: __DEV__
    ? (process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3001/api')
    : (process.env.EXPO_PUBLIC_API_URL_PROD ?? 'https://api.kitap.beratsimsek.com.tr/api'),

  apiKey: process.env.EXPO_PUBLIC_API_KEY ?? '',

  timeout: 30000,
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
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Cihaz kaydı yap
export const registerDevice = async (
  deviceName?: string,
  platform?: string
): Promise<string | null> => {
  try {
    // Zaten kayıtlı mı kontrol et
    const existingId = await getDeviceId();
    if (existingId) {
      return existingId;
    }
    
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.DEVICE_REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_CONFIG.apiKey,
      },
      body: JSON.stringify({ deviceName, platform }),
    });
    
    const data = await response.json();
    
    if (data.success && data.data?.deviceId) {
      await setDeviceId(data.data.deviceId);
      return data.data.deviceId;
    }
    
    return null;
  } catch (error) {
    console.error('Cihaz kaydı hatası:', error);
    return null;
  }
};

// Helper function to get full URL
export const getFullUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

// Dosya yükle (cover veya ses)
export const uploadFile = async (uri: string, type: string, name: string): Promise<string> => {
  const deviceId = await getDeviceId();
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

  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.UPLOAD}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();
  if (!data.success || !data.data?.url) {
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
  const response = await apiFetch(API_ENDPOINTS.SUBMIT_BOOK, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'Kitap gönderilemedi');
  }
  return data.data;
};

