import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  BookMarked,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Smartphone,
  Inbox,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/', label: 'Özet', icon: LayoutDashboard, end: true },
  { to: '/submissions', label: 'Başvurular', icon: Inbox },
  { to: '/books', label: 'Kitaplar', icon: BookOpen },
  { to: '/categories', label: 'Kategoriler', icon: FolderTree },
  { to: '/devices', label: 'Cihazlar', icon: Smartphone },
];

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-white/10 bg-ink-900/80 backdrop-blur-md flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold tracking-tight text-white">Wirbooks</h1>
              <p className="text-xs text-zinc-500">Yönetim paneli</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent/15 text-accent-glow shadow-panel'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/login', { replace: true });
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Çıkış
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
