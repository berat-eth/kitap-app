import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { PageShell } from "@/components/page-shell";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
    <html
      lang="tr"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${manrope.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-[var(--page-bg)] text-[var(--ink)]">
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}
