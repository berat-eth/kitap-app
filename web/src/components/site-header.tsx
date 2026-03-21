import Link from "next/link";

const NAV_LINKS = [
  { href: "/kitaplar", label: "Katalog" },
  { href: "/kategoriler", label: "Kategoriler" },
  { href: "/dinle", label: "Dinleme" },
  { href: "/oynatma", label: "Oynatma" },
  { href: "/bagis", label: "Bağış" },
];

export function SiteHeader() {
  return (
    <header className="site-header" role="banner">
      <div className="container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
            gap: "24px",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label="Wirbooks — Ana sayfa"
            style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "34px",
                height: "34px",
                background: "#ffffff",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "700",
                  color: "#0a0a0a",
                fontFamily: "var(--font-display)",
                flexShrink: 0,
              }}
            >
              W
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.2rem",
                fontWeight: "700",
                color: "var(--ink)",
                letterSpacing: "-0.02em",
              }}
            >
              Wirbooks
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            aria-label="Ana gezinme"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            className="hidden-mobile"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <Link
            href="/kitaplar"
            className="btn btn-primary"
            style={{ padding: "8px 18px", fontSize: "0.85rem", flexShrink: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Dinlemeye Başla
          </Link>
        </div>
      </div>

      <style>{`
        .nav-link {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--ink-2);
          transition: color 0.2s, background 0.2s;
          text-decoration: none;
        }
        .nav-link:hover {
          color: #ffffff;
          background: var(--gold-soft);
        }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}
