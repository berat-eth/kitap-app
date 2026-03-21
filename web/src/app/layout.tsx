import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Wirbooks — Sesli kitap kataloğu",
    template: "%s · Wirbooks",
  },
  description:
    "Türkçe sesli kitapları keşfedin: öne çıkanlar, popüler eserler ve tam katalog.",
  metadataBase: new URL("https://wirbooks.com.tr"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full scroll-smooth">
      <body className="min-h-full bg-[var(--bg)] text-[var(--ink)] antialiased">
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}
