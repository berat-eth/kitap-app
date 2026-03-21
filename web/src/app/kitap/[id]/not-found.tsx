import Link from "next/link";

export default function BookNotFound() {
  return (
    <main className="relative z-[1] mx-auto max-w-6xl px-5 py-24 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
        404
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-[var(--ink-bright)]">
        Bu kitap bulunamadı
      </h1>
      <p className="mt-4 max-w-md text-[var(--muted)]">
        Bağlantı eski olabilir veya içerik kaldırılmış olabilir.
      </p>
      <Link
        href="/kitaplar"
        className="mt-8 inline-block text-sm font-medium text-[var(--accent-2)] underline-offset-4 hover:underline"
      >
        Kataloga dön
      </Link>
    </main>
  );
}
