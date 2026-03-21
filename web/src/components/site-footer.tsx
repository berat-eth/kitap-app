import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--stroke)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <p className="font-display text-lg font-semibold text-[var(--ink-bright)]">
            Wirbooks
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Türkçe sesli kitaplar için sade, okunaklı bir web kataloğu. Tam deneyim
            için mobil uygulamayı kullanın.
          </p>
        </div>
        <div className="flex flex-wrap gap-8 text-sm font-medium">
          <Link
            href="/kitaplar"
            className="text-[var(--muted)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:underline"
          >
            Tüm kitaplar
          </Link>
          <a
            href="https://api.wirbooks.com.tr/api/health"
            className="text-[var(--muted)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            API durumu
          </a>
        </div>
      </div>
    </footer>
  );
}
