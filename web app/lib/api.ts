import { Book, Chapter } from './types';
import { mockBooks, mockChapters, mockCategories } from './mockData';

// Simüle edilmiş gecikme (gerçek API gibi)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getBooks = async (): Promise<Book[]> => {
  await delay(300); // 300ms gecikme simülasyonu
  return [...mockBooks];
};

export const getBookById = async (id: string): Promise<Book> => {
  await delay(200);
  const book = mockBooks.find((b) => b.id === id);
  if (!book) {
    throw new Error(`Kitap bulunamadı: ${id}`);
  }
  return { ...book };
};

export const getChapters = async (bookId: string): Promise<Chapter[]> => {
  await delay(200);
  const chapters = mockChapters[bookId] || [];
  return [...chapters].sort((a, b) => a.order - b.order);
};

export const getAudioUrl = async (chapterId: string): Promise<string> => {
  await delay(100);
  // Bölüm ID'sinden kitap ID'sini çıkar
  const bookId = chapterId.split('-')[0];
  const chapters = mockChapters[bookId] || [];
  const chapter = chapters.find((c) => c.id === chapterId);
  
  if (!chapter) {
    // Varsayılan audio URL
    return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  }
  
  return chapter.audioUrl;
};

export const searchBooks = async (query: string): Promise<Book[]> => {
  await delay(300);
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) {
    return [...mockBooks];
  }
  
  return mockBooks.filter(
    (book) =>
      book.title.toLowerCase().includes(lowerQuery) ||
      book.author.toLowerCase().includes(lowerQuery) ||
      book.description?.toLowerCase().includes(lowerQuery) ||
      book.category?.toLowerCase().includes(lowerQuery)
  );
};

export const getBooksByCategory = async (category: string): Promise<Book[]> => {
  await delay(300);
  return mockBooks.filter((book) => book.category === category);
};

export const getCategories = async (): Promise<string[]> => {
  await delay(200);
  return [...mockCategories];
};

