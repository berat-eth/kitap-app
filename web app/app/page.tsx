'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Book } from '@/lib/types';
import { getBooks, searchBooks, getBooksByCategory, getCategories } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

declare global {
  interface Window {
    Parallax: any;
  }
}

export default function HomePage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Parallax efektini başlat
    const initParallax = () => {
      if (typeof window !== 'undefined' && window.Parallax) {
        const heroParallax = document.getElementById('hero-parallax');
        if (heroParallax) {
          try {
            new window.Parallax(heroParallax, {
              relativeInput: true,
              clipRelativeInput: false,
              hoverOnly: false,
              calibrateX: false,
              calibrateY: true,
              invertX: false,
              invertY: true,
              scalarX: 15,
              scalarY: 15,
              frictionX: 0.1,
              frictionY: 0.1,
            });
          } catch (error) {
            console.log('Parallax initialization error:', error);
          }
        }

        const heroContentParallax = document.getElementById('hero-content-parallax');
        if (heroContentParallax) {
          try {
            new window.Parallax(heroContentParallax, {
              relativeInput: true,
              clipRelativeInput: false,
              hoverOnly: false,
              calibrateX: false,
              calibrateY: true,
              invertX: false,
              invertY: true,
              scalarX: 10,
              scalarY: 10,
              frictionX: 0.1,
              frictionY: 0.1,
            });
          } catch (error) {
            console.log('Parallax content initialization error:', error);
          }
        }
      }
    };

    // Script yüklendikten sonra başlat
    if (typeof window !== 'undefined' && window.Parallax) {
      initParallax();
    } else {
      // Script henüz yüklenmemişse bekle
      const checkParallax = setInterval(() => {
        if (typeof window !== 'undefined' && window.Parallax) {
          initParallax();
          clearInterval(checkParallax);
        }
      }, 100);

      // 5 saniye sonra timeout
      setTimeout(() => clearInterval(checkParallax), 5000);
    }
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [booksData, categoriesData] = await Promise.all([
        getBooks(),
        getCategories(),
      ]);
      setBooks(booksData);
      setCategories(categoriesData);
      
      // İlk 3 kitabı featured olarak al
      setFeaturedBooks(booksData.slice(0, 3));
      // Popüler kitaplar için ilk 5'i al
      setPopularBooks(booksData.slice(0, 5));
    } catch (err) {
      console.error('Veri yüklenemedi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        const results = await searchBooks(searchQuery);
        // Arama sonuçlarını göster (basit bir yaklaşım)
        if (results.length > 0) {
          router.push(`/kitap/${results[0].id}`);
        }
      } catch (err) {
        console.error('Arama hatası:', err);
      }
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex items-center justify-between rounded-2xl glass-header px-4 py-3">
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
                  className="text-sm font-medium text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Kütüphane
                </Link>
                <a className="text-sm font-medium text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">
                  Topluluk
                </a>
              </div>
            </div>
            <div className="flex flex-1 justify-end gap-4 items-center">
              <ThemeToggle />
              <Link
                href="/bagis"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">favorite</span>
                <span>Bağış Yap</span>
              </Link>
              <form onSubmit={handleSearch} className="hidden md:flex relative group w-full max-w-xs">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 dark:text-white/40">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-md py-2 pl-10 pr-3 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40 focus:ring-2 focus:ring-primary/50 focus:bg-white dark:focus:bg-white/10 focus:border-primary/50 transition-all sm:text-sm sm:leading-6"
                  placeholder="Bir sonraki hikayeni bul..."
                  type="text"
                />
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full pt-28">
        {/* Hero Section */}
        <section className="relative w-full px-4 sm:px-6 lg:px-8 mb-20 overflow-hidden">
          {/* Hero Background Image with Parallax */}
          <div id="hero-parallax" className="absolute inset-0 w-full h-full pointer-events-none">
            <div data-depth="0.2" className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-hero-glow pointer-events-none"></div>
            <div data-depth="0.4" className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div data-depth="0.3" className="absolute top-40 left-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            {/* Hero Görsel - Arka Plan */}
            <div data-depth="0.1" className="absolute top-0 right-0 w-full lg:w-[60%] h-full opacity-20">
              <div className="relative w-full h-full">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000"
                  alt="Sesli Kitap"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/80 to-transparent"></div>
              </div>
            </div>
          </div>
          
          <div className="mx-auto max-w-7xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <div className="flex flex-col gap-8 text-center lg:text-left pt-10 relative z-20">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card w-fit mx-auto lg:mx-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-xs font-medium text-slate-700 dark:text-white/80">#1 Ses Platformu 2025</span>
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-white dark:to-white/50">
                    Yaşayan Hikayelere
                  </span>
                  <br className="hidden lg:block" />
                  <span className="text-slate-900 dark:text-white">Dalın.</span>
                </h1>
                <p className="text-lg text-slate-700 dark:text-secondary-text max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Mekansal ses ve ruh halinize özel yapay zeka destekli önerilerle sesli kitapları daha önce hiç olmadığı gibi deneyimleyin.
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <Link
                    href={books.length > 0 ? `/kitap/${books[0].id}` : '#'}
                    className="h-14 px-8 rounded-2xl bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] flex items-center justify-center"
                  >
                    Ücretsiz Dinlemeye Başla
                  </Link>
                  <button className="h-14 px-8 rounded-2xl glass-card text-slate-900 dark:text-white font-semibold text-lg hover:bg-white/80 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-white/10">
                    <span className="material-symbols-outlined text-[24px]">play_circle</span>
                    <span>Demoyu İncele</span>
                  </button>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-background-dark bg-gray-300"></div>
                    <div className="w-10 h-10 rounded-full border-2 border-background-dark bg-gray-400"></div>
                    <div className="w-10 h-10 rounded-full border-2 border-background-dark bg-gray-500"></div>
                    <div className="w-10 h-10 rounded-full border-2 border-background-dark bg-gray-800 flex items-center justify-center text-xs font-bold text-white">
                      +2M
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-secondary-text">Bugün aktif dinleyiciler</p>
                </div>
              </div>

              <div id="hero-content-parallax" className="relative lg:h-[600px] flex items-center justify-center">
                {/* Ana Hero Görsel */}
                <div data-depth="0.1" className="relative w-full max-w-lg aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 group animate-float">
                  {featuredBooks.length > 0 && featuredBooks[0].coverImage ? (
                    <Image
                      src={featuredBooks[0].coverImage}
                      alt={featuredBooks[0].title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary via-purple-600 to-indigo-800 relative">
                      <Image
                        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000"
                        alt="Kitap"
                        fill
                        className="object-cover opacity-50"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                    </div>
                  )}
                  
                  {/* Floating Badge - Üst */}
                  <div data-depth="0.3" className="absolute top-8 left-8 glass-card-strong px-4 py-2 rounded-xl z-10 shadow-xl">
                    <p className="text-slate-900 dark:text-white text-sm font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">headphones</span>
                      Şimdi Dinleniyor
                    </p>
                  </div>
                  
                  {/* Bottom Player Card */}
                  <div data-depth="0.2" className="absolute bottom-6 left-6 right-6 glass-card-strong p-4 rounded-2xl flex items-center gap-4 shadow-2xl">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700">
                      {featuredBooks.length > 0 && featuredBooks[0].coverImage ? (
                        <Image
                          src={featuredBooks[0].coverImage}
                          alt={featuredBooks[0].title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-slate-900 dark:text-white font-bold text-sm truncate">
                        {featuredBooks.length > 0 ? featuredBooks[0].title : 'Sessiz Yankı'}
                      </h4>
                      <p className="text-slate-700 dark:text-white/60 text-xs truncate">Bölüm 4 • 12:30 kaldı</p>
                      <div className="w-full bg-white/20 h-1 rounded-full mt-2 overflow-hidden">
                        <div className="bg-primary h-full w-[60%] rounded-full"></div>
                      </div>
                    </div>
                    <Link
                      href={featuredBooks.length > 0 ? `/kitap/${featuredBooks[0].id}` : '#'}
                      className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    >
                      <span className="material-symbols-outlined filled">play_arrow</span>
                    </Link>
                  </div>
                </div>
                
                {/* Floating Badge - Sağ */}
                <div data-depth="0.4" className="absolute top-1/4 -right-4 lg:right-8 glass-card-strong p-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-float-delayed max-w-[180px] z-10">
                  <span className="material-symbols-outlined text-yellow-500 text-2xl">auto_awesome</span>
                  <div>
                    <p className="text-xs text-slate-700 dark:text-white/60 font-medium">YZ Eşleşmesi</p>
                    <p className="text-sm text-slate-900 dark:text-white font-bold">%98 Eşleşme</p>
                  </div>
                </div>
                
                {/* Decorative Glow Elements */}
                <div data-depth="0.5" className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
                <div data-depth="0.6" className="absolute top-20 -right-10 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl animate-pulse delay-1000 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Sizin İçin Seçildi</h2>
              <p className="text-slate-700 dark:text-secondary-text">Bilim kurgu ilgi alanlarınıza dayalı kişiselleştirilmiş seçimler.</p>
            </div>
            <Link href="#" className="hidden sm:block text-primary hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-semibold">
              Tümünü Gör
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[500px]">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card-dark rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[500px]">
              {featuredBooks[0] && (
                <Link
                  href={`/kitap/${featuredBooks[0].id}`}
                  className="md:col-span-2 md:row-span-2 relative group rounded-3xl overflow-hidden cursor-pointer"
                >
                  {featuredBooks[0].coverImage ? (
                    <Image
                      src={featuredBooks[0].coverImage}
                      alt={featuredBooks[0].title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <div className="inline-block px-3 py-1 mb-4 rounded-lg bg-primary text-white text-xs font-bold tracking-wider">
                      EN İYİ SEÇİM
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{featuredBooks[0].title}</h3>
                    <p className="text-white/90 line-clamp-2 max-w-lg mb-6">{featuredBooks[0].description || featuredBooks[0].author}</p>
                    <div className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors w-fit">
                      <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                      <span>Şimdi Dinle</span>
                    </div>
                  </div>
                </Link>
              )}
              
              <div className="relative group rounded-3xl glass-feature overflow-hidden p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">trending_up</span>
                    </div>
                    <span className="text-xs font-bold text-secondary-text border border-white/10 px-2 py-1 rounded-md">
                      TREND
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Bu hafta viral olanlar</h3>
                  <p className="text-secondary-text text-sm mt-1">Herkesin konuştuğu kitaplar.</p>
                </div>
                <div className="flex -space-x-3 mt-4">
                  {popularBooks.slice(0, 3).map((book, i) => (
                    <div
                      key={book.id}
                      className="w-10 h-10 rounded-full border border-card-dark bg-gray-700"
                    ></div>
                  ))}
                </div>
              </div>

              <div className="relative group rounded-3xl glass-card-strong overflow-hidden p-6 flex flex-col justify-center items-start text-left hover:brightness-110 transition-all cursor-pointer bg-gradient-to-br from-indigo-900/40 to-purple-900/40">
                <span className="material-symbols-outlined text-white/50 text-4xl mb-auto">auto_stories</span>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">2024 Özetiniz</h3>
                  <p className="text-indigo-200 text-sm">Favorilerinizi yeniden keşfedin.</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Popular Books Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Bölgenizdeki Popülerler</h2>
            <div className="flex gap-2">
              <button
                onClick={scrollLeft}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={scrollRight}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="mask-fade-sides -mx-4 px-4">
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto hide-scrollbar gap-6 pb-8 snap-x"
            >
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex-none w-[220px] snap-start">
                    <div className="w-full aspect-[2/3] rounded-2xl bg-card-dark animate-pulse mb-4"></div>
                  </div>
                ))
              ) : (
                popularBooks.map((book) => (
                  <Link
                    key={book.id}
                    href={`/kitap/${book.id}`}
                    className="flex-none w-[220px] snap-start group cursor-pointer"
                  >
                    <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden mb-4 shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-primary/20 group-hover:shadow-2xl">
                      {book.coverImage ? (
                        <Image
                          src={book.coverImage}
                          alt={book.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600"></div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                          <span className="material-symbols-outlined text-3xl filled">play_arrow</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-bold text-lg leading-tight truncate">{book.title}</h3>
                    <p className="text-slate-700 dark:text-secondary-text text-sm truncate mt-1">Yazan: {book.author}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="rounded-[2.5rem] glass-card-strong p-8 md:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              <div className="flex flex-col gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">cloud_download</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Çevrimdışı Mod</h3>
                <p className="text-slate-700 dark:text-secondary-text leading-relaxed">
                  Verinizi koruyun. Tüm kütüphaneleri anında cihazınıza indirin.
                </p>
              </div>
              <div className="flex flex-col gap-4 p-4 rounded-2xl hover:bg-white/80 dark:hover:bg-white/5 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-black dark:border-white/10 border border-slate-300 dark:border-white/10 flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">mic_external_on</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Mekansal Ses</h3>
                <p className="text-slate-700 dark:text-secondary-text leading-relaxed">
                  Gelişmiş mekansal ses teknolojimizle hikayeyi etrafınızda hissedin.
                </p>
              </div>
              <div className="flex flex-col gap-4 p-4 rounded-2xl hover:bg-white/80 dark:hover:bg-white/5 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-black dark:border-white/10 border border-slate-300 dark:border-white/10 flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">favorite</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Bağış ile Destekle</h3>
                <p className="text-slate-700 dark:text-secondary-text leading-relaxed">
                  Projeyi destekleyerek daha fazla kitap ve daha iyi hizmet sunmamıza yardımcı olun.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Donation Section */}
        <section className="px-4 sm:px-6 lg:px-8 mb-20">
          <div className="max-w-7xl mx-auto rounded-[3rem] bg-gradient-to-br from-emerald-600 to-emerald-800 overflow-hidden relative text-center py-20 px-6">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/20 blur-[80px] rounded-full"></div>
            <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto gap-8">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-white text-5xl">favorite</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Projeyi Destekleyin
              </h2>
              <p className="text-emerald-100 text-lg md:text-xl leading-relaxed">
                AudioBook platformunu geliştirmeye devam edebilmemiz için bağışlarınız bizim için çok değerli. 
                Her bağış, daha fazla kitap ve daha iyi bir deneyim anlamına geliyor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Link
                  href="/bagis"
                  className="h-14 px-8 rounded-2xl bg-white text-emerald-600 font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                  <span>Bağış Yap</span>
                </Link>
                <Link
                  href="/kesfet"
                  className="h-14 px-8 rounded-2xl glass-card text-white font-bold text-lg hover:bg-white/30 dark:hover:bg-white/20 transition-all flex items-center justify-center hover:scale-105 hover:shadow-xl"
                >
                  <span>Kitapları Keşfet</span>
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-4 pt-6 border-t border-white/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">₺12,450</p>
                  <p className="text-emerald-200 text-xs mt-1">Bu Ay Toplanan</p>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">156</p>
                  <p className="text-emerald-200 text-xs mt-1">Bağışçı Sayısı</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-background-dark py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6">Şirket</h4>
            <ul className="flex flex-col gap-3 text-slate-700 dark:text-secondary-text text-sm">
              <li><a className="hover:text-primary transition-colors" href="#">Hakkında</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Kariyer</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Basın</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6">Keşfet</h4>
            <ul className="flex flex-col gap-3 text-slate-700 dark:text-secondary-text text-sm">
              <li><a className="hover:text-primary transition-colors" href="#">Yeni Çıkanlar</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Listeler</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Öneriler</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6">Destek</h4>
            <ul className="flex flex-col gap-3 text-slate-700 dark:text-secondary-text text-sm">
              <li>
                <button
                  onClick={() => alert('Bağış özelliği yakında aktif olacak!')}
                  className="hover:text-primary transition-colors text-left flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">favorite</span>
                  Bağış Yap
                </button>
              </li>
              <li><a className="hover:text-primary transition-colors" href="#">Yazarlar</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Dinleyiciler</a></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-slate-900 dark:text-white font-bold mb-6">Uygulamayı İndir</h4>
            <div className="flex gap-3">
              <button className="flex-1 glass-feature hover:bg-white/80 dark:hover:bg-white/10 p-3 rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-105">
                <span className="material-symbols-outlined">phone_iphone</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">iOS</span>
              </button>
              <button className="flex-1 glass-feature hover:bg-white/80 dark:hover:bg-white/10 p-3 rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-105">
                <span className="material-symbols-outlined">phone_android</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Android</span>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-700 dark:text-secondary-text text-sm">© 2025 AudioBook Inc. Gelecek için Tasarlandı.</p>
          <div className="flex gap-6">
            <a className="text-slate-700 dark:text-secondary-text hover:text-slate-900 dark:hover:text-white" href="#">
              <span className="material-symbols-outlined">public</span>
            </a>
            <a className="text-slate-700 dark:text-secondary-text hover:text-slate-900 dark:hover:text-white" href="#">
              <span className="material-symbols-outlined">alternate_email</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
