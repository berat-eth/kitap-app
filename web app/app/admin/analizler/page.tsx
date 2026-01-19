'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | 'year'>('30days');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return null;
  }

  const analyticsData = {
    totalListeners: 8502,
    newListeners: 234,
    totalListeningHours: 45230,
    averageSessionDuration: 45,
    topBooks: [
      { id: '1', title: 'Kurtuluş Projesi', listens: 1250, hours: 3200 },
      { id: '2', title: 'Zihniyet Ustalığı', listens: 980, hours: 2450 },
      { id: '3', title: 'Galaksi Sınırı', listens: 850, hours: 2100 },
      { id: '4', title: 'Osmanlı Masalları', listens: 720, hours: 1800 },
      { id: '5', title: 'Teknoloji Vizyonerleri', listens: 650, hours: 1650 },
    ],
    categoryDistribution: [
      { category: 'Bilim Kurgu', percentage: 35, count: 420 },
      { category: 'Kişisel Gelişim', percentage: 28, count: 336 },
      { category: 'Tarih', percentage: 18, count: 216 },
      { category: 'Teknoloji', percentage: 12, count: 144 },
      { category: 'Felsefe', percentage: 7, count: 84 },
    ],
    dailyStats: [
      { day: 'Pzt', listens: 1200, hours: 3200 },
      { day: 'Sal', listens: 1350, hours: 3400 },
      { day: 'Çar', listens: 1100, hours: 3100 },
      { day: 'Per', listens: 1450, hours: 3600 },
      { day: 'Cum', listens: 1600, hours: 3800 },
      { day: 'Cmt', listens: 1800, hours: 4200 },
      { day: 'Paz', listens: 1700, hours: 4000 },
    ],
  };

  const maxListens = Math.max(...analyticsData.dailyStats.map((s) => s.listens));

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
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group font-medium"
            >
              <span className="material-symbols-outlined group-hover:text-primary transition-colors text-[22px]">dashboard</span>
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
              className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/10 text-primary dark:text-white dark:bg-primary/20 transition-all font-medium"
            >
              <span className="material-symbols-outlined fill-current text-[22px]">bar_chart</span>
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
                onClick={() => {
                  localStorage.removeItem('admin_token');
                  localStorage.removeItem('admin_user');
                  router.push('/admin/login');
                }}
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
                placeholder="Analiz ara..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-4 ml-4">
            <button className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80">
              <span className="material-symbols-outlined text-2xl">download</span>
            </button>
            <button className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80">
              <span className="material-symbols-outlined text-2xl">settings</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-10 hide-scrollbar scroll-smooth">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Analizler</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Detaylı performans metrikleri ve istatistikler</p>
              </div>
              <div className="flex items-center bg-white dark:bg-surface-dark rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700/50">
                <button
                  onClick={() => setTimeRange('7days')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === '7days'
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  7 Gün
                </button>
                <button
                  onClick={() => setTimeRange('30days')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === '30days'
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  30 Gün
                </button>
                <button
                  onClick={() => setTimeRange('90days')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === '90days'
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  90 Gün
                </button>
                <button
                  onClick={() => setTimeRange('year')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === 'year'
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Yıl
                </button>
              </div>
            </div>

            {/* Key Metrics */}
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
                      +12%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Toplam Dinleyici</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{analyticsData.totalListeners.toLocaleString()}</h3>
                    <p className="text-xs text-slate-400 mt-1">+{analyticsData.newListeners} yeni bu ay</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                      <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">headphones</span>
                    </div>
                    <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                      <span className="material-symbols-outlined mr-1 text-sm">trending_up</span>
                      +8%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Toplam Dinleme</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{analyticsData.totalListeningHours.toLocaleString()}k</h3>
                    <p className="text-xs text-slate-400 mt-1">Saat</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                      <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-2xl">schedule</span>
                    </div>
                    <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                      <span className="material-symbols-outlined mr-1 text-sm">trending_up</span>
                      +5%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Ortalama Oturum</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{analyticsData.averageSessionDuration}</h3>
                    <p className="text-xs text-slate-400 mt-1">Dakika</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                      <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl">repeat</span>
                    </div>
                    <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                      <span className="material-symbols-outlined mr-1 text-sm">trending_up</span>
                      +18%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Tekrar Dinleme</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">42%</h3>
                    <p className="text-xs text-slate-400 mt-1">Oranı</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Listening Chart */}
              <div className="lg:col-span-2 p-8 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card flex flex-col">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Günlük Dinleme Aktivitesi</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Son 7 günün detaylı analizi</p>
                  </div>
                </div>
                <div className="flex-1 w-full relative min-h-[300px]">
                  <div className="flex items-end justify-between gap-2 h-[250px]">
                    {analyticsData.dailyStats.map((stat, index) => {
                      const height = (stat.listens / maxListens) * 100;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                          <div className="relative w-full flex items-end justify-center h-full">
                            <div
                              className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/60 group-hover:from-primary-dark group-hover:to-primary transition-all cursor-pointer relative"
                              style={{ height: `${height}%`, minHeight: '20px' }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                {stat.listens.toLocaleString()} dinleme
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.day}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {analyticsData.dailyStats.reduce((sum, s) => sum + s.listens, 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Toplam Dinleme</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {analyticsData.dailyStats.reduce((sum, s) => sum + s.hours, 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Toplam Saat</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Distribution */}
              <div className="lg:col-span-1 p-8 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Kategori Dağılımı</h3>
                <div className="flex-1 space-y-6">
                  {analyticsData.categoryDistribution.map((item, index) => {
                    const colors = ['primary', 'purple-500', 'emerald-500', 'orange-500', 'pink-500'];
                    const color = colors[index % colors.length];
                    return (
                      <div key={item.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.category}</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{item.percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-${color} rounded-full transition-all`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.count} kitap</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top Books */}
            <div className="p-8 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">En Çok Dinlenen Kitaplar</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Bu dönemde en popüler içerikler</p>
                </div>
              </div>
              <div className="space-y-4">
                {analyticsData.topBooks.map((book, index) => (
                  <div
                    key={book.id}
                    className="flex items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary font-bold text-lg flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white text-base group-hover:text-primary transition-colors">
                        {book.title}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">play_circle</span>
                          {book.listens.toLocaleString()} dinleme
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {book.hours.toLocaleString()} saat
                        </span>
                      </div>
                    </div>
                    <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                        style={{ width: `${(book.listens / analyticsData.topBooks[0].listens) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Cihaz Dağılımı</h3>
                <div className="space-y-4">
                  {[
                    { device: 'Mobil', percentage: 65, count: 5526 },
                    { device: 'Masaüstü', percentage: 25, count: 2126 },
                    { device: 'Tablet', percentage: 10, count: 850 },
                  ].map((item) => (
                    <div key={item.device} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.device}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{item.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.count.toLocaleString()} kullanıcı</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Zaman Dağılımı</h3>
                <div className="space-y-4">
                  {[
                    { time: 'Sabah (06-12)', percentage: 25, color: 'blue-500' },
                    { time: 'Öğle (12-18)', percentage: 35, color: 'purple-500' },
                    { time: 'Akşam (18-24)', percentage: 30, color: 'orange-500' },
                    { time: 'Gece (00-06)', percentage: 10, color: 'slate-500' },
                  ].map((item) => (
                    <div key={item.time} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.time}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{item.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${item.color} rounded-full transition-all`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

