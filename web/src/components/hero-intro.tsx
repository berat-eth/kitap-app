import Link from "next/link";

export function HeroIntro() {
  return (
    <section
      aria-labelledby="hero-heading"
      style={{
        position: "relative",
        overflow: "hidden",
        paddingTop: "clamp(64px, 12vw, 120px)",
        paddingBottom: "clamp(48px, 8vw, 80px)",
      }}
    >
      {/* Decorative orb */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "400px",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="container">
        <div
          style={{
            maxWidth: "760px",
            marginInline: "auto",
            textAlign: "center",
          }}
        >
          {/* Eyebrow */}
          <div
            className="animate-fade-up"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "24px",
            }}
          >
            <span className="badge badge-gold">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Türkçe Sesli Kitap Platformu
            </span>
          </div>

          {/* Heading */}
          <h1
            id="hero-heading"
            className="animate-fade-up delay-1"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
              fontWeight: "900",
              lineHeight: "1.08",
              letterSpacing: "-0.03em",
              marginBottom: "24px",
              color: "var(--ink)",
            }}
          >
            Sesli kitapları{" "}
            <em
              className="text-shimmer"
              style={{ fontStyle: "italic", display: "inline" }}
            >
              tek yerde
            </em>{" "}
            keşfedin
          </h1>

          {/* Subtext */}
          <p
            className="animate-fade-up delay-2"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              color: "var(--ink-2)",
              lineHeight: "1.7",
              marginBottom: "40px",
              maxWidth: "560px",
              marginInline: "auto",
            }}
          >
            Binlerce Türkçe sesli kitap, tek platformda. Ücretsiz dinle, favorilerini keşfet,
            istediğin zaman devam et.
          </p>

          {/* CTA Buttons */}
          <div
            className="animate-fade-up delay-3"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "56px",
            }}
          >
            <Link href="/kitaplar" className="btn btn-primary" style={{ padding: "14px 28px", fontSize: "0.95rem" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Kataloğu Keşfet
            </Link>
            <Link href="#one-cikan" className="btn btn-secondary" style={{ padding: "14px 28px", fontSize: "0.95rem" }}>
              Öne Çıkanlar
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="animate-fade-up delay-4"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "32px",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "500+", label: "Sesli Kitap" },
              { value: "50+", label: "Kategori" },
              { value: "Ücretsiz", label: "Dinleme" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{ textAlign: "center" }}
              >
                <div
            style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "#ffffff",
                lineHeight: "1",
                marginBottom: "4px",
              }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--ink-3)", letterSpacing: "0.04em" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent, var(--border-2), transparent)",
        }}
      />
    </section>
  );
}
