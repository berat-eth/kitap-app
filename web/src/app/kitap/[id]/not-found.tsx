import Link from "next/link";

export default function BookNotFound() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "440px" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "6rem",
            fontWeight: "900",
            lineHeight: "1",
            marginBottom: "16px",
            background: "linear-gradient(135deg, #ffffff 0%, #888888 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          aria-hidden="true"
        >
          404
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.6rem",
            fontWeight: "700",
            color: "var(--ink)",
            marginBottom: "12px",
            letterSpacing: "-0.02em",
          }}
        >
          Kitap bulunamadı
        </h1>
        <p style={{ color: "var(--ink-2)", marginBottom: "32px", lineHeight: "1.6" }}>
          Aradığınız kitap mevcut değil veya kaldırılmış olabilir.
          Katalogdan başka kitaplara göz atabilirsiniz.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/kitaplar" className="btn btn-primary">
            Kataloğa Dön
          </Link>
          <Link href="/" className="btn btn-secondary">
            Ana Sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
