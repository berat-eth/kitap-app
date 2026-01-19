// API Configuration
export const API_CONFIG = {
  // Production API
  baseURL: __DEV__ 
    ? 'http://localhost:3001/api' // Development
    : 'https://api.kitap.beratsimsek.com.tr/api', // Production
  
  timeout: 30000, // 30 seconds
  
  // Headers
  headers: {
    'Content-Type': 'application/json',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Device Auth
  DEVICE_REGISTER: '/device/register',
  DEVICE_PROFILE: '/device/profile',
  
  // Books
  BOOKS: '/books',
  BOOKS_FEATURED: '/books/featured',
  BOOKS_RECOMMENDED: '/books/recommended',
  BOOK_BY_ID: (id: string) => `/books/${id}`,
  
  // Categories
  CATEGORIES: '/categories',
  CATEGORY_BY_SLUG: (slug: string) => `/categories/${slug}`,
  
  // Chapters
  CHAPTERS: (bookId: string) => `/books/${bookId}/chapters`,
  CHAPTER_BY_ID: (bookId: string, chapterId: string) => `/books/${bookId}/chapters/${chapterId}`,
  
  // Progress
  PROGRESS: '/progress',
  PROGRESS_BY_BOOK: (bookId: string) => `/progress/${bookId}`,
  
  // Favorites
  FAVORITES: '/favorites',
  FAVORITE_ADD: (bookId: string) => `/favorites/${bookId}`,
  FAVORITE_REMOVE: (bookId: string) => `/favorites/${bookId}`,
  
  // Downloads
  DOWNLOADS: '/downloads',
  DOWNLOAD_START: (bookId: string) => `/downloads/${bookId}`,
  DOWNLOAD_REMOVE: (bookId: string) => `/downloads/${bookId}`,
  
  // Public (no auth)
  PUBLIC_BOOKS: '/public/books',
  PUBLIC_CATEGORIES: '/public/categories',
};

// Helper function to get full URL
export const getFullUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

