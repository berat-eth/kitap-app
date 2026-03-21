import Link from "next/link";

const secondary = [
  { href: "/dinle", label: "Dinleme rehberi" },
  { href: "/oynatma", label: "Oynatma" },
  { href: "/bagis", label: "Bağış" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--stroke)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <p className="font-display text-lg font-semibold text-[var(--ink-bright)]">
              Wirbooks
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Türkçe sesli kitaplar için sade, okunaklı bir web kataloğu. Tam deneyim
              için mobil uygulamayı kullanın.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Keşfet
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/kitaplar"
                    className="text-[var(--ink)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:underline"
                  >
                    Tüm kitaplar
                  </Link>
                </li>
                <li>
                  <a
                    href="https://api.wirbooks.com.tr/api/health"
                    className="text-[var(--ink)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:underline"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    API durumu
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Yardım & destek
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {secondary.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[var(--ink)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
