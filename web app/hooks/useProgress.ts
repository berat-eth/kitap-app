'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/lib/types';
import { getProgress, saveProgress as saveProgressToStorage } from '@/lib/storage';

export const useProgress = (bookId: string) => {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    const savedProgress = getProgress(bookId);
    setProgress(savedProgress);
  }, [bookId]);

  const saveProgress = (chapterId: string, currentTime: number) => {
    const newProgress: Progress = {
      bookId,
      chapterId,
      currentTime,
      lastUpdated: Date.now(),
    };
    saveProgressToStorage(newProgress);
    setProgress(newProgress);
  };

  const clearProgress = () => {
    setProgress(null);
  };

  return {
    progress,
    saveProgress,
    clearProgress,
  };
};

