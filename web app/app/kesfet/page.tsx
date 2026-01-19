'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Book } from '@/lib/types';
import { getBooks, searchBooks, getBooksByCategory, getCategories } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function KesfetPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'title'>('newest');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterAndSortBooks();
  }, [books, selectedCategory, searchQuery, sortBy]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [booksData, categoriesData] = await Promise.all([
        getBooks(),
        getCategories(),
      ]);
      setBooks(booksData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Veri yüklenemedi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortBooks = async () => {
    try {
      let filtered: Book[] = [];

      if (searchQuery.trim()) {
        const searchResults = await searchBooks(searchQuery);
        filtered = searchResults;
      } else if (selectedCategory) {
        const categoryResults = await getBooksByCategory(selectedCategory);
        filtered = categoryResults;
      } else {
        filtered = [...books];
      }

      // Sıralama
      const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        } else if (sortBy === 'popular') {
          return a.id.localeCompare(b.id);
        } else {
          return b.id.localeCompare(a.id);
        }
      });

      setFilteredBooks(sorted);
    } catch (err) {
      console.error('Filtreleme hatası:', err);
      setFilteredBooks([]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterAndSortBooks();
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex items-center justify-between rounded-2xl neu-glass px-4 py-3">
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
                  className="text-sm font-medium text-primary border-b-2 border-primary pb-1 transition-colors"
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
              <form onSubmit={handleSearch} className="hidden md:flex relative group w-full max-w-xs">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 dark:text-white/40">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-xl neu-glass-input py-2 pl-10 pr-3 placeholder:text-slate-500 dark:placeholder:text-white/40 focus:outline-none transition-all sm:text-sm sm:leading-6"
                  placeholder="Kitap ara..."
                  type="text"
                />
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full pt-28 min-h-screen bg-slate-50 dark:bg-background-dark">
        {/* Hero Section */}
        <section className="relative w-full px-4 sm:px-6 lg:px-8 mb-12">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-hero-glow pointer-events-none opacity-50"></div>
          <div className="mx-auto max-w-7xl relative z-10">
            <div className="text-center py-12">
              <div className="inline-block neu-glass-card px-6 py-3 rounded-2xl mb-6">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Keşfet</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-slate-900 dark:text-white mb-4">
                Yeni Hikayeler <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Keşfedin</span>
              </h1>
              <p className="text-lg text-slate-700 dark:text-secondary-text max-w-2xl mx-auto">
                Binlerce sesli kitap arasından size en uygun olanı bulun
              </p>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 w-full">
          <div className="neu-glass-card rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Kategori Filtreleri */}
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    selectedCategory === null
                      ? 'neu-glass-button bg-primary/20 text-primary border-primary/30'
                      : 'neu-glass-button text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Tümü
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      selectedCategory === category
                        ? 'neu-glass-button bg-primary/20 text-primary border-primary/30'
                        : 'neu-glass-button text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Sıralama */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-700 dark:text-secondary-text font-medium">Sırala:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'title')}
                  className="px-4 py-2.5 rounded-xl neu-glass-input text-sm focus:outline-none cursor-pointer"
                >
                  <option value="newest">Yeni Eklenenler</option>
                  <option value="popular">Popüler</option>
                  <option value="title">İsme Göre</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Books Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 w-full">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="neu-glass-card rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="w-full aspect-[2/3] bg-gray-700"></div>
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="neu-glass-card rounded-2xl p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-500 dark:text-secondary-text mb-4 block">
                search_off
              </span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Kitap bulunamadı</h3>
              <p className="text-slate-700 dark:text-secondary-text mb-6">
                {searchQuery ? 'Arama kriterlerinize uygun kitap bulunamadı.' : 'Henüz kitap eklenmemiş.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                  className="px-6 py-3 rounded-xl neu-glass-button bg-primary/20 text-primary font-semibold hover:bg-primary/30 transition-all"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="neu-glass-card rounded-xl px-4 py-3 mb-4 inline-block">
                <span className="text-slate-700 dark:text-secondary-text text-sm font-semibold">
                  {filteredBooks.length} kitap bulundu
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredBooks.map((book) => (
                  <Link
                    key={book.id}
                    href={`/kitap/${book.id}`}
                    className="group neu-glass-card rounded-2xl overflow-hidden hover:neu-glass-elevated transition-all duration-300"
                  >
                    <div className="relative w-full aspect-[2/3] bg-gray-300 dark:bg-gray-800 overflow-hidden">
                      {book.coverImage ? (
                        <Image
                          src={book.coverImage}
                          alt={book.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 16vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-white/50">
                            auto_stories
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <div className="w-12 h-12 rounded-full neu-glass-button bg-white/20 text-white flex items-center justify-center scale-90 group-hover:scale-100 transition-transform">
                          <span className="material-symbols-outlined text-2xl filled">play_arrow</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-slate-900 dark:text-white font-bold text-sm leading-tight line-clamp-2 mb-1">
                        {book.title}
                      </h3>
                      <p className="text-slate-700 dark:text-secondary-text text-xs truncate">{book.author}</p>
                      {book.category && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded-md neu-glass-button bg-primary/20 text-primary text-xs">
                          {book.category}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}
