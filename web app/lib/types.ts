export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  category: string;
  duration?: number;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  order: number;
  audioUrl: string;
  duration?: number;
}

export interface Progress {
  bookId: string;
  chapterId: string;
  currentTime: number;
  lastUpdated: number;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  currentChapter: Chapter | null;
  isLoading: boolean;
}

