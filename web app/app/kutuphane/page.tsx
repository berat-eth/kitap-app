'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Book, Progress } from '@/lib/types';
import { getBookById, getBooks } from '@/lib/api';
import { getAllProgress, clearProgress } from '@/lib/storage';
import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

interface BookWithProgress extends Book {
  progress?: Progress;
}

export default function KutuphanePage() {
  const router = useRouter();
  const [books, setBooks] = useState<BookWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'reading' | 'completed'>('all');

  useEffect(() => {
    loadLibrary();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [filter, books]);

  const loadLibrary = async () => {
    try {
      setIsLoading(true);
      const allProgress = getAllProgress();
      const progressEntries = Object.values(allProgress);

      if (progressEntries.length === 0) {
        setBooks([]);
        setIsLoading(false);
        return;
      }

      // İlerleme kaydı olan kitapları yükle
      const booksWithProgress: BookWithProgress[] = [];
      for (const progress of progressEntries) {
        try {
          const book = await getBookById(progress.bookId);
          booksWithProgress.push({
            ...book,
            progress,
          });
        } catch (err) {
          console.error(`Kitap yüklenemedi: ${progress.bookId}`, err);
        }
      }

      // Son güncelleme zamanına göre sırala
      booksWithProgress.sort((a, b) => {
        const timeA = a.progress?.lastUpdated || 0;
        const timeB = b.progress?.lastUpdated || 0;
        return timeB - timeA;
      });

      setBooks(booksWithProgress);
    } catch (err) {
      console.error('Kütüphane yüklenemedi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBooks = () => {
    // Filter state'e göre kitapları filtrele
    // Şimdilik tüm kitapları göster, ileride tamamlanma durumuna göre filtreleme eklenebilir
  };

  const handleClearProgress = (bookId: string) => {
    if (confirm('Bu kitabın ilerlemesini silmek istediğinize emin misiniz?')) {
      clearProgress(bookId);
      loadLibrary();
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}s ${mins}dk`;
    }
    return `${mins}dk`;
  };

  const getProgressPercentage = (book: BookWithProgress): number => {
    if (!book.progress || !book.duration) return 0;
    // Basit bir hesaplama - gerçekte bölüm sürelerine göre hesaplanmalı
    return Math.min((book.progress.currentTime / (book.duration * 60)) * 100, 100);
  };

  const filteredBooks = books.filter((book) => {
    if (filter === 'all') return true;
    const progress = getProgressPercentage(book);
    if (filter === 'completed') return progress >= 90;
    if (filter === 'reading') return progress > 0 && progress < 90;
    return true;
  });

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-300 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-black/10 dark:shadow-black/20">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 cursor-pointer group">
                <div className="bg-primary/20 p-1.5 rounded-lg group-hover:bg-primary/30 transition-colors">
                  <span className="material-symbols-outlined text-2xl text-primary">graphic_eq</span>
                </div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">AudioBook</h2>
              </Link>
              <div className="hidden lg:flex items-center gap-6">
                <Link
                  href="/kesfet"
                  className="text-sm font-medium text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Keşfet
                </Link>
                <Link
                  href="/kutuphane"
                  className="text-sm font-medium text-primary border-b-2 border-primary pb-1 transition-colors"
                >
                  Kütüphane
                </Link>
                <a className="text-sm font-medium text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">
                  Topluluk
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full pt-28">
        {/* Hero Section */}
        <section className="relative w-full px-4 sm:px-6 lg:px-8 mb-12">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-hero-glow pointer-events-none opacity-50"></div>
          <div className="mx-auto max-w-7xl relative z-10">
            <div className="text-center py-12">
              <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-slate-900 dark:text-white mb-4">
                Kütüphanem
              </h1>
              <p className="text-lg text-slate-700 dark:text-secondary-text max-w-2xl mx-auto">
                Dinlediğiniz kitaplar ve ilerleme kayıtlarınız
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 w-full">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-white/80 dark:bg-white/5 text-slate-700 dark:text-white/70 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10'
              }`}
            >
              Tümü ({books.length})
            </button>
            <button
              onClick={() => setFilter('reading')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'reading'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-white/80 dark:bg-white/5 text-slate-700 dark:text-white/70 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10'
              }`}
            >
              Devam Edenler
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-white/80 dark:bg-white/5 text-slate-700 dark:text-white/70 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10'
              }`}
            >
              Tamamlananlar
            </button>
          </div>
        </section>

        {/* Library Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 w-full">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card-dark rounded-2xl p-6 animate-pulse"
                >
                  <div className="flex gap-6">
                    <div className="w-32 h-48 bg-gray-700 rounded-xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                      <div className="h-2 bg-gray-700 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-slate-500 dark:text-secondary-text mb-4 block">
                {filter === 'all' ? 'library_books' : filter === 'reading' ? 'play_circle' : 'check_circle'}
              </span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {filter === 'all'
                  ? 'Kütüphaneniz boş'
                  : filter === 'reading'
                  ? 'Devam eden kitap yok'
                  : 'Tamamlanan kitap yok'}
              </h3>
              <p className="text-slate-700 dark:text-secondary-text mb-6">
                {filter === 'all'
                  ? 'Henüz hiç kitap dinlemediniz. Keşfet sayfasından kitaplara göz atabilirsiniz.'
                  : 'Bu kategoride kitap bulunmuyor.'}
              </p>
              {filter === 'all' && (
                <Link
                  href="/kesfet"
                  className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-blue-500 transition-colors"
                >
                  Keşfet Sayfasına Git
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBooks.map((book) => {
                const progressPercent = getProgressPercentage(book);
                const lastUpdated = book.progress
                  ? new Date(book.progress.lastUpdated)
                  : null;

                return (
                  <div
                    key={book.id}
                    className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-colors group"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Kitap Kapağı */}
                      <Link
                        href={`/kitap/${book.id}`}
                        className="relative w-full md:w-32 h-48 md:h-48 rounded-xl overflow-hidden flex-shrink-0 group/image"
                      >
                        {book.coverImage ? (
                          <Image
                            src={book.coverImage}
                            alt={book.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover/image:scale-110"
                            sizes="(max-width: 768px) 100vw, 128px"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-white/50">
                              auto_stories
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center scale-90 group-hover/image:scale-100 transition-transform shadow-xl">
                            <span className="material-symbols-outlined text-2xl filled">play_arrow</span>
                          </div>
                        </div>
                      </Link>

                      {/* Kitap Bilgileri */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <Link href={`/kitap/${book.id}`}>
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 hover:text-primary transition-colors line-clamp-2">
                                {book.title}
                              </h3>
                            </Link>
                            <p className="text-slate-700 dark:text-secondary-text text-sm mb-2">{book.author}</p>
                            {book.category && (
                              <span className="inline-block px-2 py-1 rounded-md bg-primary/20 text-primary text-xs">
                                {book.category}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleClearProgress(book.id)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-secondary-text hover:text-slate-900 dark:hover:text-white"
                            title="İlerlemeyi sil"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>

                        {/* İlerleme Çubuğu */}
                        {book.progress && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-700 dark:text-secondary-text">
                                İlerleme: {progressPercent.toFixed(0)}%
                              </span>
                              {lastUpdated && (
                                <span className="text-slate-600 dark:text-secondary-text text-xs">
                                  Son dinleme: {lastUpdated.toLocaleDateString('tr-TR')}
                                </span>
                              )}
                            </div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-700 dark:text-secondary-text">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                {formatTime(book.progress.currentTime)}
                              </span>
                              {book.duration && (
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">timer</span>
                                  {Math.floor(book.duration / 60)} saat
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Devam Et Butonu */}
                        <div className="mt-4">
                          <Link
                            href={`/kitap/${book.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary font-semibold text-sm transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">play_arrow</span>
                            {progressPercent > 0 ? 'Devam Et' : 'Dinlemeye Başla'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

