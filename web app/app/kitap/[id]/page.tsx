'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Book, Chapter } from '@/lib/types';
import { getBookById, getChapters, getBooks } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllChapters, setShowAllChapters] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (bookId) {
      loadBookData();
    }
  }, [bookId]);

  const loadBookData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [bookData, chaptersData, allBooks] = await Promise.all([
        getBookById(bookId),
        getChapters(bookId),
        getBooks(),
      ]);

      setBook(bookData);
      setChapters(chaptersData);

      // Benzer kitaplar (aynı kategoriden, mevcut kitap hariç)
      const similar = allBooks
        .filter((b) => b.id !== bookId && b.category === bookData.category)
        .slice(0, 4);
      setSimilarBooks(similar);
    } catch (err) {
      console.error('Kitap yüklenemedi:', err);
      setError('Kitap yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}s ${mins}dk`;
    }
    return `${mins}dk`;
  };

  const totalDuration = chapters.reduce((sum, ch) => sum + (ch.duration || 0), 0);

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

  const displayedChapters = showAllChapters ? chapters : chapters.slice(0, 3);
  const descriptionParts = book.description?.split('\n') || [];
  const shortDescription = descriptionParts.slice(0, 2).join('\n');
  const fullDescription = book.description || '';

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 font-display flex flex-col min-h-screen text-slate-900 dark:text-white antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap clay border-b border-white/20 px-4 md:px-10 py-3 transition-all duration-300">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-4 text-slate-900 dark:text-white group cursor-pointer">
            <div className="size-10 text-primary group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-[40px]">graphic_eq</span>
            </div>
            <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] hidden sm:block bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-white/70 bg-clip-text text-transparent">
              AudioBook
            </h2>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/kutuphane"
              className="text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white text-sm font-medium leading-normal transition-colors relative group py-2"
            >
              Kitaplar
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/kesfet"
              className="text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white text-sm font-medium leading-normal transition-colors relative group py-2"
            >
              Keşfet
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <a
              href="#"
              className="text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white text-sm font-medium leading-normal transition-colors relative group py-2"
            >
              Kategoriler
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#"
              className="text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white text-sm font-medium leading-normal transition-colors relative group py-2"
            >
              Yeni Çıkanlar
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>
        </div>
        <div className="flex flex-1 justify-end gap-4 md:gap-8">
          <label className="hidden md:flex flex-col min-w-40 h-10 max-w-64 relative group">
            <div className="flex w-full flex-1 items-stretch rounded-full h-full clay-input focus-within:border-blue-400/50 focus-within:ring-2 focus-within:ring-blue-400/20 transition-all duration-300">
              <div className="text-slate-500 dark:text-text-secondary flex border-none items-center justify-center pl-4 rounded-l-full">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-full focus:outline-0 focus:ring-0 border-none bg-transparent focus:border-none h-full placeholder:text-slate-500 dark:placeholder:text-text-secondary/50 px-4 pl-2 text-sm font-normal leading-normal"
                placeholder="Kitap veya yazar ara..."
                type="text"
              />
            </div>
          </label>
          <div className="flex gap-2 items-center">
            <ThemeToggle />
            <button className="size-10 rounded-full clay-button flex items-center justify-center text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-8 flex flex-col gap-10">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap gap-2 text-sm animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
          <Link href="/" className="text-slate-600 dark:text-text-secondary hover:text-slate-800 dark:hover:text-white transition-colors font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">home</span>
            Anasayfa
          </Link>
          <span className="text-slate-400 dark:text-text-secondary/40 font-medium">/</span>
          <Link href={`/kesfet?category=${book.category}`} className="text-slate-600 dark:text-text-secondary hover:text-slate-800 dark:hover:text-white transition-colors font-medium">
            {book.category}
          </Link>
          <span className="text-slate-400 dark:text-text-secondary/40 font-medium">/</span>
          <span className="text-slate-800 dark:text-white font-medium truncate max-w-[200px] md:max-w-none text-blue-600 dark:text-blue-400">
            {book.title}
          </span>
        </nav>

        {/* Main Content */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 lg:gap-20">
          {/* Book Cover */}
          <div className="md:col-span-4 lg:col-span-4 flex flex-col gap-6 animate-slide-up opacity-0 relative z-10" style={{ animationDelay: '0.2s' }}>
            <div className="relative group aspect-[2/3] w-full rounded-3xl clay-elevated bg-gradient-to-br from-blue-100/20 to-purple-100/20 dark:from-blue-900/20 dark:to-purple-900/20 transform hover:-translate-y-2 transition-all duration-500">
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-white/50">auto_stories</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-50"></div>
                <Link
                  href={`/kitap/${book.id}/dinle`}
                  className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer backdrop-blur-sm"
                >
                  <div className="size-20 rounded-full clay-strong flex items-center justify-center text-slate-900 dark:text-white hover:scale-110 transition-all">
                    <span className="material-symbols-outlined text-[48px] ml-1">play_arrow</span>
                  </div>
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:hidden">
              <Link
                href={`/kitap/${book.id}/dinle`}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all clay-elevated"
              >
                <span className="material-symbols-outlined fill-current">play_arrow</span>
                <span>Dinlemeye Başla</span>
              </Link>
              <button className="w-full h-12 flex items-center justify-center gap-2 text-white clay-button rounded-2xl transition-colors">
                <span className="material-symbols-outlined">headphones</span>
                <span className="font-bold">Örnek Dinle</span>
              </button>
            </div>
          </div>

          {/* Book Info */}
          <div className="md:col-span-8 lg:col-span-8 flex flex-col gap-8 animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3 mb-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold clay-button text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined text-[16px]">auto_stories</span>
                  Sesli Kitap
                </span>
                {book.category && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold clay-button text-emerald-600 dark:text-emerald-400">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    {book.category}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-[1.1]">
                {book.title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 text-slate-600 dark:text-text-secondary text-base lg:text-lg mt-2">
                <div className="flex items-center gap-2 group">
                  <div className="p-1.5 rounded-xl clay-button group-hover:border-blue-400/50 transition-colors">
                    <span className="material-symbols-outlined text-[20px] text-blue-600 dark:text-blue-400">edit</span>
                  </div>
                  <span>
                    Yazar:{' '}
                    <span className="text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold">
                      {book.author}
                    </span>
                  </span>
                </div>
                <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-border-dark"></span>
                <div className="flex items-center gap-2 group">
                  <div className="p-1.5 rounded-xl clay-button group-hover:border-emerald-400/50 transition-colors">
                    <span className="material-symbols-outlined text-[20px] text-emerald-600 dark:text-emerald-400">mic</span>
                  </div>
                  <span>
                    Anlatıcı:{' '}
                    <span className="text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold">
                      {book.author}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 lg:gap-6 py-6">
              <div className="flex flex-col gap-1 p-5 rounded-2xl clay-card">
                <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 mb-1">
                  <span className="material-symbols-outlined text-[24px] fill-current animate-pulse-slow">star</span>
                  <span className="text-slate-800 dark:text-white font-bold text-2xl">4.9</span>
                </div>
                <span className="text-slate-600 dark:text-text-secondary text-sm font-medium">12.4k Değerlendirme</span>
              </div>
              <div className="flex flex-col gap-1 p-5 rounded-2xl clay-card">
                <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 mb-1">
                  <span className="material-symbols-outlined text-[24px]">schedule</span>
                  <span className="text-slate-800 dark:text-white font-bold text-2xl">{formatDuration(totalDuration)}</span>
                </div>
                <span className="text-slate-600 dark:text-text-secondary text-sm font-medium">Dinleme Süresi</span>
              </div>
              <div className="flex flex-col gap-1 p-5 rounded-2xl clay-card">
                <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400 mb-1">
                  <span className="material-symbols-outlined text-[24px]">calendar_today</span>
                  <span className="text-slate-800 dark:text-white font-bold text-2xl">2023</span>
                </div>
                <span className="text-slate-600 dark:text-text-secondary text-sm font-medium">Yayın Yılı</span>
              </div>
            </div>

            {/* Categories */}
            {book.category && (
              <div className="flex gap-3 flex-wrap">
                <Link
                  href={`/kesfet?category=${book.category}`}
                  className="px-5 py-2.5 rounded-2xl clay-button group"
                >
                  <span className="text-slate-700 dark:text-text-secondary group-hover:text-slate-900 dark:group-hover:text-white text-sm font-medium transition-colors">
                    {book.category}
                  </span>
                </Link>
              </div>
            )}

            {/* Action Buttons */}
            <div className="hidden md:flex flex-row gap-4 mt-4">
              <Link
                href={`/kitap/${book.id}/dinle`}
                className="flex-1 min-w-[220px] h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3 transition-all clay-elevated hover:-translate-y-1 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="material-symbols-outlined fill-current text-3xl relative z-10">play_arrow</span>
                <span className="relative z-10">Dinlemeye Başla</span>
              </Link>
              <button className="flex-1 min-w-[180px] h-14 clay-button text-slate-700 dark:text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1 group">
                <span className="material-symbols-outlined text-2xl group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">headphones</span>
                <span>Örnek Dinle</span>
              </button>
              <button className="h-14 w-14 clay-button text-slate-700 dark:text-white rounded-2xl flex items-center justify-center transition-all hover:text-blue-500 dark:hover:text-blue-400" title="Favorilere Ekle">
                <span className="material-symbols-outlined">bookmark_add</span>
              </button>
              <button className="h-14 w-14 clay-button text-slate-700 dark:text-white rounded-2xl flex items-center justify-center transition-all hover:text-blue-500 dark:hover:text-blue-400" title="Paylaş">
                <span className="material-symbols-outlined">share</span>
              </button>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8">
          <div className="lg:col-span-8 space-y-12">
            {/* Description */}
            <section className="animate-slide-up opacity-0" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-slate-800 dark:text-white text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                Kitap Açıklaması
              </h3>
              <div className="p-6 rounded-2xl clay-card">
                <div className="prose prose-invert max-w-none text-slate-600 dark:text-text-secondary leading-relaxed text-lg font-light">
                {showFullDescription ? (
                  <div>
                    {descriptionParts.map((para, i) => (
                      <p key={i} className="mb-4">
                        {para}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div>
                    {descriptionParts.slice(0, 2).map((para, i) => (
                      <p key={i} className="mb-4">
                        {para}
                      </p>
                    ))}
                  </div>
                )}
                </div>
              </div>
              {descriptionParts.length > 2 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 mt-4 group"
                >
                  {showFullDescription ? 'Daha Az Göster' : 'Devamını Oku'}
                  <span
                    className={`material-symbols-outlined text-[20px] transition-transform ${
                      showFullDescription ? 'rotate-180' : 'group-hover:translate-y-1'
                    }`}
                  >
                    expand_more
                  </span>
                </button>
              )}
            </section>

            {/* Chapters */}
            <section className="animate-slide-up opacity-0" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-800 dark:text-white text-2xl font-bold flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></span>
                  Bölümler ({chapters.length})
                </h3>
                <span className="text-sm font-medium px-4 py-2 rounded-full clay-button text-slate-700 dark:text-text-secondary">
                  Toplam: {formatDuration(totalDuration)}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {displayedChapters.map((chapter, index) => {
                  const isFirst = index === 0;
                  return (
                    <div
                      key={chapter.id}
                      className="group flex items-center justify-between p-5 rounded-2xl clay-card cursor-pointer transition-all hover:translate-x-2"
                    >
                      <Link
                        href={`/kitap/${book.id}/dinle?chapter=${chapter.id}`}
                        className="flex items-center gap-5 flex-1"
                      >
                        {isFirst ? (
                          <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center transition-all shadow-lg group-hover:scale-110">
                            <span className="material-symbols-outlined text-[24px] ml-0.5">play_arrow</span>
                          </div>
                        ) : (
                          <span className="size-12 rounded-full clay-button flex items-center justify-center text-slate-700 dark:text-text-secondary font-bold text-lg">
                            {index + 1}
                          </span>
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-800 dark:text-white font-semibold text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {chapter.title}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600 dark:text-text-secondary text-xs">{formatDuration(chapter.duration)}</span>
                            {isFirst && (
                              <>
                                <span className="size-1 rounded-full bg-emerald-500"></span>
                                <span className="text-emerald-500 text-xs font-medium">Dinlendi</span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center gap-4">
                        <button className="size-10 rounded-full clay-button flex items-center justify-center text-slate-600 dark:text-text-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <span className="material-symbols-outlined text-[20px]">download</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
                {chapters.length > 3 && (
                  <button
                    onClick={() => setShowAllChapters(!showAllChapters)}
                    className="w-full py-4 mt-2 text-sm font-bold text-slate-600 dark:text-text-secondary hover:text-slate-800 dark:hover:text-white clay-button rounded-2xl transition-all"
                  >
                    {showAllChapters ? 'Daha Az Göster' : 'Tüm Bölümleri Göster'}
                  </button>
                )}
              </div>
            </section>

            {/* Reviews */}
            <section className="animate-slide-up opacity-0" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-slate-800 dark:text-white text-2xl font-bold flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></span>
                  Değerlendirmeler
                </h3>
                <div className="flex gap-2">
                  <button className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-2xl transition-all clay-elevated">
                    Yorum Yaz
                  </button>
                </div>
              </div>
              <div className="space-y-6">
                {/* Mock Review 1 */}
                <div className="flex gap-5 p-6 rounded-2xl clay-card transition-colors">
                  <div className="shrink-0">
                    <div className="size-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center font-bold text-lg clay-elevated">
                      EK
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-slate-800 dark:text-white font-bold text-base">Elif Kara</p>
                          <span className="text-xs px-3 py-1 rounded-full clay-button text-emerald-600 dark:text-emerald-400">
                            Onaylı Dinleyici
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-text-secondary text-xs mt-1">2 gün önce</p>
                      </div>
                      <div className="flex text-amber-500 dark:text-amber-400 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-[18px] fill-current">
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-gray-300 text-base leading-relaxed font-light">
                      {book.author}'ın anlatımı muhteşemdi. Karakterlere verdiği sesler ve vurgular kitabı adeta yaşatıyor.{' '}
                      <span className="text-slate-800 dark:text-white font-medium">Çocukluğuma döndüm resmen</span>, herkese tavsiye ederim.
                    </p>
                    <div className="flex items-center gap-6 mt-2 pt-4 border-t border-white/10">
                      <button className="flex items-center gap-2 text-slate-600 dark:text-text-secondary hover:text-emerald-500 dark:hover:text-emerald-400 text-sm font-medium transition-colors group">
                        <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
                          thumb_up
                        </span>
                        Faydalı (124)
                      </button>
                      <button className="flex items-center gap-2 text-slate-600 dark:text-text-secondary hover:text-slate-800 dark:hover:text-white text-sm font-medium transition-colors group">
                        <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">
                          reply
                        </span>
                        Yanıtla
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mock Review 2 */}
                <div className="flex gap-5 p-6 rounded-2xl clay-card transition-colors">
                  <div className="shrink-0">
                    <div className="size-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg clay-elevated">
                      MY
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-800 dark:text-white font-bold text-base">Mehmet Yılmaz</p>
                        <p className="text-slate-600 dark:text-text-secondary text-xs mt-1">1 hafta önce</p>
                      </div>
                      <div className="flex text-amber-500 dark:text-amber-400 gap-0.5">
                        {[...Array(4)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-[18px] fill-current">
                            star
                          </span>
                        ))}
                        <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-border-dark">star</span>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-gray-300 text-base leading-relaxed font-light">
                      Hikaye zaten klasik, söze gerek yok. Seslendirme kalitesi çok iyi ancak arka plan müzikleri bazı yerlerde biraz fazla baskın olmuş gibi geldi. Yine de keyifli bir deneyimdi.
                    </p>
                    <div className="flex items-center gap-6 mt-2 pt-4 border-t border-white/10">
                      <button className="flex items-center gap-2 text-slate-600 dark:text-text-secondary hover:text-emerald-500 dark:hover:text-emerald-400 text-sm font-medium transition-colors group">
                        <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
                          thumb_up
                        </span>
                        Faydalı (42)
                      </button>
                      <button className="flex items-center gap-2 text-slate-600 dark:text-text-secondary hover:text-slate-800 dark:hover:text-white text-sm font-medium transition-colors group">
                        <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">
                          reply
                        </span>
                        Yanıtla
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8 animate-slide-up opacity-0" style={{ animationDelay: '0.7s' }}>
            {/* Rating Summary */}
            <div className="p-8 rounded-3xl clay-strong relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <span className="material-symbols-outlined text-[120px] text-amber-400">star</span>
              </div>
              <h4 className="text-slate-800 dark:text-white font-bold text-lg mb-6 relative z-10">Puan Özeti</h4>
              <div className="flex items-end gap-3 mb-6 relative z-10">
                <span className="text-6xl font-extrabold text-slate-800 dark:text-white tracking-tight">4.9</span>
                <div className="flex flex-col mb-1.5">
                  <div className="flex text-amber-500 dark:text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[20px] fill-current">
                        star
                      </span>
                    ))}
                  </div>
                  <span className="text-slate-600 dark:text-text-secondary text-xs font-medium mt-1">12.428 Değerlendirme</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 relative z-10">
                {[88, 8, 2, 1, 1].map((percentage, index) => (
                  <div key={index} className="flex items-center gap-3 text-xs group">
                    <span className="text-slate-800 dark:text-white w-3 font-bold">{5 - index}</span>
                    <div className="flex-1 h-2.5 rounded-full clay-pressed overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full group-hover:from-amber-300 group-hover:to-orange-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Books */}
            {similarBooks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-slate-800 dark:text-white font-bold text-lg">Benzer Kitaplar</h4>
                  <Link href="/kesfet" className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:text-blue-700 dark:hover:text-blue-300 hover:underline">
                    Tümü
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  {similarBooks.map((similarBook) => (
                    <Link
                      key={similarBook.id}
                      href={`/kitap/${similarBook.id}`}
                      className="flex flex-col gap-3 group cursor-pointer"
                    >
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden clay-card">
                        {similarBook.coverImage ? (
                          <Image
                            src={similarBook.coverImage}
                            alt={similarBook.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 1024px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                      </div>
                      <div>
                        <h5 className="text-slate-800 dark:text-white text-sm font-bold truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                          {similarBook.title}
                        </h5>
                        <p className="text-slate-600 dark:text-text-secondary text-xs truncate mt-1">{similarBook.author}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <div className="h-20"></div>
    </div>
  );
}
