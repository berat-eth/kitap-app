'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    checkAuth();
    loadNotifications();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setIsAuthenticated(true);
  };

  const loadNotifications = () => {
    // Mock notifications
    setNotifications([
      {
        id: '1',
        type: 'warning',
        title: 'Yüksek Sunucu Yükü',
        message: 'Sunucu CPU kullanımı %85\'in üzerine çıktı. Lütfen kontrol edin.',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
      },
      {
        id: '2',
        type: 'info',
        title: 'Yeni Kitap Eklendi',
        message: 'Kurtuluş Projesi adlı kitap başarıyla eklendi.',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        read: false,
      },
      {
        id: '3',
        type: 'success',
        title: 'Yedekleme Tamamlandı',
        message: 'Günlük veritabanı yedeklemesi başarıyla tamamlandı.',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
      },
      {
        id: '4',
        type: 'error',
        title: 'API Hatası',
        message: 'Harici API bağlantısında sorun tespit edildi.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
      },
    ]);
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days === 0) {
      if (hours === 0) return 'Az önce';
      return `${hours} saat önce`;
    } else if (days === 1) return 'Dün';
    return `${days} gün önce`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'check_circle';
      default:
        return 'info';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      default:
        return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const filteredNotifications = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

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
              className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/10 text-primary dark:text-white dark:bg-primary/20 transition-all font-medium"
            >
              <span className="material-symbols-outlined fill-current text-[22px]">notifications</span>
              <span className="text-sm">Bildirimler</span>
              {unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">{unreadCount}</span>
              )}
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
          <div className="hidden md:flex items-center max-w-md w-full ml-auto lg:ml-0 lg:mr-auto"></div>
          <div className="flex items-center gap-3 lg:gap-4 ml-4">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
              >
                Tümünü Okundu İşaretle
              </button>
            )}
            <button className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80">
              <span className="material-symbols-outlined text-2xl">settings</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-10 hide-scrollbar scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Bildirimler</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
                </p>
              </div>
              <div className="flex items-center bg-white dark:bg-surface-dark rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700/50">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'unread'
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Okunmamış ({unreadCount})
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark">
                  <span className="material-symbols-outlined text-6xl text-slate-400 mb-4 block">notifications_off</span>
                  <p className="text-slate-500 text-lg font-medium">Bildirim bulunamadı</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 rounded-2xl bg-white dark:bg-surface-dark border ${
                      notification.read
                        ? 'border-slate-100 dark:border-slate-700/50'
                        : 'border-primary/20 bg-primary/5 dark:bg-primary/10'
                    } shadow-card hover:shadow-lg transition-all group`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl ${getTypeColor(notification.type)} flex-shrink-0`}
                      >
                        <span className="material-symbols-outlined text-2xl">{getTypeIcon(notification.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                              )}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">{formatDate(notification.date)}</p>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors"
                                title="Okundu İşaretle"
                              >
                                <span className="material-symbols-outlined text-xl">check</span>
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"
                              title="Sil"
                            >
                              <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

