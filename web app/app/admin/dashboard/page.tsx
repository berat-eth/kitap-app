'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Book } from '@/lib/types';
import { getBooks } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeUsers: 8502,
    totalBooks: 1240,
    listeningHours: 45000,
    monthlyRevenue: 120000,
  });

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setIsAuthenticated(true);
  };

  const loadData = async () => {
    try {
      const booksData = await getBooks();
      setBooks(booksData);
      setStats({
        activeUsers: 8502,
        totalBooks: booksData.length,
        listeningHours: 45000,
        monthlyRevenue: 120000,
      });
    } catch (err) {
      console.error('Veri yüklenemedi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days === 0) {
      if (hours === 0) return 'Az önce';
      return `${hours} saat önce`;
    } else if (days === 1) {
      return 'Dün, ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
    return `${days} gün önce`;
  };

  if (!isAuthenticated) {
    return null;
  }

  const recentBooks = books.slice(0, 4);

  return (
    <div className="flex h-screen w-full bg-surface-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] flex-shrink-0 flex flex-col border-r border-border-light dark:border-border-dark bg-white dark:bg-surface-dark/50 glass-panel hidden lg:flex z-20">
        <div className="flex h-20 items-center gap-3 px-8">
          <div className="relative flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-2xl">graphic_eq</span>
          </div>
          <h1 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">AudioAdmin</h1>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto px-6 py-6 gap-8 hide-scrollbar">
          <div className="flex flex-col gap-1.5">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ana Menü</p>
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/10 text-primary dark:text-white dark:bg-primary/20 transition-all font-medium"
            >
              <span className="material-symbols-outlined fill-current text-[22px]">dashboard</span>
              <span className="text-sm">Genel Bakış</span>
            </Link>
            <Link
              href="/admin/kitap"
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group font-medium"
            >
              <span className="material-symbols-outlined group-hover:text-primary transition-colors text-[22px]">library_books</span>
              <span className="text-sm">Kitaplar</span>
            </Link>
            <Link
              href="/admin/kullanicilar"
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group font-medium"
            >
              <span className="material-symbols-outlined group-hover:text-primary transition-colors text-[22px]">people</span>
              <span className="text-sm">Kullanıcılar</span>
            </Link>
            <Link
              href="/admin/analizler"
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group font-medium"
            >
              <span className="material-symbols-outlined group-hover:text-primary transition-colors text-[22px]">bar_chart</span>
              <span className="text-sm">Analizler</span>
            </Link>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Sistem</p>
            <Link
              href="/admin/ayarlar"
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group font-medium"
            >
              <span className="material-symbols-outlined group-hover:text-primary transition-colors text-[22px]">settings</span>
              <span className="text-sm">Ayarlar</span>
            </Link>
            <Link
              href="/admin/bildirimler"
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group font-medium"
            >
              <span className="material-symbols-outlined group-hover:text-primary transition-colors text-[22px]">notifications</span>
              <span className="text-sm">Bildirimler</span>
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">2</span>
            </Link>
          </div>
          <div className="mt-auto">
            <div className="relative bg-gradient-to-br from-surface-dark to-slate-900 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4 overflow-hidden shadow-lg border border-slate-700/50">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <span className="material-symbols-outlined text-white text-[80px]">graphic_eq</span>
              </div>
              <div className="relative z-10 flex items-center gap-3 mb-3">
                <div className="size-10 rounded-full bg-cover bg-center ring-2 ring-primary/50 bg-gradient-to-br from-primary to-purple-600"></div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold text-white truncate">Ahmet Yılmaz</span>
                  <span className="text-xs text-slate-400 truncate">Süper Admin</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="relative z-10 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors border border-white/5 backdrop-blur-sm"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-surface-light dark:bg-background-dark relative">
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark transition-all duration-300">
          <div className="flex items-center gap-4 lg:hidden">
            <button className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-slate-900 dark:text-white font-bold text-lg">AudioAdmin</span>
          </div>
          <div className="hidden md:flex items-center max-w-md w-full ml-auto lg:ml-0 lg:mr-auto">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2.5 border border-border-light dark:border-slate-700/50 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all shadow-sm"
                placeholder="Kitap, yazar veya kullanıcı ara..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-4 ml-4">
            <button className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80">
              <span className="material-symbols-outlined text-2xl">settings</span>
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <Link
              href="/admin/kitap/yeni"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 dark:shadow-white/5 hover:scale-105 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">add_circle</span>
              <span className="hidden sm:inline">Yeni Kitap</span>
            </Link>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-10 hide-scrollbar scroll-smooth">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Kontrol Paneli</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Hoşgeldin Ahmet, işte bugünün özet raporu.</p>
              </div>
              <div className="flex items-center bg-white dark:bg-surface-dark rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700/50">
                <button className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm">30 Gün</button>
                <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">90 Gün</button>
                <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Yıl</button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">group</span>
                    </div>
                    <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                      <span className="material-symbols-outlined mr-1 text-sm">trending_up</span>
                      5%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Aktif Kullanıcılar</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activeUsers.toLocaleString()}</h3>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                      <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">library_music</span>
                    </div>
                    <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                      <span className="material-symbols-outlined mr-1 text-sm">add</span>
                      +12
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Toplam Kitap</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalBooks.toLocaleString()}</h3>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                      <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-2xl">headphones</span>
                    </div>
                    <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                      <span className="material-symbols-outlined mr-1 text-sm">trending_up</span>
                      8%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Dinleme Süresi</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.listeningHours.toLocaleString()}k Saat</h3>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                      <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl">payments</span>
                    </div>
                    <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                      <span className="material-symbols-outlined mr-1 text-sm">trending_up</span>
                      15%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Aylık Gelir</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">₺{stats.monthlyRevenue.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Listening Trend Chart */}
              <div className="lg:col-span-2 p-8 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card flex flex-col">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Dinleme Trendi</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Haftalık katılım metriği</p>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 px-2">
                      <span className="size-2.5 rounded-full bg-primary shadow shadow-primary/50"></span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Bu Yıl</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 border-l border-slate-200 dark:border-slate-600">
                      <span className="size-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Geçen Yıl</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 w-full relative min-h-[320px]">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 300">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25"></stop>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <line className="dark:stroke-slate-700" stroke="#e2e8f0" strokeDasharray="0" strokeOpacity="0.5" strokeWidth="1" x1="0" x2="800" y1="225" y2="225"></line>
                    <line className="dark:stroke-slate-700" stroke="#e2e8f0" strokeDasharray="0" strokeOpacity="0.5" strokeWidth="1" x1="0" x2="800" y1="150" y2="150"></line>
                    <line className="dark:stroke-slate-700" stroke="#e2e8f0" strokeDasharray="0" strokeOpacity="0.5" strokeWidth="1" x1="0" x2="800" y1="75" y2="75"></line>
                    <path className="drop-shadow-lg" d="M0,250 C80,240 120,160 200,180 C280,200 320,100 400,120 C480,140 520,60 600,80 C680,100 720,40 800,50" fill="none" stroke="#3b82f6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"></path>
                    <path d="M0,250 C80,240 120,160 200,180 C280,200 320,100 400,120 C480,140 520,60 600,80 C680,100 720,40 800,50 V300 H0 Z" fill="url(#chartGradient)"></path>
                    <path className="opacity-60" d="M0,280 C60,270 140,240 220,250 C300,260 380,210 460,220 C540,230 620,190 700,180 C740,175 780,160 800,150" fill="none" stroke="#94a3b8" strokeDasharray="8 8" strokeLinecap="round" strokeWidth="2"></path>
                    <circle className="drop-shadow-md" cx="600" cy="80" fill="#ffffff" r="6" stroke="#3b82f6" strokeWidth="3"></circle>
                    <g transform="translate(540, 20)">
                      <rect className="shadow-xl" fill="#1e293b" height="40" rx="8" width="120"></rect>
                      <text fill="white" fontFamily="sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle" x="60" y="25">25 Kas: 8.2k Saat</text>
                    </g>
                  </svg>
                  <div className="flex justify-between mt-6 text-xs text-slate-400 font-semibold px-2 uppercase tracking-wide">
                    <span>Pzt</span>
                    <span>Sal</span>
                    <span>Çar</span>
                    <span>Per</span>
                    <span>Cum</span>
                    <span>Cmt</span>
                    <span>Paz</span>
                  </div>
                </div>
              </div>

              {/* Popular Categories */}
              <div className="lg:col-span-1 p-8 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Popüler Kategoriler</h3>
                <div className="flex items-center justify-center py-2 relative">
                  <svg className="transform -rotate-90" height="220" viewBox="0 0 200 200" width="220">
                    <circle className="dark:stroke-slate-800" cx="100" cy="100" fill="transparent" r="85" stroke="#f1f5f9" strokeWidth="12"></circle>
                    <circle cx="100" cy="100" fill="transparent" r="85" stroke="#3b82f6" strokeDasharray="210 534" strokeDashoffset="0" strokeLinecap="round" strokeWidth="12"></circle>
                    <circle cx="100" cy="100" fill="transparent" r="85" stroke="#8b5cf6" strokeDasharray="130 534" strokeDashoffset="-225" strokeLinecap="round" strokeWidth="12"></circle>
                    <circle cx="100" cy="100" fill="transparent" r="85" stroke="#10b981" strokeDasharray="80 534" strokeDashoffset="-370" strokeLinecap="round" strokeWidth="12"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">124</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">Kategori</span>
                  </div>
                </div>
                <div className="space-y-5 mt-8">
                  <div className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="size-3 rounded-full bg-primary ring-4 ring-primary/20 group-hover:ring-primary/30 transition-all"></div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Gizem & Polisiye</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">40%</span>
                  </div>
                  <div className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="size-3 rounded-full bg-purple-500 ring-4 ring-purple-500/20 group-hover:ring-purple-500/30 transition-all"></div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Bilim Kurgu</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">25%</span>
                  </div>
                  <div className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="size-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 group-hover:ring-emerald-500/30 transition-all"></div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Biyografi</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">15%</span>
                  </div>
                </div>
                <button className="w-full mt-auto py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Detaylı Raporu Gör
                </button>
              </div>
            </div>

            {/* Recent Books Table */}
            <div className="w-full pb-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Son Eklenen Kitaplar</h3>
                  <p className="text-sm text-slate-500 mt-1">Yönetim onayı bekleyen ve yeni yayınlananlar</p>
                </div>
                <Link
                  href="/admin/kitap"
                  className="text-sm font-bold text-primary hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  Tümünü Gör
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
              </div>
              <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-border-dark overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-8 py-5">Kitap Adı</th>
                        <th className="px-6 py-5">Yazar</th>
                        <th className="px-6 py-5">Eklenme Tarihi</th>
                        <th className="px-6 py-5">Durum</th>
                        <th className="px-6 py-5 text-right">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700/50">
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-slate-500">Yükleniyor...</p>
                          </td>
                        </tr>
                      ) : recentBooks.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-8 text-center text-slate-500">
                            Henüz kitap eklenmemiş
                          </td>
                        </tr>
                      ) : (
                        recentBooks.map((book) => {
                          const addedDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
                          const status = Math.random() > 0.3 ? 'published' : 'review';
                          return (
                            <tr key={book.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="relative w-12 h-16 rounded-lg overflow-hidden shadow-md flex-shrink-0 group-hover:scale-105 transition-transform duration-300 bg-slate-200 dark:bg-slate-700">
                                    {book.coverImage ? (
                                      <Image
                                        src={book.coverImage}
                                        alt={book.title}
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-400">auto_stories</span>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-base">{book.title}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">{book.category}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                    {book.author.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                                  </div>
                                  <span className="text-slate-600 dark:text-slate-300 font-medium">{book.author}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                                {formatDate(addedDate)}
                              </td>
                              <td className="px-6 py-4">
                                {status === 'published' ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/60 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Yayında
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100/60 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                    <span className="size-1.5 rounded-full bg-amber-500"></span>
                                    İncelemede
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button className="size-8 inline-flex items-center justify-center text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                  <span className="material-symbols-outlined text-xl">more_vert</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
