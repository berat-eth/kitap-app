'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Chapter, AudioPlayerState } from '@/lib/types';
import { useProgress } from './useProgress';

export const useAudioPlayer = (bookId: string, initialChapter?: Chapter) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    currentChapter: initialChapter || null,
    isLoading: false,
  });

  const { progress, saveProgress } = useProgress(bookId);

  // İlerleme kaydını yükle
  useEffect(() => {
    if (progress && initialChapter && progress.chapterId === initialChapter.id) {
      setState((prev) => ({
        ...prev,
        currentTime: progress.currentTime,
      }));
    }
  }, [progress, initialChapter]);

  // Audio element oluştur
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audioRef.current = audio;

    const updateTime = () => {
      setState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      }));
    };

    const handleLoadedMetadata = () => {
      setState((prev) => ({
        ...prev,
        duration: audio.duration,
        isLoading: false,
      }));
    };

    const handleEnded = () => {
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));
    };

    const handlePlay = () => {
      setState((prev) => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // İlerleme kaydını otomatik kaydet
  useEffect(() => {
    if (!state.currentChapter || !audioRef.current) return;

    const interval = setInterval(() => {
      if (state.currentChapter && audioRef.current) {
        saveProgress(state.currentChapter.id, audioRef.current.currentTime);
      }
    }, 5000); // Her 5 saniyede bir kaydet

    return () => clearInterval(interval);
  }, [state.currentChapter, saveProgress]);

  const loadChapter = useCallback(async (chapter: Chapter) => {
    if (!audioRef.current) return;

    setState((prev) => ({ ...prev, isLoading: true }));
    audioRef.current.pause();
    audioRef.current.src = chapter.audioUrl;
    audioRef.current.playbackRate = state.playbackRate;

    // İlerleme varsa kaldığı yerden devam et
    if (progress && progress.chapterId === chapter.id) {
      audioRef.current.currentTime = progress.currentTime;
    } else {
      audioRef.current.currentTime = 0;
    }

    setState((prev) => ({
      ...prev,
      currentChapter: chapter,
      currentTime: audioRef.current?.currentTime || 0,
    }));

    try {
      await audioRef.current.load();
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Bölüm yüklenemedi:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [state.playbackRate, progress]);

  const play = useCallback(async () => {
    if (!audioRef.current) return;

    if (!state.currentChapter) {
      if (initialChapter) {
        await loadChapter(initialChapter);
      } else {
        return;
      }
    }

    try {
      await audioRef.current.play();
    } catch (error) {
      console.error('Oynatılamadı:', error);
    }
  }, [state.currentChapter, initialChapter, loadChapter]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, state.duration));
      setState((prev) => ({ ...prev, currentTime: audioRef.current?.currentTime || 0 }));
    }
  }, [state.duration]);

  const setSpeed = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setState((prev) => ({ ...prev, playbackRate: rate }));
    }
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (state.isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [state.isPlaying, play, pause]);

  // İlk bölümü yükle
  useEffect(() => {
    if (initialChapter && !state.currentChapter) {
      loadChapter(initialChapter);
    }
  }, [initialChapter, state.currentChapter, loadChapter]);

  return {
    ...state,
    play,
    pause,
    togglePlayPause,
    seek,
    setSpeed,
    loadChapter,
    audioRef,
  };
};

