'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="corp-button size-10 rounded-full bg-white/70 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-all group relative"
      title={theme === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
      aria-label={theme === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
    >
      <span className="material-symbols-outlined absolute transition-all duration-300 group-hover:scale-110">
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}

