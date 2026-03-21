import { useCallback, useEffect, useState } from 'react';
import { Check, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiJson, type SuccessWrap } from '../lib/api';
import type { BookStatus, SubmissionRow } from '../types';

function badgeClass(s: BookStatus) {
  if (s === 'approved') return 'bg-emerald-500/15 text-emerald-400';
  if (s === 'rejected') return 'bg-rose-500/15 text-rose-400';
  return 'bg-amber-500/15 text-amber-400';
}

export default function Submissions() {
  const [filter, setFilter] = useState<BookStatus | 'all'>('pending');
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const q = filter === 'all' ? '' : `?status=${filter}`;
      const res = await apiJson<SuccessWrap<SubmissionRow[]>>(`/api/admin/submissions${q}`);
      setRows(res.data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Liste alınamadı');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function approve(id: string) {
    setBusy(id);
    try {
      await apiJson(`/api/admin/submissions/${id}/approve`, { method: 'PUT', body: '{}' });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Onaylanamadı');
    } finally {
      setBusy(null);
    }
  }

  async function reject() {
    if (!rejectId) return;
    setBusy(rejectId);
    try {
      await apiJson(`/api/admin/submissions/${rejectId}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ note: rejectNote }),
      });
      setRejectId(null);
      setRejectNote('');
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Reddedilemedi');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-white">Başvurular</h2>
          <p className="mt-1 text-zinc-500">Kullanıcı kitap gönderimleri — onay veya red</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === s
                  ? 'bg-accent text-ink-950'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
              }`}
            >
              {s === 'all' ? 'Tümü' : s === 'pending' ? 'Bekleyen' : s === 'approved' ? 'Onaylı' : 'Reddedilen'}
            </button>
          ))}
        </div>
      </div>

      {err && <p className="mb-4 text-sm text-red-400">{err}</p>}

      {loading ? (
        <div className="flex h-40 items-center justify-center text-zinc-500">Yükleniyor…</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-ink-900/40 shadow-panel">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3 font-medium">Kitap</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium">Tarih</th>
                <th className="px-4 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                    Kayıt yok
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{r.title}</p>
                      <p className="text-xs text-zinc-500">
                        {r.author}
                        {r.narrator ? ` · ses: ${r.narrator}` : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{r.category || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${badgeClass(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/books/${r.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-300 hover:bg-white/5"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Detay
                        </Link>
                        {r.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              disabled={busy === r.id}
                              onClick={() => approve(r.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50"
                            >
                              <Check className="h-3 w-3" />
                              Onayla
                            </button>
                            <button
                              type="button"
                              disabled={busy === r.id}
                              onClick={() => {
                                setRejectId(r.id);
                                setRejectNote('');
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-rose-500/20 px-2 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/30 disabled:opacity-50"
                            >
                              <X className="h-3 w-3" />
                              Reddet
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-panel">
            <h3 className="font-display text-lg font-semibold text-white">Red gerekçesi</h3>
            <p className="mt-1 text-sm text-zinc-500">İsteğe bağlı not kullanıcıya veritabanında saklanır.</p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={4}
              className="mt-4 w-full rounded-xl border border-white/10 bg-ink-950 p-3 text-sm text-white outline-none focus:border-accent/50"
              placeholder="Not…"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectId(null)}
                className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:bg-white/5"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => void reject()}
                disabled={busy === rejectId}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-50"
              >
                Reddet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
