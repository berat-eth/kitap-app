import Link from "next/link";

const links = [
  { href: "/kitaplar", label: "Katalog" },
  { href: "/#one-cikan", label: "Öne çıkanlar" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 md:px-8">
        <Link
          href="/"
          className="group flex items-baseline gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]"
        >
          <span className="font-display text-xl font-semibold tracking-tight text-[var(--ink-bright)] md:text-2xl">
            Wirbooks
          </span>
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)] sm:inline">
            sesli kitap
          </span>
        </Link>
        <nav aria-label="Ana menü" className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--ink-bright)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
