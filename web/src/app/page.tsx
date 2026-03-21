import Link from "next/link";
import { BookCard } from "@/components/book-card";
import { HeroIntro } from "@/components/hero-intro";
import { SectionHeading } from "@/components/section-heading";
import { getFeaturedBooks, getPopularBooks, getCategories } from "@/lib/api";

export default async function Home() {
  const [featured, popular, categories] = await Promise.all([
    getFeaturedBooks(),
    getPopularBooks(),
    getCategories(),
  ]);

  return (
    <>
      <HeroIntro />

      {/* Featured Books */}
      <section
        id="one-cikan"
        aria-labelledby="featured-heading"
        className="section"
      >
        <div className="container">
          <SectionHeading
            titleId="featured-heading"
            eyebrow="Editörün Seçimi"
            title="Öne Çıkan Kitaplar"
            description="Uzman editörlerimiz tarafından seçilen, en çok beğenilen sesli kitaplar."
          />
          {featured.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "20px",
              }}
            >
              {featured.map((book, i) => (
                <BookCard key={book.id} book={book} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState message="Henüz öne çıkan kitap yok." />
          )}
        </div>
      </section>

      {/* Categories Strip */}
      {categories.length > 0 && (
        <section aria-labelledby="categories-heading" style={{ paddingBlock: "0 clamp(48px, 8vw, 80px)" }}>
          <div className="container">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <SectionHeading
                titleId="categories-heading"
                eyebrow="Türler"
                title="Kategoriler"
              />
              <Link
                href="/kategoriler"
                className="btn btn-ghost"
                style={{ fontSize: "0.85rem", flexShrink: 0 }}
              >
                Tümünü Gör
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              {categories.slice(0, 12).map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/kitaplar?category=${cat.slug}`}
                  className={`category-pill animate-fade-up delay-${Math.min(i + 1, 8)}`}
                >
                  {cat.icon && <span aria-hidden="true">{cat.icon}</span>}
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Divider */}
      <div className="container">
        <div className="divider" />
      </div>

      {/* Popular Books */}
      <section
        aria-labelledby="popular-heading"
        className="section"
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "clamp(32px, 5vw, 48px)",
            }}
          >
            <SectionHeading
              titleId="popular-heading"
              eyebrow="Trend"
              title="Popüler Kitaplar"
              description="En çok dinlenen ve beğenilen sesli kitaplar."
            />
            <Link
              href="/kitaplar?sort=popular"
              className="btn btn-secondary"
              style={{ flexShrink: 0, alignSelf: "flex-start" }}
            >
              Tümünü Gör
            </Link>
          </div>
          {popular.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "20px",
              }}
            >
              {popular.map((book, i) => (
                <BookCard key={book.id} book={book} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState message="Henüz popüler kitap yok." />
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section aria-labelledby="cta-heading" style={{ paddingBottom: "clamp(48px, 8vw, 96px)" }}>
        <div className="container">
          <div
            style={{
              background: "linear-gradient(135deg, var(--surface-2) 0%, var(--surface-3) 100%)",
              border: "1px solid var(--border-2)",
              borderRadius: "var(--radius-xl)",
              padding: "clamp(32px, 6vw, 64px)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-50%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "600px",
              height: "300px",
              background: "radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <span className="badge badge-amber" style={{ marginBottom: "20px" }}>
              Hepsini Keşfet
            </span>
            <h2
              id="cta-heading"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                fontWeight: "700",
                color: "var(--ink)",
                marginBottom: "16px",
                letterSpacing: "-0.025em",
              }}
            >
              Tüm kataloğu keşfetmeye hazır mısın?
            </h2>
            <p
              style={{
                color: "var(--ink-2)",
                fontSize: "1rem",
                marginBottom: "32px",
                maxWidth: "480px",
                marginInline: "auto",
              }}
            >
              Yüzlerce sesli kitap seni bekliyor. Hemen başla, ücretsiz dinle.
            </p>
            <Link href="/kitaplar" className="btn btn-primary" style={{ padding: "14px 32px", fontSize: "1rem" }}>
              Tüm Kitaplara Bak
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      role="status"
      style={{
        textAlign: "center",
        padding: "64px 24px",
        color: "var(--ink-3)",
        fontSize: "0.95rem",
      }}
    >
      {message}
    </div>
  );
}
