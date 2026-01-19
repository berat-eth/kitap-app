import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import ThemeProviderWrapper from '@/components/ThemeProviderWrapper';

export const metadata: Metadata = {
  title: 'AudioBook - İstediğin Zaman Dinle',
  description: 'Modern sesli kitap dinleme platformu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-x-hidden selection:bg-primary selection:text-white antialiased">
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/parallax/3.1.0/parallax.min.js"
          strategy="afterInteractive"
        />
        <ThemeProviderWrapper>
          <div className="relative flex min-h-screen w-full flex-col z-10">
            {children}
          </div>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}

