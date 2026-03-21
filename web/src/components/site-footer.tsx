import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      role="contentinfo"
      style={{
        position: "relative",
        zIndex: 10,
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
        marginTop: "auto",
      }}
    >
      <div className="container" style={{ paddingBlock: "48px 32px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          {/* Brand */}
          <div>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  background: "#ffffff",
                  borderRadius: "7px",
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0a0a0a",
                  fontFamily: "var(--font-display)",
                }}
              >
                W
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  color: "var(--ink)",
                }}
              >
                Wirbooks
              </span>
            </Link>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--ink-3)",
                lineHeight: "1.6",
                maxWidth: "240px",
              }}
            >
              Türkçe sesli kitapları tek platformda keşfedin. Binlerce eser, dilediğiniz zaman.
            </p>
          </div>

          {/* Keşfet */}
          <div>
            <h3
              style={{
                fontSize: "0.75rem",
                fontWeight: "600",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#d0d0d0",
                marginBottom: "16px",
                fontFamily: "var(--font-body)",
              }}
            >
              Keşfet
            </h3>
            <nav aria-label="Keşfet bağlantıları">
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { href: "/kitaplar", label: "Tüm Kitaplar" },
                  { href: "/kategoriler", label: "Kategoriler" },
                  { href: "/kitaplar?sort=popular", label: "Popüler" },
                  { href: "/kitaplar?sort=newest", label: "Yeni Eklenenler" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Yardım */}
          <div>
            <h3
              style={{
                fontSize: "0.75rem",
                fontWeight: "600",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#d0d0d0",
                marginBottom: "16px",
                fontFamily: "var(--font-body)",
              }}
            >
              Yardım & Destek
            </h3>
            <nav aria-label="Yardım bağlantıları">
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { href: "/dinle", label: "Dinleme Rehberi" },
                  { href: "/oynatma", label: "Oynatma Kontrolleri" },
                  { href: "/bagis", label: "Bağış Yap" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="divider" style={{ marginBottom: "24px" }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p style={{ fontSize: "0.8rem", color: "var(--ink-4)" }}>
            © {new Date().getFullYear()} Wirbooks. Tüm hakları saklıdır.
          </p>
          <a
            href="https://api.wirbooks.com.tr/health"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-status"
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "var(--success)",
                display: "inline-block",
              }}
            />
            API Durumu
          </a>
        </div>
      </div>

      <style>{`
        .footer-link {
          font-size: 0.875rem;
          color: var(--ink-3);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-link:hover { color: var(--ink); }
        .footer-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--ink-4);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-status:hover { color: var(--ink-2); }
      `}</style>
    </footer>
  );
}
