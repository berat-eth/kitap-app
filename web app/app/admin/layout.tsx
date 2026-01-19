'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Login sayfası hariç tüm admin sayfalarında auth kontrolü
    if (pathname !== '/admin/login') {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
      }
    }
  }, [pathname, router]);

  return <>{children}</>;
}

