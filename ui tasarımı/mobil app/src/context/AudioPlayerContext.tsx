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
  });

  const soundRef = useRef<Audio.Sound | null>(null);
  const positionUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  const updatePosition = async () => {
    if (soundRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          setPlayerState(prev => ({
            ...prev,
            position: status.positionMillis / 1000,
            duration: status.durationMillis ? status.durationMillis / 1000 : 0,
            isPlaying: status.isPlaying || false,
          }));
        }
      } catch (error) {
        console.error('Error updating position:', error);
      }
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
    }
  };

  const pause = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      stopPositionUpdates();
    }
  };

  const resume = async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
      startPositionUpdates();
    }
  };

  const seek = async (position: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(position * 1000);
      setPlayerState(prev => ({ ...prev, position }));
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

  React.useEffect(() => {
    return () => {
      stopPositionUpdates();
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
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

