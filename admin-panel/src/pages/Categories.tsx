import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { apiJson, type SuccessWrap } from '../lib/api';
import type { CategoryRow } from '../types';

export default function Categories() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<CategoryRow | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', icon_url: '', description: '' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await apiJson<SuccessWrap<CategoryRow[]>>('/api/admin/categories');
      setRows(res.data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Liste alınamadı');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create() {
    setBusy(true);
    try {
      await apiJson('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          icon_url: form.icon_url.trim() || null,
          description: form.description.trim() || null,
        }),
      });
      setCreateOpen(false);
      setForm({ name: '', slug: '', icon_url: '', description: '' });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Oluşturulamadı');
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    if (!editRow) return;
    setBusy(true);
    try {
      await apiJson(`/api/admin/categories/${editRow.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          icon_url: form.icon_url.trim() || null,
          description: form.description.trim() || null,
        }),
      });
      setEditRow(null);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Güncellenemedi');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm('Kategori silinsin mi? Bağlı kitaplar varsa işlem reddedilir.')) return;
    setBusy(true);
    try {
      await apiJson(`/api/admin/categories/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Silinemedi');
    } finally {
      setBusy(false);
    }
  }

  function openEdit(r: CategoryRow) {
    setEditRow(r);
    setForm({
      name: r.name,
      slug: r.slug,
      icon_url: r.icon_url ?? '',
      description: r.description ?? '',
    });
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-white">Kategoriler</h2>
          <p className="mt-1 text-zinc-500">Katalog sınıflandırması</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm({ name: '', slug: '', icon_url: '', description: '' });
            setCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 hover:bg-accent-glow"
        >
          <Plus className="h-4 w-4" />
          Yeni kategori
        </button>
      </div>

      {err && <p className="mb-4 text-sm text-red-400">{err}</p>}

      {loading ? (
        <div className="flex h-40 items-center justify-center text-zinc-500">Yükleniyor…</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-ink-900/40 shadow-panel">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3 font-medium">Ad</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Kitap</th>
                <th className="px-4 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                  <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{r.slug}</td>
                  <td className="px-4 py-3 text-zinc-400">{r.book_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
                        title="Düzenle"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void remove(r.id)}
                        className="rounded-lg border border-rose-500/20 p-2 text-rose-400 hover:bg-rose-500/10 disabled:opacity-50"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(createOpen || editRow) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-panel">
            <h3 className="font-display text-lg font-semibold text-white">
              {editRow ? 'Kategori düzenle' : 'Yeni kategori'}
            </h3>
            <div className="mt-4 space-y-3">
              <input
                placeholder="Ad"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none"
              />
              <input
                placeholder="Slug (boş bırakılırsa üretilir)"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none"
              />
              <input
                placeholder="İkon URL"
                value={form.icon_url}
                onChange={(e) => setForm((f) => ({ ...f, icon_url: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none"
              />
              <textarea
                placeholder="Açıklama"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCreateOpen(false);
                  setEditRow(null);
                }}
                className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:bg-white/5"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={busy || !form.name.trim()}
                onClick={() => void (editRow ? saveEdit() : create())}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50"
              >
                {editRow ? 'Kaydet' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
