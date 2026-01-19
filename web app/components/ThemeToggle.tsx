'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="size-10 rounded-full clay-button flex items-center justify-center text-slate-700 dark:text-text-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-all group relative"
      title={theme === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
      aria-label={theme === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
    >
      <span className="material-symbols-outlined absolute transition-all duration-300 group-hover:scale-110">
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}

