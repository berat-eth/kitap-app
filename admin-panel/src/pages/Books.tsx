import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { apiJson, type PaginatedWrap } from '../lib/api';
import type { AdminBook, BookStatus } from '../types';

function badgeClass(s: BookStatus) {
  if (s === 'approved') return 'bg-emerald-500/15 text-emerald-400';
  if (s === 'rejected') return 'bg-rose-500/15 text-rose-400';
  return 'bg-amber-500/15 text-amber-400';
}

export default function Books() {
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [status, setStatus] = useState<BookStatus | ''>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [rows, setRows] = useState<AdminBook[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (status) params.set('status', status);
      if (search.trim()) params.set('search', search.trim());
      const res = await apiJson<PaginatedWrap<AdminBook[]>>(`/api/admin/books?${params}`);
      setRows(res.data);
      setPagination({ total: res.pagination.total, totalPages: res.pagination.totalPages });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Liste alınamadı');
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, search]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold text-white">Kitaplar</h2>
        <p className="mt-1 text-zinc-500">Tüm kayıtlar — düzenleme ve bölüm yönetimi</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setPage(1);
                setSearch(searchInput);
              }
            }}
            placeholder="Başlık veya yazar ara…"
            className="w-full rounded-xl border border-white/10 bg-ink-900 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-accent/50"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setPage(1);
            setSearch(searchInput);
          }}
          className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/15"
        >
          Ara
        </button>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as BookStatus | '');
          }}
          className="rounded-xl border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-white outline-none"
        >
          <option value="">Tüm durumlar</option>
          <option value="pending">Bekleyen</option>
          <option value="approved">Onaylı</option>
          <option value="rejected">Reddedilen</option>
        </select>
      </div>

      {err && <p className="mb-4 text-sm text-red-400">{err}</p>}

      {loading ? (
        <div className="flex h-40 items-center justify-center text-zinc-500">Yükleniyor…</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-ink-900/40 shadow-panel">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3 font-medium">Kitap</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                  <th className="px-4 py-3 font-medium">Aktif</th>
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
                        <p className="text-xs text-zinc-500">{r.author}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{r.category_name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${badgeClass(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{r.is_active ? 'Evet' : 'Hayır'}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/books/${r.id}`}
                          className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20"
                        >
                          Düzenle
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
            <span>
              Toplam {pagination.total.toLocaleString('tr-TR')} kayıt — sayfa {page} / {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/5 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Önceki
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/5 disabled:opacity-40"
              >
                Sonraki
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
