import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BookMarked, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { ready, authenticated, login } = useAuth();
  const navigate = useNavigate();
  const [key, setKey] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (ready && authenticated) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(key.trim());
      navigate('/', { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900/90 p-8 shadow-panel backdrop-blur-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <BookMarked className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Wirbooks Admin</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Sunucudaki <code className="text-accent/90">ADMIN_API_KEY</code> ile giriş yapın. Anahtar tarayıcıya
            gönderilmez; oturum sunucuda saklanır.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Admin API anahtarı
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                autoComplete="off"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-ink-950 py-3 pl-10 pr-4 text-sm text-white outline-none ring-accent/40 placeholder:text-zinc-600 focus:border-accent/50 focus:ring-2"
                placeholder="X-Admin-Key değeri"
                required
              />
            </div>
          </div>
          {err && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
              {err}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-ink-950 transition hover:bg-accent-glow disabled:opacity-50"
          >
            {loading ? 'Doğrulanıyor…' : 'Giriş yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
