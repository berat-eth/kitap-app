import { PaginationMeta, PaginationQuery } from '../types';

/**
 * Pagination parametrelerini parse et
 */
export const parsePagination = (
  query: PaginationQuery
): { page: number; limit: number; skip: number } => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Pagination meta bilgisini oluştur
 */
export const createPaginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * Slug oluştur (Türkçe karakterleri dönüştür)
 */
export const createSlug = (text: string): string => {
  const turkishChars: Record<string, string> = {
    ş: 's',
    Ş: 'S',
    ı: 'i',
    İ: 'I',
    ğ: 'g',
    Ğ: 'G',
    ü: 'u',
    Ü: 'U',
    ö: 'o',
    Ö: 'O',
    ç: 'c',
    Ç: 'C',
  };

  let slug = text.toLowerCase();

  // Türkçe karakterleri dönüştür
  for (const [turkish, english] of Object.entries(turkishChars)) {
    slug = slug.replace(new RegExp(turkish, 'g'), english);
  }

  // Sadece alfanumerik ve tire bırak
  slug = slug
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug;
};

/**
 * Süreyi formatla (saniye -> saat:dakika:saniye)
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}s ${minutes}dk`;
  }
  return `${minutes}dk ${secs}sn`;
};

/**
 * Süreyi parse et (saat:dakika -> saniye)
 */
export const parseDuration = (duration: string): number => {
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parseInt(duration, 10) || 0;
};

/**
 * Dosya uzantısını al
 */
export const getFileExtension = (filename: string): string => {
  const ext = filename.split('.').pop();
  return ext ? ext.toLowerCase() : '';
};

/**
 * Geçerli ses dosyası mı kontrol et
 */
export const isValidAudioFile = (filename: string): boolean => {
  const validExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'];
  const ext = getFileExtension(filename);
  return validExtensions.includes(ext);
};

/**
 * Geçerli resim dosyası mı kontrol et
 */
export const isValidImageFile = (filename: string): boolean => {
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const ext = getFileExtension(filename);
  return validExtensions.includes(ext);
};

/**
 * Rastgele string oluştur
 */
export const generateRandomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
