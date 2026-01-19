'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function DonationPage() {
  const [copied, setCopied] = useState(false);
  
  const iban = 'TR330006400000112345678901'; // Örnek IBAN - gerçek IBAN ile değiştirilmeli (boşluksuz)
  const accountName = 'AudioBook Platform';
  const bankName = 'Türkiye İş Bankası';

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-border-dark bg-white/90 dark:bg-background-dark/80 backdrop-blur-xl px-4 md:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-slate-900 dark:text-white group">
            <div className="size-10 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[40px]">graphic_eq</span>
            </div>
            <h1 className="text-xl font-bold">AudioBook</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors font-medium">
              Ana Sayfa
            </Link>
            <Link href="/kesfet" className="text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors font-medium">
              Keşfet
            </Link>
            <Link href="/kutuphane" className="text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors font-medium">
              Kütüphane
            </Link>
            <Link
              href="/bagis"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">favorite</span>
              Bağış Yap
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 py-20 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center justify-center size-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <span className="material-symbols-outlined text-white text-6xl">favorite</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Projeyi Destekleyin
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              AudioBook platformunu geliştirmeye devam edebilmemiz için bağışlarınız bizim için çok değerli. 
              Her bağış, daha fazla kitap ve daha iyi bir deneyim anlamına geliyor.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-100 dark:bg-surface-dark border-b border-slate-200 dark:border-border-dark">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">₺12,450</p>
              <p className="text-slate-700 dark:text-text-secondary text-sm">Bu Ay Toplanan</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">156</p>
              <p className="text-slate-700 dark:text-text-secondary text-sm">Bağışçı Sayısı</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">₺79.81</p>
              <p className="text-slate-700 dark:text-text-secondary text-sm">Ortalama Bağış</p>
            </div>
          </div>
        </section>

        {/* Donation Form Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Info */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Neden Bağış Yapmalıyım?</h2>
                  <ul className="space-y-3 text-slate-700 dark:text-text-secondary">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-400 text-xl mt-0.5">check_circle</span>
                      <span>Daha fazla kitap eklenmesine katkıda bulunun</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-400 text-xl mt-0.5">check_circle</span>
                      <span>Platformun geliştirilmesine destek olun</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-400 text-xl mt-0.5">check_circle</span>
                      <span>Ücretsiz içeriklerin devam etmesini sağlayın</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-400 text-xl mt-0.5">check_circle</span>
                      <span>Topluluk için değer yaratın</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Bağışlar Nasıl Kullanılıyor?</h3>
                  <div className="space-y-2 text-sm text-slate-700 dark:text-text-secondary">
                    <div className="flex items-center justify-between">
                      <span>Yeni Kitap Ekleme</span>
                      <span className="text-slate-900 dark:text-white font-semibold">%40</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '40%' }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Platform Geliştirme</span>
                      <span className="text-slate-900 dark:text-white font-semibold">%35</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '35%' }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sunucu Maliyetleri</span>
                      <span className="text-slate-900 dark:text-white font-semibold">%25</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - IBAN Info */}
              <div className="p-8 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Bağış Bilgileri</h2>
                
                <div className="space-y-6">
                  {/* IBAN Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-emerald-700/20 border-2 border-emerald-500/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-emerald-200 mb-1">Hesap Adı</p>
                        <p className="text-xl font-bold text-white">{accountName}</p>
                      </div>
                      <div className="p-3 bg-white/10 rounded-xl">
                        <span className="material-symbols-outlined text-white text-3xl">account_balance</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-emerald-200 mb-1">Banka</p>
                      <p className="text-lg font-semibold text-white">{bankName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-200 mb-2">IBAN</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 px-4 py-3 bg-white/10 rounded-xl border border-white/20">
                          <p className="text-xl font-mono font-bold text-white tracking-wider break-all">
                            {iban.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ')}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(iban.replace(/\s/g, ''))}
                          className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center gap-2 text-white flex-shrink-0"
                          title="IBAN'ı Kopyala"
                        >
                          {copied ? (
                            <>
                              <span className="material-symbols-outlined text-xl">check</span>
                              <span className="text-sm font-semibold hidden sm:inline">Kopyalandı!</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-xl">content_copy</span>
                              <span className="text-sm font-semibold hidden sm:inline">Kopyala</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400">info</span>
                      Nasıl Bağış Yapabilirim?
                    </h3>
                    <ol className="space-y-3 text-slate-700 dark:text-text-secondary text-sm">
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center size-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex-shrink-0 mt-0.5">1</span>
                        <span>Yukarıdaki IBAN numarasını kopyalayın</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center size-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex-shrink-0 mt-0.5">2</span>
                        <span>İnternet bankacılığı veya mobil uygulamanızdan havale/EFT yapın</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center size-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex-shrink-0 mt-0.5">3</span>
                        <span>İşlem açıklamasına "AudioBook Bağış" yazabilirsiniz</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex items-center justify-center size-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex-shrink-0 mt-0.5">4</span>
                        <span>Bağışınız için teşekkür ederiz! 🎉</span>
                      </li>
                    </ol>
                  </div>

                  {/* Note */}
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-blue-400 text-xl flex-shrink-0 mt-0.5">lightbulb</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Not</p>
                        <p className="text-xs text-slate-700 dark:text-text-secondary leading-relaxed">
                          Bağışlarınız platformun geliştirilmesi, yeni kitapların eklenmesi ve sunucu maliyetlerinin karşılanması için kullanılmaktadır. 
                          Tüm bağışçılarımıza minnettarız!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => copyToClipboard(iban.replace(/\s/g, ''))}
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">content_copy</span>
                      IBAN'ı Kopyala
                    </button>
                    <Link
                      href="/kesfet"
                      className="w-full h-12 bg-slate-200 dark:bg-surface-hover hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-border-dark text-slate-900 dark:text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">library_books</span>
                      Kitapları Keşfet
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

