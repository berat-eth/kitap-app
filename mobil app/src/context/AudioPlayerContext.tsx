import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { Audio } from 'expo-av';
import { AudioPlayerState, Book, Chapter } from '../types';

interface AudioPlayerContextType {
  playerState: AudioPlayerState;
  play: (book: Book, chapter?: Chapter) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  toggleMute: () => Promise<void>;
  loadChapter: (chapter: Chapter) => Promise<void>;
  nextChapter: () => void;
  previousChapter: () => void;
  setSleepTimer: (minutes: number | null) => void;
  clearSleepTimer: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
};

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ children }) => {
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentBook: null,
    currentChapter: null,
    position: 0,
    duration: 0,
    playbackRate: 1.0,
    volume: 1.0,
    isMuted: false,
    sleepTimerMinutes: null,
  });

  const soundRef = useRef<Audio.Sound | null>(null);
  const positionUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMockModeRef = useRef<boolean>(false);

  const updatePosition = async () => {
    if (soundRef.current && !isMockModeRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          const position = status.positionMillis ? status.positionMillis / 1000 : 0;
          const duration = status.durationMillis ? status.durationMillis / 1000 : 0;
          setPlayerState(prev => ({
            ...prev,
            position: isNaN(position) ? 0 : position,
            duration: isNaN(duration) ? prev.duration || 0 : duration,
            isPlaying: status.isPlaying || false,
          }));
        }
      } catch (error) {
        console.error('Error updating position:', error);
      }
    } else if (isMockModeRef.current) {
      // Mock mode - simulate progress
      setPlayerState(prev => {
        if (prev.isPlaying && prev.position < prev.duration) {
          const newPosition = Math.min(prev.position + 1, prev.duration);
          return {
            ...prev,
            position: isNaN(newPosition) ? 0 : newPosition,
          };
        }
        return prev;
      });
    }
  };

  const startPositionUpdates = () => {
    if (positionUpdateInterval.current) {
      clearInterval(positionUpdateInterval.current);
    }
    positionUpdateInterval.current = setInterval(updatePosition, 1000);
  };

  const stopPositionUpdates = () => {
    if (positionUpdateInterval.current) {
      clearInterval(positionUpdateInterval.current);
      positionUpdateInterval.current = null;
    }
  };

  const play = async (book: Book, chapter?: Chapter) => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const chapterToPlay = chapter || book.chapters?.[0];
      if (!chapterToPlay) return;

      // Check if audioUrl is valid, if not use mock mode
      const isValidUrl = chapterToPlay.audioUrl && 
        (chapterToPlay.audioUrl.startsWith('http://') || 
         chapterToPlay.audioUrl.startsWith('https://') ||
         chapterToPlay.audioUrl.startsWith('file://'));

      if (!isValidUrl) {
        // Mock mode - simulate audio playback
        console.log('Mock audio mode - no valid URL provided');
        isMockModeRef.current = true;
        setPlayerState(prev => ({
          ...prev,
          isPlaying: true,
          currentBook: book,
          currentChapter: chapterToPlay,
          position: 0,
          duration: 3600, // 1 hour default
        }));
        startPositionUpdates();
        return;
      }

      isMockModeRef.current = false;

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: chapterToPlay.audioUrl },
        { shouldPlay: true, rate: playerState.playbackRate, volume: playerState.volume }
      );

      soundRef.current = sound;
      setPlayerState(prev => ({
        ...prev,
        isPlaying: true,
        currentBook: book,
        currentChapter: chapterToPlay,
      }));

      startPositionUpdates();
    } catch (error) {
      console.error('Error playing audio:', error);
      // Fallback to mock mode on error
      const chapterToPlay = chapter || book.chapters?.[0];
      if (chapterToPlay) {
        setPlayerState(prev => ({
          ...prev,
          isPlaying: true,
          currentBook: book,
          currentChapter: chapterToPlay,
          position: 0,
          duration: 3600,
        }));
        startPositionUpdates();
      }
    }
  };

  const pause = async () => {
    if (soundRef.current && !isMockModeRef.current) {
      await soundRef.current.pauseAsync();
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      stopPositionUpdates();
    } else if (isMockModeRef.current) {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      stopPositionUpdates();
    }
  };

  const resume = async () => {
    if (soundRef.current && !isMockModeRef.current) {
      await soundRef.current.playAsync();
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
      startPositionUpdates();
    } else if (isMockModeRef.current) {
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
      startPositionUpdates();
    }
  };

  const seek = async (position: number) => {
    const clampedPosition = Math.max(0, Math.min(playerState.duration || 0, position));
    if (soundRef.current && !isMockModeRef.current) {
      try {
        await soundRef.current.setPositionAsync(clampedPosition * 1000);
        setPlayerState(prev => ({ ...prev, position: clampedPosition }));
      } catch (error) {
        console.error('Error seeking:', error);
      }
    } else if (isMockModeRef.current) {
      setPlayerState(prev => ({ ...prev, position: clampedPosition }));
    }
  };

  const setPlaybackRate = async (rate: number) => {
    if (soundRef.current) {
      await soundRef.current.setRateAsync(rate, true);
      setPlayerState(prev => ({ ...prev, playbackRate: rate }));
    }
  };

  const setVolume = async (volume: number) => {
    if (soundRef.current) {
      await soundRef.current.setVolumeAsync(volume);
      setPlayerState(prev => ({ ...prev, volume }));
    }
  };

  const toggleMute = async () => {
    if (soundRef.current) {
      const newMuted = !playerState.isMuted;
      await soundRef.current.setVolumeAsync(newMuted ? 0 : playerState.volume);
      setPlayerState(prev => ({ ...prev, isMuted: newMuted }));
    }
  };

  const loadChapter = async (chapter: Chapter) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: chapter.audioUrl },
        { shouldPlay: false, rate: playerState.playbackRate, volume: playerState.volume }
      );

      soundRef.current = sound;
      setPlayerState(prev => ({
        ...prev,
        currentChapter: chapter,
      }));
    } catch (error) {
      console.error('Error loading chapter:', error);
    }
  };

  const nextChapter = () => {
    if (playerState.currentBook?.chapters && playerState.currentChapter) {
      const currentIndex = playerState.currentBook.chapters.findIndex(
        ch => ch.id === playerState.currentChapter?.id
      );
      if (currentIndex < playerState.currentBook.chapters.length - 1) {
        const nextChapter = playerState.currentBook.chapters[currentIndex + 1];
        loadChapter(nextChapter);
        play(playerState.currentBook, nextChapter);
      }
    }
  };

  const previousChapter = () => {
    if (playerState.currentBook?.chapters && playerState.currentChapter) {
      const currentIndex = playerState.currentBook.chapters.findIndex(
        ch => ch.id === playerState.currentChapter?.id
      );
      if (currentIndex > 0) {
        const prevChapter = playerState.currentBook.chapters[currentIndex - 1];
        loadChapter(prevChapter);
        play(playerState.currentBook, prevChapter);
      }
    }
  };

  const setSleepTimer = (minutes: number | null) => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }

    if (minutes && minutes > 0) {
      const milliseconds = minutes * 60 * 1000;
      sleepTimerRef.current = setTimeout(() => {
        pause();
        setPlayerState(prev => ({ ...prev, sleepTimerMinutes: null }));
        sleepTimerRef.current = null;
      }, milliseconds);
      setPlayerState(prev => ({ ...prev, sleepTimerMinutes: minutes }));
    } else {
      setPlayerState(prev => ({ ...prev, sleepTimerMinutes: null }));
    }
  };

  const clearSleepTimer = () => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    setPlayerState(prev => ({ ...prev, sleepTimerMinutes: null }));
  };

  React.useEffect(() => {
    return () => {
      stopPositionUpdates();
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        playerState,
        play,
        pause,
        resume,
        seek,
        setPlaybackRate,
        setVolume,
        toggleMute,
        loadChapter,
        nextChapter,
        previousChapter,
        setSleepTimer,
        clearSleepTimer,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

