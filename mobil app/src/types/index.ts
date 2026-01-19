export interface Book {
  id: string;
  title: string;
  author: string;
  narrator?: string;
  coverImage: string;
  duration: string; // e.g., "11sa 24dk"
  rating: number;
  category: string;
  description?: string;
  chapters?: Chapter[];
  isDownloaded?: boolean;
  downloadProgress?: number;
  isCompleted?: boolean;
  progress?: number; // 0-100
  lastPlayedAt?: Date;
}

export interface Chapter {
  id: string;
  title: string;
  duration: string;
  audioUrl: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentBook: Book | null;
  currentChapter: Chapter | null;
  position: number; // in seconds
  duration: number; // in seconds
  playbackRate: number; // 0.5 - 3.0
  volume: number; // 0 - 1
  isMuted: boolean;
  sleepTimerMinutes?: number | null; // Sleep timer in minutes
}

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
  };
}

