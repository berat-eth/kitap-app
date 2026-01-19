'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Book, Chapter } from '@/lib/types';
import { getBookById, getChapters } from '@/lib/api';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function BookListenPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = params.id as string;
  const chapterParam = searchParams.get('chapter');

  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [volume, setVolume] = useState(70);
  const [sleepTimer, setSleepTimer] = useState<string | null>(null);
  const [showSleepMenu, setShowSleepMenu] = useState(false);

  const {
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    seek,
    setSpeed,
    loadChapter,
  } = useAudioPlayer(bookId, currentChapter || undefined);

  useEffect(() => {
    if (bookId) {
      loadBookData();
    }
  }, [bookId]);

  useEffect(() => {
    if (currentChapter) {
      loadChapter(currentChapter);
    }
  }, [currentChapter, loadChapter]);

  useEffect(() => {
    setSpeed(playbackSpeed);
  }, [playbackSpeed, setSpeed]);

  const loadBookData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [bookData, chaptersData] = await Promise.all([
        getBookById(bookId),
        getChapters(bookId),
      ]);

      setBook(bookData);
      setChapters(chaptersData);

      if (chaptersData.length > 0) {
        // Eğer URL'de chapter parametresi varsa onu seç
        if (chapterParam) {
          const chapter = chaptersData.find((c) => c.id === chapterParam);
          if (chapter) {
            setCurrentChapter(chapter);
          } else {
            setCurrentChapter(chaptersData[0]);
          }
        } else {
          setCurrentChapter(chaptersData[0]);
        }
      }
    } catch (err) {
      console.error('Kitap yüklenemedi:', err);
      setError('Kitap yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChapterChange = (chapter: Chapter) => {
    setCurrentChapter(chapter);
  };

  const handlePreviousChapter = () => {
    if (!currentChapter) return;
    const currentIndex = chapters.findIndex((c) => c.id === currentChapter.id);
    if (currentIndex > 0) {
      setCurrentChapter(chapters[currentIndex - 1]);
    }
  };

  const handleNextChapter = () => {
    if (!currentChapter) return;
    const currentIndex = chapters.findIndex((c) => c.id === currentChapter.id);
    if (currentIndex < chapters.length - 1) {
      setCurrentChapter(chapters[currentIndex + 1]);
    }
  };

  const handleSeekBackward = () => {
    seek(Math.max(0, currentTime - 15));
  };

  const handleSeekForward = () => {
    seek(Math.min(duration, currentTime + 15));
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    return `${mins}:${mins.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error || 'Kitap bulunamadı'}</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary mb-4">Bu kitap için bölüm bulunamadı</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  const currentChapterIndex = chapters.findIndex((c) => c.id === currentChapter?.id);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between whitespace-nowrap px-6 py-3 neu-glass z-20">
        <div className="flex items-center gap-8">
          <Link href={`/kitap/${bookId}`} className="flex items-center gap-3 text-slate-900 dark:text-white group cursor-pointer">
            <div className="size-10 text-primary group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-[40px]">graphic_eq</span>
            </div>
            <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] hidden sm:block">
              AudioBook
            </h2>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/kutuphane" className="text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors">
              Kütüphane
            </Link>
            <Link href="/kesfet" className="text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors">
              Keşfet
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 justify-end gap-4 md:gap-8 items-center">
          <ThemeToggle />
          <Link
            href={`/kitap/${bookId}`}
            className="px-4 py-2 rounded-xl neu-glass-button text-sm font-medium text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-all"
          >
            Kitap Detayı
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 overflow-y-auto w-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[5000ms]"></div>
          
          <div className="w-full max-w-[560px] flex flex-col gap-10 animate-fade-in">
            {/* Book Cover */}
            <div className="flex flex-col items-center gap-8">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-3xl transform scale-90 translate-y-6 group-hover:bg-primary/30 transition-all duration-500"></div>
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl neu-glass-elevated overflow-hidden transform transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2">
                  {book.coverImage ? (
                    <Image
                      src={book.coverImage}
                      alt={book.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      priority
                      sizes="(max-width: 768px) 256px, 320px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary via-purple-600 to-indigo-800 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {book.title}
                </h1>
                <p className="text-lg text-slate-700 dark:text-text-secondary font-medium hover:text-primary cursor-pointer transition-colors">
                  {book.author}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col gap-3 w-full mt-2">
              <div className="neu-glass-card rounded-xl p-4">
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = x / rect.width;
                    seek(percentage * duration);
                  }}
                  className="relative w-full h-2 neu-glass-input rounded-full group cursor-pointer overflow-visible"
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-purple-500 rounded-full relative transition-all duration-300 shadow-lg shadow-primary/30"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 size-5 bg-white rounded-full neu-glass-elevated opacity-0 group-hover:opacity-100 transition-opacity transform scale-0 group-hover:scale-100 duration-200"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-text-secondary font-mono tracking-wide mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            {/* Player Controls */}
            <div className="neu-glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between w-full gap-2 sm:gap-4">
                <button
                  className="p-3 neu-glass-button text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white rounded-xl transition-all duration-300"
                  title="Karıştır"
                >
                  <span className="material-symbols-outlined text-[24px]">shuffle</span>
                </button>
                <button
                  onClick={handlePreviousChapter}
                  disabled={currentChapterIndex === 0}
                  className="p-3 neu-glass-button text-slate-900 dark:text-white hover:text-primary rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Önceki Bölüm"
                >
                  <span className="material-symbols-outlined text-[32px]">skip_previous</span>
                </button>
                <button
                  onClick={handleSeekBackward}
                  className="p-3 neu-glass-button text-slate-900 dark:text-white hover:text-primary rounded-xl transition-all duration-300"
                  title="15 Saniye Geri"
                >
                  <span className="material-symbols-outlined text-[28px]">replay_10</span>
                </button>
                <button
                  onClick={togglePlayPause}
                  className="flex items-center justify-center size-16 md:size-20 bg-gradient-to-br from-primary to-purple-500 text-white rounded-full neu-glass-elevated transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-primary/40"
                >
                  <span className="material-symbols-outlined text-[40px] md:text-[48px] ml-1">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <button
                  onClick={handleSeekForward}
                  className="p-3 neu-glass-button text-slate-900 dark:text-white hover:text-primary rounded-xl transition-all duration-300"
                  title="15 Saniye İleri"
                >
                  <span className="material-symbols-outlined text-[28px]">forward_10</span>
                </button>
                <button
                  onClick={handleNextChapter}
                  disabled={currentChapterIndex === chapters.length - 1}
                  className="p-3 neu-glass-button text-slate-900 dark:text-white hover:text-primary rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Sonraki Bölüm"
                >
                  <span className="material-symbols-outlined text-[32px]">skip_next</span>
                </button>
                <button
                  className="p-3 neu-glass-button text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white rounded-xl transition-all duration-300"
                  title="Tekrarla"
                >
                  <span className="material-symbols-outlined text-[24px]">repeat</span>
                </button>
              </div>
            </div>

            {/* Additional Controls */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 pt-2 relative z-30">
              <div className="hidden sm:flex items-center gap-3 neu-glass-card rounded-xl px-4 py-2 group cursor-pointer">
                <button className="text-slate-700 dark:text-text-secondary group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[22px]">volume_up</span>
                </button>
                <div className="w-24 h-2 neu-glass-input rounded-full overflow-hidden relative">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-colors duration-300 shadow-md"
                    style={{ width: `${volume}%` }}
                  ></div>
                </div>
              </div>
              <button
                onClick={() => {
                  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
                  const currentIndex = speeds.indexOf(playbackSpeed);
                  const nextIndex = (currentIndex + 1) % speeds.length;
                  setPlaybackSpeed(speeds[nextIndex]);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl neu-glass-button text-slate-900 dark:text-white text-xs font-bold transition-all duration-300 group"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-600 dark:text-text-secondary group-hover:text-primary transition-colors">speed</span>
                <span>{playbackSpeed}x</span>
              </button>
              <div className="relative group">
                <button
                  onClick={() => setShowSleepMenu(!showSleepMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl neu-glass-button text-slate-900 dark:text-white text-xs font-bold transition-all duration-300 focus:ring-2 focus:ring-primary/50"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-600 dark:text-text-secondary group-hover:text-primary transition-colors">bedtime</span>
                  <span className="hidden sm:inline">Uyku Modu</span>
                </button>
                {showSleepMenu && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 neu-glass-strong rounded-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                      <p className="text-[10px] uppercase tracking-wider text-slate-700 dark:text-text-secondary font-bold">Kapanma Zamanı</p>
                      <span className="size-1.5 rounded-full bg-primary/50 animate-pulse"></span>
                    </div>
                    <div className="p-1.5 space-y-1">
                      <button
                        onClick={() => {
                          setSleepTimer(null);
                          setShowSleepMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-sm rounded-xl font-bold flex items-center justify-between transition-all ${
                          sleepTimer === null
                            ? 'neu-glass-button bg-primary/20 text-primary'
                            : 'neu-glass-button text-slate-900 dark:text-white hover:bg-white/80 dark:hover:bg-white/5'
                        }`}
                      >
                        <span>Kapalı</span>
                        {sleepTimer === null && (
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        )}
                      </button>
                      {[15, 30, 45].map((minutes) => (
                        <button
                          key={minutes}
                          onClick={() => {
                            setSleepTimer(`${minutes} dakika`);
                            setShowSleepMenu(false);
                          }}
                          className="w-full text-left px-3 py-2.5 text-sm rounded-xl neu-glass-button text-slate-900 dark:text-white hover:bg-white/80 dark:hover:bg-white/5 transition-all flex items-center justify-between group/item"
                        >
                          <span>{minutes} Dakika</span>
                          <span className="material-symbols-outlined text-[18px] opacity-0 group-hover/item:opacity-30">timer</span>
                        </button>
                      ))}
                      <div className="h-px bg-slate-200 dark:bg-white/10 my-1 mx-2"></div>
                      <button
                        onClick={() => {
                          setSleepTimer('Bölüm Sonu');
                          setShowSleepMenu(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm rounded-xl neu-glass-button text-slate-900 dark:text-white hover:bg-white/80 dark:hover:bg-white/5 transition-all flex items-center justify-between group/item"
                      >
                        <span>Bölüm Sonu</span>
                        <span className="material-symbols-outlined text-[18px] opacity-0 group-hover/item:opacity-30">stop_circle</span>
                      </button>
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 neu-glass-strong rotate-45 border-b border-r border-slate-200 dark:border-white/10 rounded-sm"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar - Chapters */}
        <aside className="hidden lg:flex flex-col w-[380px] neu-glass z-20">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-white/10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bölümler</h3>
            <span className="text-xs font-bold text-slate-700 dark:text-text-secondary neu-glass-button px-2.5 py-1 rounded-md">
              {chapters.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chapters.map((chapter, index) => {
              const isActive = chapter.id === currentChapter?.id;
              return (
                <div
                  key={chapter.id}
                  onClick={() => handleChapterChange(chapter)}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all group relative overflow-hidden ${
                    isActive
                      ? 'neu-glass-button bg-primary/20 border-primary/30'
                      : 'neu-glass-card hover:neu-glass-elevated'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-r-full"></div>
                  )}
                  <div
                    className={`flex items-center justify-center size-9 rounded-lg shrink-0 transition-all ${
                      isActive
                        ? 'neu-glass-elevated bg-gradient-to-br from-primary to-purple-500 text-white'
                        : 'neu-glass-button text-slate-700 dark:text-text-secondary group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}
                  >
                    {isActive ? (
                      <span className="material-symbols-outlined text-[20px] animate-pulse">graphic_eq</span>
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate transition-colors ${
                        isActive
                          ? 'text-primary font-bold'
                          : 'text-slate-900 dark:text-white group-hover:text-primary'
                      }`}
                    >
                      {chapter.title}
                    </p>
                    <p className="text-xs text-slate-700 dark:text-text-secondary mt-0.5">
                      {isActive ? `${formatTime(currentTime)} • Dinleniyor` : formatDuration(chapter.duration)}
                    </p>
                  </div>
                  {!isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChapterChange(chapter);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-surface-hover text-slate-700 dark:text-text-secondary hover:text-primary transition-all"
                    >
                      <span className="material-symbols-outlined text-[24px]">play_circle</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="p-5 border-t border-slate-200 dark:border-white/10 neu-glass-card">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">info</span>
              Hakkında
            </h4>
            <p className="text-xs text-slate-700 dark:text-text-secondary leading-relaxed line-clamp-3">
              {book.description || 'Bu kitap hakkında detaylı bilgi bulunmuyor.'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

