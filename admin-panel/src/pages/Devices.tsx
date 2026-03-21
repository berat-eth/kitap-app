import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiJson, type PaginatedWrap } from '../lib/api';
import type { DeviceRow } from '../types';

export default function Devices() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [rows, setRows] = useState<DeviceRow[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const res = await apiJson<PaginatedWrap<DeviceRow[]>>(`/api/admin/devices?${params}`);
      setRows(res.data);
      setPagination({ total: res.pagination.total, totalPages: res.pagination.totalPages });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Liste alınamadı');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold text-white">Cihazlar</h2>
        <p className="mt-1 text-zinc-500">Kayıtlı cihaz token’ları ve etkileşim özeti</p>
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
                  <th className="px-4 py-3 font-medium">Cihaz</th>
                  <th className="px-4 py-3 font-medium">Platform</th>
                  <th className="px-4 py-3 font-medium">Favori</th>
                  <th className="px-4 py-3 font-medium">İlerleme</th>
                  <th className="px-4 py-3 font-medium">Kayıt</th>
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
                        <p className="font-mono text-xs text-zinc-300">{r.id}</p>
                        <p className="text-sm text-white">{r.device_name || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{r.platform}</td>
                      <td className="px-4 py-3 text-zinc-400">{r.favorite_count}</td>
                      <td className="px-4 py-3 text-zinc-400">{r.progress_count}</td>
                      <td className="px-4 py-3 text-zinc-500 whitespace-nowrap text-xs">
                        {new Date(r.created_at).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
            <span>
              Toplam {pagination.total.toLocaleString('tr-TR')} — sayfa {page} / {pagination.totalPages}
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
