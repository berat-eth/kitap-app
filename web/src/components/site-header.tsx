import Link from "next/link";

const links = [
  { href: "/kitaplar", label: "Katalog" },
  { href: "/dinle", label: "Dinleme" },
  { href: "/oynatma", label: "Oynatma" },
  { href: "/bagis", label: "Bağış" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:gap-6 md:px-8">
        <Link
          href="/"
          className="group flex shrink-0 items-baseline gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]"
        >
          <span className="font-display text-xl font-semibold tracking-tight text-[var(--ink-bright)] md:text-2xl">
            Wirbooks
          </span>
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)] sm:inline">
            sesli kitap
          </span>
        </Link>
        <nav
          aria-label="Ana menü"
          className="flex max-w-full flex-1 flex-wrap items-center justify-end gap-1 sm:gap-0.5"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--ink-bright)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)] md:px-4"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
