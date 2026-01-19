import { Progress } from './types';

const STORAGE_KEY = 'audiobook_progress';

export const saveProgress = (progress: Progress): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const allProgress = getAllProgress();
    allProgress[progress.bookId] = progress;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Progress kaydedilemedi:', error);
  }
};

export const getProgress = (bookId: string): Progress | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const allProgress = getAllProgress();
    return allProgress[bookId] || null;
  } catch (error) {
    console.error('Progress okunamadı:', error);
    return null;
  }
};

export const getAllProgress = (): Record<string, Progress> => {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Progress verileri okunamadı:', error);
    return {};
  }
};

export const clearProgress = (bookId: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const allProgress = getAllProgress();
    delete allProgress[bookId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Progress silinemedi:', error);
  }
};

