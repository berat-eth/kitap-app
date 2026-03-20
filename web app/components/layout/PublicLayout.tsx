'use client';

import React from 'react';
import PublicHeader from '@/components/layout/PublicHeader';

export default function PublicLayout({
  children,
  headerRight,
}: {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden">
      <PublicHeader rightSlot={headerRight} />
      {children}
    </div>
  );
}

