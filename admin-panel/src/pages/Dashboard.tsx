import { useEffect, useState } from 'react';
import { BookOpen, Clock, FolderTree, Heart, Layers, Smartphone, Users, XCircle } from 'lucide-react';
import { apiJson, type SuccessWrap } from '../lib/api';
import type { AdminStats } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiJson<SuccessWrap<AdminStats>>('/api/admin/stats');
        if (!cancelled) setStats(res.data);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Yüklenemedi');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return <p className="text-red-400">{err}</p>;
  }

  if (!stats) {
    return (
      <div className="flex h-40 items-center justify-center text-zinc-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const cards = [
    { label: 'Toplam kitap', value: stats.books_total, icon: BookOpen, tone: 'text-sky-400 bg-sky-500/10' },
    { label: 'Bekleyen başvuru', value: stats.books_pending, icon: Clock, tone: 'text-amber-400 bg-amber-500/10' },
    { label: 'Onaylı', value: stats.books_approved, icon: Layers, tone: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Reddedilen', value: stats.books_rejected, icon: XCircle, tone: 'text-rose-400 bg-rose-500/10' },
    { label: 'Kategoriler', value: stats.categories, icon: FolderTree, tone: 'text-violet-400 bg-violet-500/10' },
    { label: 'Bölümler', value: stats.chapters, icon: Layers, tone: 'text-cyan-400 bg-cyan-500/10' },
    { label: 'Cihazlar', value: stats.devices, icon: Smartphone, tone: 'text-orange-400 bg-orange-500/10' },
    { label: 'Favoriler (kayıt)', value: stats.favorites, icon: Heart, tone: 'text-pink-400 bg-pink-500/10' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold text-white">Özet</h2>
        <p className="mt-1 text-zinc-500">Canlı veritabanı istatistikleri</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-ink-900/60 p-5 shadow-panel backdrop-blur-sm transition hover:border-white/15"
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 ${tone}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-semibold tabular-nums text-white">{value.toLocaleString('tr-TR')}</p>
            <p className="mt-1 text-sm text-zinc-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-zinc-400">
        <Users className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <p>
          Başvuruları inceleyip onaylayarak kitapları katalogda yayınlayabilir; kitaplar, bölümler ve kategorileri bu
          panelden düzenleyebilirsiniz.
        </p>
      </div>
    </div>
  );
}
