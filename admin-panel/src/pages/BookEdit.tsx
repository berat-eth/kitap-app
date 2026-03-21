import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { apiJson, type SuccessWrap } from '../lib/api';
import type { AdminBook, AdminChapter, BookStatus, CategoryRow } from '../types';

export default function BookEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<AdminBook | null>(null);
  const [chapters, setChapters] = useState<AdminChapter[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<Partial<AdminBook>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [newCh, setNewCh] = useState({ title: '', audio_url: '', order_no: '1', duration_seconds: '0' });
  const [editingChapter, setEditingChapter] = useState<AdminChapter | null>(null);
  const [editChForm, setEditChForm] = useState({
    title: '',
    audio_url: '',
    order_no: '1',
    duration_seconds: '0',
  });

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setErr(null);
    try {
      const [detail, cats] = await Promise.all([
        apiJson<SuccessWrap<{ book: AdminBook; chapters: AdminChapter[] }>>(`/api/admin/books/${id}`),
        apiJson<SuccessWrap<CategoryRow[]>>('/api/admin/categories'),
      ]);
      setBook(detail.data.book);
      setForm(detail.data.book);
      setChapters(detail.data.chapters);
      setCategories(cats.data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveBook() {
    if (!id) return;
    setBusy(true);
    setSavedMsg(null);
    try {
      const body = {
        title: form.title,
        author: form.author,
        narrator: form.narrator,
        description: form.description,
        category_id: form.category_id,
        cover_url: form.cover_url,
        duration_seconds: form.duration_seconds,
        play_count: form.play_count,
        rating: form.rating,
        is_premium: form.is_premium,
        is_active: form.is_active,
        status: form.status,
      };
      const res = await apiJson<SuccessWrap<AdminBook>>(`/api/admin/books/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      setBook(res.data);
      setForm(res.data);
      setSavedMsg('Kaydedildi');
      setTimeout(() => setSavedMsg(null), 2500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Kayıt başarısız');
    } finally {
      setBusy(false);
    }
  }

  async function deleteBook() {
    if (!id || !confirm('Kitap ve bölümleri kalıcı olarak silinsin mi?')) return;
    setBusy(true);
    try {
      await apiJson(`/api/admin/books/${id}`, { method: 'DELETE' });
      navigate('/books', { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Silinemedi');
    } finally {
      setBusy(false);
    }
  }

  async function addChapter() {
    if (!id) return;
    setBusy(true);
    try {
      await apiJson<SuccessWrap<AdminChapter>>('/api/admin/chapters', {
        method: 'POST',
        body: JSON.stringify({
          book_id: id,
          title: newCh.title.trim(),
          audio_url: newCh.audio_url.trim(),
          order_no: parseInt(newCh.order_no, 10) || 1,
          duration_seconds: parseInt(newCh.duration_seconds, 10) || 0,
        }),
      });
      setAddOpen(false);
      setNewCh({ title: '', audio_url: '', order_no: String((chapters.length || 0) + 1), duration_seconds: '0' });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Bölüm eklenemedi');
    } finally {
      setBusy(false);
    }
  }

  function openEditChapter(ch: AdminChapter) {
    setEditingChapter(ch);
    setEditChForm({
      title: ch.title,
      audio_url: ch.audio_url,
      order_no: String(ch.order_no),
      duration_seconds: String(ch.duration_seconds),
    });
  }

  async function saveChapterEdit() {
    if (!editingChapter) return;
    setBusy(true);
    try {
      await apiJson(`/api/admin/chapters/${editingChapter.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editChForm.title.trim(),
          audio_url: editChForm.audio_url.trim(),
          order_no: parseInt(editChForm.order_no, 10) || 1,
          duration_seconds: parseInt(editChForm.duration_seconds, 10) || 0,
        }),
      });
      setEditingChapter(null);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Bölüm güncellenemedi');
    } finally {
      setBusy(false);
    }
  }

  async function deleteChapter(chapterId: string) {
    if (!confirm('Bu bölüm silinsin mi?')) return;
    setBusy(true);
    try {
      await apiJson(`/api/admin/chapters/${chapterId}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Bölüm silinemedi');
    } finally {
      setBusy(false);
    }
  }

  if (!id) return null;

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-zinc-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (err && !book) {
    return (
      <div>
        <Link to="/books" className="mb-4 inline-flex items-center gap-1 text-sm text-accent hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Kitaplara dön
        </Link>
        <p className="text-red-400">{err}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/books" className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-accent">
            <ArrowLeft className="h-4 w-4" />
            Kitaplara dön
          </Link>
          <h2 className="font-display text-3xl font-bold text-white">{book?.title}</h2>
          <p className="mt-1 text-zinc-500">Kimlik: {id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {savedMsg && <span className="text-sm text-emerald-400">{savedMsg}</span>}
          <button
            type="button"
            disabled={busy}
            onClick={() => void saveBook()}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-accent-glow disabled:opacity-50"
          >
            Kaydet
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void deleteBook()}
            className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
          >
            Kitabı sil
          </button>
        </div>
      </div>

      {err && <p className="mb-4 text-sm text-red-400">{err}</p>}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-ink-900/40 p-6 shadow-panel">
          <h3 className="font-display text-lg font-semibold text-white">Meta veri</h3>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Başlık</label>
          <input
            value={form.title ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none focus:border-accent/50"
          />
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Yazar</label>
          <input
            value={form.author ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none focus:border-accent/50"
          />
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Anlatıcı</label>
          <input
            value={form.narrator ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, narrator: e.target.value || null }))}
            className="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none focus:border-accent/50"
          />
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Açıklama</label>
          <textarea
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || null }))}
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none focus:border-accent/50"
          />
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Kapak URL</label>
          <input
            value={form.cover_url ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, cover_url: e.target.value || null }))}
            className="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none focus:border-accent/50"
          />
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Kategori</label>
          <select
            value={form.category_id ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                category_id: e.target.value === '' ? null : Number(e.target.value),
              }))
            }
            className="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none focus:border-accent/50"
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Süre (sn)</label>
              <input
                type="number"
                min={0}
                value={form.duration_seconds ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, duration_seconds: parseInt(e.target.value, 10) || 0 }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Oynatma</label>
              <input
                type="number"
                min={0}
                value={form.play_count ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, play_count: parseInt(e.target.value, 10) || 0 }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Puan (0–5)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              max={5}
              value={form.rating ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) || 0 }))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={Boolean(form.is_premium)}
              onChange={(e) => setForm((f) => ({ ...f, is_premium: e.target.checked }))}
              className="rounded border-white/20 bg-ink-950"
            />
            Premium
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={Boolean(form.is_active)}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="rounded border-white/20 bg-ink-950"
            />
            Aktif (katalogda görünsün)
          </label>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">Durum</label>
            <select
              value={(form.status as BookStatus) || 'pending'}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as BookStatus }))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-6 shadow-panel">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-white">Bölümler</h3>
            <button
              type="button"
              onClick={() => {
                setNewCh((n) => ({
                  ...n,
                  order_no: String((chapters.length || 0) + 1),
                }));
                setAddOpen(true);
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/25"
            >
              <Plus className="h-3.5 w-3.5" />
              Bölüm ekle
            </button>
          </div>
          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {chapters.length === 0 ? (
              <p className="text-sm text-zinc-500">Henüz bölüm yok</p>
            ) : (
              chapters.map((ch) => (
                <div
                  key={ch.id}
                  className="rounded-xl border border-white/10 bg-ink-950/80 p-4 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-white">
                        #{ch.order_no} — {ch.title}
                      </p>
                      <p className="mt-1 break-all text-xs text-zinc-500">{ch.audio_url}</p>
                      <p className="mt-1 text-xs text-zinc-600">{ch.duration_seconds}s</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => openEditChapter(ch)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-accent disabled:opacity-50"
                        title="Düzenle"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void deleteChapter(ch.id)}
                        className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10 disabled:opacity-50"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {editingChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-panel">
            <h3 className="font-display text-lg font-semibold text-white">Bölüm düzenle</h3>
            <div className="mt-4 space-y-3">
              <input
                placeholder="Başlık"
                value={editChForm.title}
                onChange={(e) => setEditChForm((c) => ({ ...c, title: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none"
              />
              <input
                placeholder="Ses URL"
                value={editChForm.audio_url}
                onChange={(e) => setEditChForm((c) => ({ ...c, audio_url: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Sıra"
                  value={editChForm.order_no}
                  onChange={(e) => setEditChForm((c) => ({ ...c, order_no: e.target.value }))}
                  className="rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none"
                />
                <input
                  type="number"
                  placeholder="Süre sn"
                  value={editChForm.duration_seconds}
                  onChange={(e) => setEditChForm((c) => ({ ...c, duration_seconds: e.target.value }))}
                  className="rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingChapter(null)}
                className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:bg-white/5"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={busy || !editChForm.title.trim() || !editChForm.audio_url.trim()}
                onClick={() => void saveChapterEdit()}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-panel">
            <h3 className="font-display text-lg font-semibold text-white">Yeni bölüm</h3>
            <div className="mt-4 space-y-3">
              <input
                placeholder="Başlık"
                value={newCh.title}
                onChange={(e) => setNewCh((c) => ({ ...c, title: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none"
              />
              <input
                placeholder="Ses dosyası URL"
                value={newCh.audio_url}
                onChange={(e) => setNewCh((c) => ({ ...c, audio_url: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Sıra"
                  value={newCh.order_no}
                  onChange={(e) => setNewCh((c) => ({ ...c, order_no: e.target.value }))}
                  className="rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none"
                />
                <input
                  type="number"
                  placeholder="Süre sn"
                  value={newCh.duration_seconds}
                  onChange={(e) => setNewCh((c) => ({ ...c, duration_seconds: e.target.value }))}
                  className="rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:bg-white/5"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={busy || !newCh.title.trim() || !newCh.audio_url.trim()}
                onClick={() => void addChapter()}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
