import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { AudioPlayerState, Book, Chapter } from '../types';

/** Medya oynatma: hoparlör, tam seviye oturumu (ahize / düşük karışım sorunlarını önler) */
async function applyAudiobookAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false,
  });
}

function clampVolume(v: number): number {
  return Math.min(1, Math.max(0, v));
}

interface AudioPlayerContextType {
  playerState: AudioPlayerState;
  play: (book: Book, chapter?: Chapter) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  /** Mutlak konum (saniye) */
  seek: (positionSeconds: number) => Promise<void>;
  /** Seek bar: 0–100 */
  seekToProgressPercent: (percent: number) => Promise<void>;
  /** +30 / -15 gibi; mevcut konumu dosyadan okur */
  skipRelative: (deltaSeconds: number) => Promise<void>;
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
  /** API’den gelen bölüm süresi (sn) — dosya metadata gelene kadar seek için */
  const chapterDurationSecondsRef = useRef(0);
  /** Son bilinen toplam süre (sn) — state gecikmesinde seek için */
  const knownDurationRef = useRef(0);

  function maxDurationFromLoaded(
    st: { isLoaded: true; durationMillis?: number; positionMillis?: number },
    stateFallback: number
  ): number {
    const fromFile =
      typeof st.durationMillis === 'number' && st.durationMillis > 0 ? st.durationMillis / 1000 : 0;
    return (
      fromFile ||
      chapterDurationSecondsRef.current ||
      knownDurationRef.current ||
      stateFallback ||
      0
    );
  }

  const updatePosition = async () => {
    if (soundRef.current && !isMockModeRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status && status.isLoaded) {
          const position = status.positionMillis ? status.positionMillis / 1000 : 0;
          const duration = status.durationMillis ? status.durationMillis / 1000 : 0;
          if (duration > 0) knownDurationRef.current = duration;
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
      await applyAudiobookAudioMode();

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
        try {
          await soundRef.current.unloadAsync();
        } finally {
          soundRef.current = null;
        }
      }

      chapterDurationSecondsRef.current = Math.max(0, chapterToPlay.durationSeconds ?? 0);

      const effectiveVol = playerState.isMuted ? 0 : clampVolume(playerState.volume);
      const { sound } = await Audio.Sound.createAsync(
        { uri: chapterToPlay.audioUrl },
        { shouldPlay: true, rate: playerState.playbackRate, volume: effectiveVol }
      );

      soundRef.current = sound;
      await sound.setVolumeAsync(effectiveVol);

      const st0 = await sound.getStatusAsync();
      let initialDur = chapterDurationSecondsRef.current;
      let initialPos = 0;
      if (st0.isLoaded) {
        if (typeof st0.durationMillis === 'number' && st0.durationMillis > 0) {
          initialDur = st0.durationMillis / 1000;
          knownDurationRef.current = initialDur;
        }
        if (typeof st0.positionMillis === 'number') initialPos = st0.positionMillis / 1000;
      }

      setPlayerState(prev => ({
        ...prev,
        isPlaying: true,
        currentBook: book,
        currentChapter: chapterToPlay,
        duration: initialDur || prev.duration,
        position: initialPos,
      }));

      startPositionUpdates();
      void updatePosition();
    } catch (error) {
      // Fallback to mock mode on error (silently)
      console.log('Audio playback failed, using mock mode');
      isMockModeRef.current = true;
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
      try {
        const st = await soundRef.current.getStatusAsync();
        if (st.isLoaded) await soundRef.current.pauseAsync();
      } catch {
        /* ignore */
      }
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      stopPositionUpdates();
    } else if (isMockModeRef.current) {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      stopPositionUpdates();
    }
  };

  const resume = async () => {
    if (soundRef.current && !isMockModeRef.current) {
      try {
        const st = await soundRef.current.getStatusAsync();
        if (!st.isLoaded) return;
      } catch {
        return;
      }
      await applyAudiobookAudioMode();
      await soundRef.current.playAsync();
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
      startPositionUpdates();
    } else if (isMockModeRef.current) {
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
      startPositionUpdates();
    }
  };

  const seek = async (positionSeconds: number) => {
    if (isMockModeRef.current) {
      setPlayerState(prev => {
        const d = prev.duration || 3600;
        const t = d > 0 ? Math.max(0, Math.min(d, positionSeconds)) : Math.max(0, positionSeconds);
        return { ...prev, position: t };
      });
      return;
    }
    const sound = soundRef.current;
    if (!sound) return;
    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;
      const maxSec = maxDurationFromLoaded(status, 0);
      const target =
        maxSec > 0 ? Math.max(0, Math.min(maxSec, positionSeconds)) : Math.max(0, positionSeconds);
      await sound.setPositionAsync(target * 1000);
      if (maxSec > 0) knownDurationRef.current = maxSec;
      setPlayerState(prev => ({
        ...prev,
        position: target,
        duration: maxSec || prev.duration,
      }));
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const seekToProgressPercent = async (percent: number) => {
    const p = Math.max(0, Math.min(100, percent));
    if (isMockModeRef.current) {
      setPlayerState(prev => {
        const d = prev.duration || 3600;
        return { ...prev, position: (p / 100) * d };
      });
      return;
    }
    const sound = soundRef.current;
    if (!sound) return;
    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;
      const maxSec = maxDurationFromLoaded(status, 0);
      if (maxSec <= 0) return;
      const target = (p / 100) * maxSec;
      await sound.setPositionAsync(target * 1000);
      knownDurationRef.current = maxSec;
      setPlayerState(prev => ({
        ...prev,
        position: target,
        duration: maxSec,
      }));
    } catch (e) {
      console.error('Error seekToProgressPercent:', e);
    }
  };

  const skipRelative = async (deltaSeconds: number) => {
    if (isMockModeRef.current) {
      setPlayerState(prev => {
        const d = prev.duration || 3600;
        const next = prev.position + deltaSeconds;
        const t = d > 0 ? Math.max(0, Math.min(d, next)) : Math.max(0, next);
        return { ...prev, position: t };
      });
      return;
    }
    const sound = soundRef.current;
    if (!sound) return;
    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;
      const cur = (status.positionMillis ?? 0) / 1000;
      const maxSec = maxDurationFromLoaded(status, 0);
      const next = cur + deltaSeconds;
      const target = maxSec > 0 ? Math.max(0, Math.min(maxSec, next)) : Math.max(0, next);
      await sound.setPositionAsync(target * 1000);
      if (maxSec > 0) knownDurationRef.current = maxSec;
      setPlayerState(prev => ({
        ...prev,
        position: target,
        duration: maxSec || prev.duration,
      }));
    } catch (e) {
      console.error('Error skipRelative:', e);
    }
  };

  const setPlaybackRate = async (rate: number) => {
    if (soundRef.current && !isMockModeRef.current) {
      try {
        const st = await soundRef.current.getStatusAsync();
        if (st.isLoaded) {
          await soundRef.current.setRateAsync(rate, true);
        }
      } catch {
        /* ignore */
      }
    }
    setPlayerState(prev => ({ ...prev, playbackRate: rate }));
  };

  const setVolume = async (volume: number) => {
    const v = clampVolume(volume);
    setPlayerState(prev => ({ ...prev, volume: v }));
    if (soundRef.current && !isMockModeRef.current) {
      try {
        const st = await soundRef.current.getStatusAsync();
        if (st.isLoaded) await soundRef.current.setVolumeAsync(v);
      } catch {
        /* ignore */
      }
    }
  };

  const toggleMute = async () => {
    const nextMuted = !playerState.isMuted;
    const restoreVol = clampVolume(playerState.volume);
    setPlayerState(prev => ({ ...prev, isMuted: nextMuted }));
    if (soundRef.current && !isMockModeRef.current) {
      try {
        const st = await soundRef.current.getStatusAsync();
        if (st.isLoaded) {
          await soundRef.current.setVolumeAsync(nextMuted ? 0 : restoreVol);
        }
      } catch {
        /* ignore */
      }
    }
  };

  const loadChapter = async (chapter: Chapter) => {
    try {
      await applyAudiobookAudioMode();
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } finally {
          soundRef.current = null;
        }
      }

      chapterDurationSecondsRef.current = Math.max(0, chapter.durationSeconds ?? 0);

      const effectiveVol = playerState.isMuted ? 0 : clampVolume(playerState.volume);
      const { sound } = await Audio.Sound.createAsync(
        { uri: chapter.audioUrl },
        { shouldPlay: false, rate: playerState.playbackRate, volume: effectiveVol }
      );

      soundRef.current = sound;
      await sound.setVolumeAsync(effectiveVol);
      const stL = await sound.getStatusAsync();
      let d = chapterDurationSecondsRef.current;
      if (stL.isLoaded && typeof stL.durationMillis === 'number' && stL.durationMillis > 0) {
        d = stL.durationMillis / 1000;
        knownDurationRef.current = d;
      }
      setPlayerState(prev => ({
        ...prev,
        currentChapter: chapter,
        duration: d || prev.duration,
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
        const nextCh = playerState.currentBook.chapters[currentIndex + 1];
        void play(playerState.currentBook, nextCh);
      }
    }
  };

  const previousChapter = () => {
    if (playerState.currentBook?.chapters && playerState.currentChapter) {
      const currentIndex = playerState.currentBook.chapters.findIndex(
        ch => ch.id === playerState.currentChapter?.id
      );
      if (currentIndex > 0) {
        const prevCh = playerState.currentBook.chapters[currentIndex - 1];
        void play(playerState.currentBook, prevCh);
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
        void soundRef.current.unloadAsync().finally(() => {
          soundRef.current = null;
        });
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
        seekToProgressPercent,
        skipRelative,
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

