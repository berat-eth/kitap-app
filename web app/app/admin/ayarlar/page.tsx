'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'AudioBook',
    siteDescription: 'Modern sesli kitap dinleme platformu',
    maintenanceMode: false,
    allowRegistration: true,
    maxUploadSize: 100,
    emailNotifications: true,
    smsNotifications: false,
  });
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      alert('Ayarlar kaydedildi!');
      setIsSaving(false);
    }, 1000);
  };

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  if (!isAuthenticated) {
    return null;
  }

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
              className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/10 text-primary dark:text-white dark:bg-primary/20 transition-all font-medium"
            >
              <span className="material-symbols-outlined fill-current text-[22px]">settings</span>
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
          <div className="hidden md:flex items-center max-w-md w-full ml-auto lg:ml-0 lg:mr-auto"></div>
          <div className="flex items-center gap-3 lg:gap-4 ml-4">
            <button className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80">
              <span className="material-symbols-outlined text-2xl">settings</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-10 hide-scrollbar scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Page Header */}
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Ayarlar</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Sistem ayarlarını yönetin</p>
            </div>

            {/* General Settings */}
            <div className="p-8 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="w-1 h-8 bg-primary rounded-full"></span>
                Genel Ayarlar
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Site Adı
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleChange('siteName', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Site Açıklaması
                  </label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => handleChange('siteDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Maksimum Yükleme Boyutu (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.maxUploadSize}
                    onChange={(e) => handleChange('maxUploadSize', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div className="p-8 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="w-1 h-8 bg-primary rounded-full"></span>
                Sistem Ayarları
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Bakım Modu</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Siteyi geçici olarak kapat</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Yeni Kayıt</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Yeni kullanıcı kayıtlarına izin ver</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowRegistration}
                      onChange={(e) => handleChange('allowRegistration', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="p-8 rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-border-dark shadow-card space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="w-1 h-8 bg-primary rounded-full"></span>
                Bildirim Ayarları
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">E-posta Bildirimleri</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">E-posta ile bildirim gönder</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">SMS Bildirimleri</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">SMS ile bildirim gönder</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={() => setSettings({
                  siteName: 'AudioBook',
                  siteDescription: 'Modern sesli kitap dinleme platformu',
                  maintenanceMode: false,
                  allowRegistration: true,
                  maxUploadSize: 100,
                  emailNotifications: true,
                  smsNotifications: false,
                })}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl transition-all"
              >
                Sıfırla
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">save</span>
                    <span>Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

