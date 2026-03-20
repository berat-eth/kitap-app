'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface BookSubmission {
  id: string;
  device_id: string;
  title: string;
  author: string;
  narrator: string;
  description: string | null;
  category: string;
  cover_image: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminKitapIstekleriPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState<BookSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    checkAuth();
    loadSubmissions();
  }, [filter]);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch('/api/admin/submissions?status=pending');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) setPendingCount(data.data.length);
      } catch (_) {}
    };
    fetchPending();
  }, [submissions]);

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setIsAuthenticated(true);
  };

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const url = filter === 'all' ? '/api/admin/submissions' : `/api/admin/submissions?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data) {
        setSubmissions(data.data);
        setError(null);
      } else {
        setError(data.error || 'İstekler yüklenemedi');
      }
    } catch (err) {
      setError('Bağlantı hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        loadSubmissions();
      } else {
        alert(data.error || 'Onaylama başarısız');
      }
    } catch (err) {
      alert('Bağlantı hatası');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectNote.trim() && !confirm('Not olmadan reddetmek istediğinize emin misiniz?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: rejectNote }),
      });
      const data = await res.json();
      if (data.success) {
        setRejectingId(null);
        setRejectNote('');
        loadSubmissions();
      } else {
        alert(data.error || 'Reddetme başarısız');
      }
    } catch (err) {
      alert('Bağlantı hatası');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen w-full bg-surface-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display overflow-hidden">
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
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group font-medium">
              <span className="material-symbols-outlined group-hover:text-primary transition-colors text-[22px]">dashboard</span>
              <span className="text-sm">Genel Bakış</span>
            </Link>
            <Link href="/admin/kitap" className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group font-medium">
              <span className="material-symbols-outlined group-hover:text-primary transition-colors text-[22px]">library_books</span>
              <span className="text-sm">Kitaplar</span>
            </Link>
            <Link href="/admin/kitap-istekleri" className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/10 text-primary dark:text-white dark:bg-primary/20 transition-all font-medium">
              <span className="material-symbols-outlined fill-current text-[22px]">upload_file</span>
              <span className="text-sm">Kitap İstekleri</span>
              {pendingCount > 0 && <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">{pendingCount}</span>}
            </Link>
            <Link href="/admin/kullanicilar" className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group font-medium">
              <span className="material-symbols-outlined group-hover:text-primary transition-colors text-[22px]">people</span>
              <span className="text-sm">Kullanıcılar</span>
            </Link>
            <Link href="/admin/analizler" className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group font-medium">
              <span className="material-symbols-outlined group-hover:text-primary transition-colors text-[22px]">bar_chart</span>
              <span className="text-sm">Analizler</span>
            </Link>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Sistem</p>
            <Link href="/admin/ayarlar" className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group font-medium">
              <span className="material-symbols-outlined group-hover:text-primary transition-colors text-[22px]">settings</span>
              <span className="text-sm">Ayarlar</span>
            </Link>
            <Link href="/admin/bildirimler" className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group font-medium">
              <span className="material-symbols-outlined group-hover:text-primary transition-colors text-[22px]">notifications</span>
              <span className="text-sm">Bildirimler</span>
            </Link>
          </div>
          <div className="mt-auto">
            <div className="relative bg-gradient-to-br from-surface-dark to-slate-900 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-4 overflow-hidden shadow-lg border border-slate-700/50">
              <button onClick={() => { localStorage.removeItem('admin_token'); localStorage.removeItem('admin_user'); router.push('/admin/login'); }} className="relative z-10 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors border border-white/5 backdrop-blur-sm">
                <span className="material-symbols-outlined text-base">logout</span>
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-surface-light dark:bg-background-dark relative">
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark">
          <div className="flex items-center gap-4 lg:hidden">
            <span className="material-symbols-outlined">menu</span>
            <span className="text-slate-900 dark:text-white font-bold text-lg">AudioAdmin</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={loadSubmissions} className="p-2.5 text-slate-500 hover:text-primary rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors" title="Yenile">
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 lg:p-10">
          <div className="max-w-[1600px] mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Kitap Yükleme İstekleri</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Kullanıcıların gönderdiği kitap talepleri</p>
              </div>
              <div className="flex bg-white dark:bg-surface-dark rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700/50">
                {(['pending', 'all', 'approved', 'rejected'] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                    {f === 'pending' ? 'Bekleyen' : f === 'all' ? 'Tümü' : f === 'approved' ? 'Onaylanan' : 'Reddedilen'}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm">
                {error}
              </div>
            )}

            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-border-dark overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-8 py-5">Kitap</th>
                      <th className="px-6 py-5">Yazar / Seslendiren</th>
                      <th className="px-6 py-5">Kategori</th>
                      <th className="px-6 py-5">Tarih</th>
                      <th className="px-6 py-5">Durum</th>
                      <th className="px-6 py-5 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-700/50">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-12 text-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-slate-500">Yükleniyor...</p>
                        </td>
                      </tr>
                    ) : submissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-12 text-center">
                          <span className="material-symbols-outlined text-6xl text-slate-400 mb-4 block">upload_file</span>
                          <p className="text-slate-500 text-lg font-medium">İstek bulunamadı</p>
                        </td>
                      </tr>
                    ) : (
                      submissions.map((sub) => (
                        <tr key={sub.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative w-12 h-16 rounded-lg overflow-hidden shadow-md flex-shrink-0 bg-slate-200 dark:bg-slate-700">
                                {sub.cover_image ? (
                                  <Image src={sub.cover_image} alt={sub.title} fill className="object-cover" sizes="48px" unoptimized />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-400">auto_stories</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{sub.title}</p>
                                {sub.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{sub.description}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-700 dark:text-slate-300">{sub.author}</p>
                              <p className="text-xs text-slate-500">Seslendiren: {sub.narrator}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{sub.category}</td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatDate(sub.created_at)}</td>
                          <td className="px-6 py-4">
                            {sub.status === 'pending' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100/60 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                <span className="size-1.5 rounded-full bg-amber-500"></span>
                                Bekliyor
                              </span>
                            )}
                            {sub.status === 'approved' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/60 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                <span className="size-1.5 rounded-full bg-emerald-500"></span>
                                Onaylandı
                              </span>
                            )}
                            {sub.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100/60 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                                <span className="size-1.5 rounded-full bg-red-500"></span>
                                Reddedildi
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {sub.status === 'pending' && (
                              <div className="flex items-center justify-end gap-2">
                                {rejectingId === sub.id ? (
                                  <div className="flex flex-col gap-2 items-end">
                                    <input
                                      type="text"
                                      value={rejectNote}
                                      onChange={(e) => setRejectNote(e.target.value)}
                                      placeholder="Red nedeni (opsiyonel)"
                                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm w-48"
                                    />
                                    <div className="flex gap-2">
                                      <button onClick={() => handleReject(sub.id)} disabled={actionLoading === sub.id} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-50">
                                        Reddet
                                      </button>
                                      <button onClick={() => { setRejectingId(null); setRejectNote(''); }} className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                                        İptal
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <button onClick={() => handleApprove(sub.id)} disabled={actionLoading === sub.id} className="size-8 inline-flex items-center justify-center text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="Onayla">
                                      <span className="material-symbols-outlined text-xl">check_circle</span>
                                    </button>
                                    <button onClick={() => setRejectingId(sub.id)} className="size-8 inline-flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Reddet">
                                      <span className="material-symbols-outlined text-xl">cancel</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                            {sub.status !== 'pending' && sub.admin_note && (
                              <p className="text-xs text-slate-500 max-w-[200px] truncate" title={sub.admin_note}>{sub.admin_note}</p>
                            )}
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
