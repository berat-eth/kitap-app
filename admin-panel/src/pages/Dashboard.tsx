import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Clock, FolderTree, Heart, Layers, LayoutDashboard, Smartphone, TrendingUp } from 'lucide-react';
import { apiJson, type SuccessWrap } from '../lib/api';
import type { AdminStats } from '../types';

function formatPct(n: number) {
  return `${n.toFixed(1)}%`;
}

function BooksStatusVisual({ stats }: { stats: AdminStats }) {
  const p = stats.books_pending;
  const a = stats.books_approved;
  const r = stats.books_rejected;
  const sum = p + a + r;
  const safe = sum > 0 ? sum : 1;
  const pPct = (p / safe) * 100;
  const aPct = (a / safe) * 100;
  const rPct = (r / safe) * 100;

  const donutStyle = useMemo(() => {
    const c1 = pPct;
    const c2 = c1 + aPct;
    return {
      background: `conic-gradient(from -90deg, rgb(251 191 36) 0% ${c1}%, rgb(52 211 153) ${c1}% ${c2}%, rgb(251 113 133) ${c2}% 100%)`,
    };
  }, [pPct, aPct]);

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-6 shadow-panel">
      <div className="mb-4 flex items-center gap-2">
        <LayoutDashboard className="h-5 w-5 text-accent" />
        <h3 className="font-display text-lg font-semibold text-white">Kitap durum dağılımı</h3>
      </div>
      <p className="mb-6 text-sm text-zinc-500">
        Onaylı, bekleyen ve reddedilen kayıtların oranı (grafikte toplam: {sum.toLocaleString('tr-TR')} kayıt)
      </p>
      <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:justify-center md:gap-12">
        <div className="relative h-40 w-40 shrink-0">
          <div
            className="h-full w-full rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
            style={donutStyle}
            role="img"
            aria-label={`Bekleyen ${p}, onaylı ${a}, reddedilen ${r}`}
          />
          <div className="absolute left-1/2 top-1/2 flex h-[5.5rem] w-[5.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-ink-950 ring-1 ring-white/10">
            <span className="text-2xl font-bold tabular-nums text-white">{stats.books_total}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">toplam kitap</span>
          </div>
        </div>
        <div className="w-full max-w-sm space-y-3">
          <div className="h-4 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
            <div className="flex h-full w-full">
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${pPct}%` }}
                title={`Bekleyen ${formatPct(pPct)}`}
              />
              <div
                className="h-full bg-emerald-400 transition-all"
                style={{ width: `${aPct}%` }}
                title={`Onaylı ${formatPct(aPct)}`}
              />
              <div
                className="h-full bg-rose-400 transition-all"
                style={{ width: `${rPct}%` }}
                title={`Reddedilen ${formatPct(rPct)}`}
              />
            </div>
          </div>
          <ul className="grid gap-2 text-sm sm:grid-cols-3">
            <li className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-2 py-1.5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" />
              <span className="text-zinc-400">Bekleyen</span>
              <span className="ml-auto font-semibold tabular-nums text-white">{p}</span>
            </li>
            <li className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-2 py-1.5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400" />
              <span className="text-zinc-400">Onaylı</span>
              <span className="ml-auto font-semibold tabular-nums text-white">{a}</span>
            </li>
            <li className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-2 py-1.5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-400" />
              <span className="text-zinc-400">Red</span>
              <span className="ml-auto font-semibold tabular-nums text-white">{r}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ScaleBars({ stats }: { stats: AdminStats }) {
  const rows = useMemo(
    () => [
      { label: 'Bölümler', value: stats.chapters, color: 'bg-cyan-400', icon: Layers },
      { label: 'Kategoriler', value: stats.categories, color: 'bg-violet-400', icon: FolderTree },
      { label: 'Cihazlar', value: stats.devices, color: 'bg-orange-400', icon: Smartphone },
      { label: 'Favori kayıtları', value: stats.favorites, color: 'bg-pink-400', icon: Heart },
    ],
    [stats]
  );
  const maxV = Math.max(1, ...rows.map((x) => x.value));

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-6 shadow-panel">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-accent" />
        <h3 className="font-display text-lg font-semibold text-white">Katalog ölçeği</h3>
      </div>
      <p className="mb-5 text-sm text-zinc-500">Bölüm, kategori, cihaz ve favori sayıları (göreli çubuk)</p>
      <ul className="space-y-4">
        {rows.map(({ label, value, color, icon: Icon }) => {
          const pct = (value / maxV) * 100;
          return (
            <li key={label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-zinc-400">
                  <Icon className="h-4 w-4 text-zinc-500" />
                  {label}
                </span>
                <span className="font-semibold tabular-nums text-white">{value.toLocaleString('tr-TR')}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/5">
                <div
                  className={`h-full rounded-full ${color} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

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

  const quick = [
    { label: 'Toplam kitap', value: stats.books_total, icon: BookOpen, ring: 'ring-sky-500/30' },
    { label: 'Bekleyen başvuru', value: stats.books_pending, icon: Clock, ring: 'ring-amber-500/30' },
    { label: 'Bölüm', value: stats.chapters, icon: Layers, ring: 'ring-cyan-500/30' },
    { label: 'Cihaz', value: stats.devices, icon: Smartphone, ring: 'ring-orange-500/30' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold text-white">Özet</h2>
        <p className="mt-1 text-zinc-500">Grafikler ve canlı veritabanı istatistikleri</p>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quick.map(({ label, value, icon: Icon, ring }) => (
          <div
            key={label}
            className={`rounded-2xl border border-white/10 bg-ink-900/60 p-4 shadow-panel ring-1 ${ring} backdrop-blur-sm`}
          >
            <div className="mb-2 flex items-center justify-between">
              <Icon className="h-5 w-5 text-zinc-500" />
              <span className="text-2xl font-bold tabular-nums text-white">{value.toLocaleString('tr-TR')}</span>
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BooksStatusVisual stats={stats} />
        <ScaleBars stats={stats} />
      </div>
    </div>
  );
}
