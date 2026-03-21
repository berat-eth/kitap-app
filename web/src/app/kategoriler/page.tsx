import Link from "next/link";
import { InnerPageHero } from "@/components/inner-page-hero";
import { getCategories, getBooks } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kategoriler",
  description: "Tüm sesli kitap kategorilerini keşfedin. Roman, tarih, bilim, kişisel gelişim ve daha fazlası.",
};

const CATEGORY_ICONS: Record<string, string> = {
  roman: "📖",
  tarih: "🏛️",
  bilim: "🔬",
  felsefe: "🧠",
  "kisisel-gelisim": "🌱",
  "kişisel-gelişim": "🌱",
  cocuk: "🧒",
  "çocuk": "🧒",
  biyografi: "👤",
  psikoloji: "💭",
  ekonomi: "📈",
  teknoloji: "💻",
  sanat: "🎨",
  muzik: "🎵",
  "müzik": "🎵",
  spor: "⚽",
  din: "☪️",
  siir: "✍️",
  "şiir": "✍️",
  macera: "🗺️",
  korku: "👻",
  fantastik: "🐉",
  "bilim-kurgu": "🚀",
  dedektif: "🔍",
  ask: "❤️",
  "aşk": "❤️",
};

function getCategoryIcon(slug: string, icon?: string): string {
  if (icon) return icon;
  const normalized = slug.toLowerCase().replace(/\s+/g, "-");
  return CATEGORY_ICONS[normalized] || "📚";
}

export default async function CategoriesPage() {
  const [categories, { books }] = await Promise.all([
    getCategories(),
    getBooks({ limit: 100 }),
  ]);

  // Count books per category
  const bookCountByCategory: Record<string, number> = {};
  books.forEach((book) => {
    if (book.category?.slug) {
      bookCountByCategory[book.category.slug] = (bookCountByCategory[book.category.slug] || 0) + 1;
    }
  });

  return (
    <>
      <InnerPageHero
        eyebrow="Türler"
        title="Kategoriler"
        description="İlgi alanınıza göre sesli kitap keşfedin. Her kategoride özenle seçilmiş eserler sizi bekliyor."
      />

      <div className="section">
        <div className="container">
          {categories.length === 0 ? (
            <div
              role="status"
              style={{
                textAlign: "center",
                padding: "80px 24px",
                color: "var(--ink-3)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📚</div>
              <p>Henüz kategori yok.</p>
            </div>
          ) : (
            <>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--ink-3)",
                  marginBottom: "32px",
                }}
              >
                <span style={{ color: "#d0d0d0", fontWeight: "600" }}>{categories.length}</span> kategori
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                {categories.map((cat, i) => {
                  const icon = getCategoryIcon(cat.slug, cat.icon);
                  const count = bookCountByCategory[cat.slug] || 0;

                  return (
                    <Link
                      key={String(cat.id)}
                      href={`/kitaplar?category=${cat.slug}`}
                      className={`category-card animate-fade-up delay-${Math.min(i + 1, 8)}`}
                    >
                      {/* Icon */}
                      <div
                        aria-hidden="true"
                        style={{
                          flexShrink: 0,
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.10)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.3rem",
                        }}
                      >
                        {icon}
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: "600",
                            color: "var(--ink)",
                            fontSize: "0.95rem",
                            marginBottom: "3px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cat.name}
                        </div>
                        {count > 0 && (
                          <div style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
                            {count} kitap
                          </div>
                        )}
                        {cat.description && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--ink-3)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cat.description}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ flexShrink: 0, color: "var(--ink-4)" }}
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Link>
                  );
                })}
              </div>

              {/* Browse all CTA */}
              <div
                style={{
                  marginTop: "48px",
                  textAlign: "center",
                }}
              >
                <Link href="/kitaplar" className="btn btn-secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                  Tüm Kitaplara Bak
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
