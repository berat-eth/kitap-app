'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  booksRead: number;
  status: 'active' | 'inactive';
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuth();
    loadUsers();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setIsAuthenticated(true);
  };

  const loadUsers = async () => {
    // Mock users data
    setTimeout(() => {
      setUsers([
        {
          id: '1',
          name: 'Mehmet Yılmaz',
          email: 'mehmet@example.com',
          role: 'Kullanıcı',
          joinDate: '2024-01-15',
          booksRead: 12,
          status: 'active',
        },
        {
          id: '2',
          name: 'Ayşe Demir',
          email: 'ayse@example.com',
          role: 'Bağışçı',
          joinDate: '2024-02-20',
          booksRead: 28,
          status: 'active',
        },
        {
          id: '3',
          name: 'Ali Kaya',
          email: 'ali@example.com',
          role: 'Kullanıcı',
          joinDate: '2024-03-10',
          booksRead: 5,
          status: 'inactive',
        },
      ]);
      setIsLoading(false);
    }, 500);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-surface-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display overflow-hidden">
      {/* Sidebar - Same as dashboard */}
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
              className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/10 text-primary dark:text-white dark:bg-primary/20 transition-all font-medium"
            >
              <span className="material-symbols-outlined fill-current text-[22px]">people</span>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-border-light dark:border-slate-700/50 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all shadow-sm"
                placeholder="Kullanıcı ara..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-4 ml-4">
            <button className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80">
              <span className="material-symbols-outlined text-2xl">settings</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-10 hide-scrollbar scroll-smooth">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Kullanıcılar</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Tüm kullanıcıları görüntüleyin ve yönetin</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Toplam Kullanıcı</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{users.length}</h3>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">people</span>
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Aktif Kullanıcı</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{users.filter((u) => u.status === 'active').length}</h3>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl">check_circle</span>
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Bağış Yapanlar</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{users.filter((u) => u.role === 'Bağışçı').length}</h3>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl">favorite</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-border-dark overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-8 py-5">Kullanıcı</th>
                      <th className="px-6 py-5">E-posta</th>
                      <th className="px-6 py-5">Rol</th>
                      <th className="px-6 py-5">Okunan Kitap</th>
                      <th className="px-6 py-5">Durum</th>
                      <th className="px-6 py-5 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700/50">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-slate-500">Yükleniyor...</p>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-12 text-center">
                          <span className="material-symbols-outlined text-6xl text-slate-400 mb-4 block">people</span>
                          <p className="text-slate-500 text-lg font-medium">Kullanıcı bulunamadı</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-4">
                              <div className="size-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white text-base">{user.name}</p>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Katılım: {new Date(user.joinDate).toLocaleDateString('tr-TR')}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-600 dark:text-slate-300">{user.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              user.role === 'Bağışçı'
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-600 dark:text-slate-300">{user.booksRead} kitap</span>
                          </td>
                          <td className="px-6 py-4">
                            {user.status === 'active' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/60 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100/60 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                                <span className="size-1.5 rounded-full bg-slate-400"></span>
                                Pasif
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button className="size-8 inline-flex items-center justify-center text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Düzenle">
                                <span className="material-symbols-outlined text-xl">edit</span>
                              </button>
                              <button className="size-8 inline-flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Sil">
                                <span className="material-symbols-outlined text-xl">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

