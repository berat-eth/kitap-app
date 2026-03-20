'use client';

import React from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function PublicHeader({
  rightSlot,
}: {
  rightSlot?: React.ReactNode;
}) {
  return (
    <header className="corp-header">
      <div className="corp-container py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 cursor-pointer group">
              <div className="bg-primary/20 p-1.5 rounded-lg group-hover:bg-primary/30 transition-colors">
                <span className="material-symbols-outlined text-2xl text-primary">graphic_eq</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Wirbooks</h2>
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              <Link
                href="/kesfet"
                className="text-sm font-medium text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Keşfet
              </Link>
              <Link
                href="/kutuphane"
                className="text-sm font-medium text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Kütüphane
              </Link>
              <a
                className="text-sm font-medium text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors"
                href="#"
              >
                Topluluk
              </a>
            </nav>
          </div>

          <div className="flex items-center justify-end gap-4">
            {rightSlot}
            <ThemeToggle />
            <Link
              href="/bagis"
              className="corp-button hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <span className="material-symbols-outlined text-[18px]">favorite</span>
              <span>Bağış Yap</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

