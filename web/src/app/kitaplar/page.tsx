import { BookCard } from "@/components/book-card";
import { SectionHeading } from "@/components/section-heading";
import { getBooks, getCategories } from "@/lib/api";
import Link from "next/link";
import type { ReactNode } from "react";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
}>;

export const metadata = {
  title: "Katalog",
  description: "Tüm Türkçe sesli kitapları keşfedin. Kategori ve sıralama ile filtreleyin.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const sort = sp.sort || "newest";
  const category = sp.category || "";
  const q = sp.q || "";

  const [{ books, pagination }, categories] = await Promise.all([
    getBooks({ page, limit: 16, search: q || undefined, category: category || undefined, sort }),
    getCategories(),
  ]);

  const sortOptions = [
    { value: "newest", label: "Yeniler" },
    { value: "popular", label: "Popüler" },
    { value: "rating", label: "Puan" },
    { value: "title", label: "Başlık (A–Z)" },
  ];

  return (
    <div className="section">
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: "40px" }}>
          <SectionHeading
            titleId="heading-catalog"
            eyebrow="Katalog"
            title="Tüm Sesli Kitaplar"
            description="Arama, kategori ve sıralama ile listeyi daraltın."
          />
        </div>

        {/* Filter Form */}
        <form
          method="get"
          action="/kitaplar"
          role="search"
          aria-label="Kitap ara ve filtrele"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
            marginBottom: "40px",
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            alignItems: "flex-end",
          }}
        >
          <span className="sr-only" id="catalog-filter-hint">
            Sonuçları daraltmak için arama kutusuna yazın, kategori ve sıralama seçin, Uygula düğmesine basın.
          </span>

          {/* Search */}
          <label
            style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 200px", minWidth: "180px" }}
          >
            <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Arama
            </span>
            <div className="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                id="catalog-q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Başlık veya yazar..."
                autoComplete="off"
                aria-describedby="catalog-filter-hint"
                className="input"
              />
            </div>
          </label>

          {/* Category */}
          <label
            style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "0 1 180px", minWidth: "160px" }}
          >
            <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Kategori
            </span>
            <select
              id="catalog-category"
              name="category"
              defaultValue={category}
              className="input"
              style={{ cursor: "pointer" }}
            >
              <option value="">Tümü</option>
              {categories.map((c) => (
                <option key={String(c.id)} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          {/* Sort */}
          <label
            style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "0 1 160px", minWidth: "140px" }}
          >
            <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Sırala
            </span>
            <select
              id="catalog-sort"
              name="sort"
              defaultValue={sort}
              className="input"
              style={{ cursor: "pointer" }}
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            Uygula
          </button>

          {(q || category || sort !== "newest") && (
            <Link
              href="/kitaplar"
              className="btn btn-ghost"
              style={{ fontSize: "0.85rem" }}
            >
              Temizle
            </Link>
          )}
        </form>

        {/* Results */}
        {books.length === 0 ? (
          <div
            role="status"
            aria-live="polite"
            style={{
              textAlign: "center",
              padding: "80px 24px",
              background: "var(--surface)",
              border: "1px dashed var(--border-2)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📚</div>
            <p style={{ color: "var(--ink-2)", marginBottom: "20px" }}>
              Sonuç bulunamadı. Filtreleri değiştirin veya{" "}
              <Link href="/kitaplar" style={{ color: "#d0d0d0", fontWeight: "600" }}>
                tüm kitaplara
              </Link>{" "}
              bakın.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <p
                className="sr-only"
                aria-live="polite"
              >
                {books.length} kitap listeleniyor.
              </p>
              {pagination && (
                <p style={{ fontSize: "0.85rem", color: "var(--ink-3)" }}>
                  <span style={{ color: "#d0d0d0", fontWeight: "600" }}>{pagination.total}</span> kitap bulundu
                </p>
              )}
            </div>
            <ul
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "20px",
                listStyle: "none",
                padding: 0,
                margin: 0,
              }}
              aria-label="Kitap sonuçları"
            >
              {books.map((book, i) => (
                <li key={book.id}>
                  <BookCard book={book} index={i} />
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <nav
            style={{
              marginTop: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
            aria-label="Sayfa numaraları"
          >
            {page > 1 && (
              <PageLink page={page - 1} q={q} category={category} sort={sort} ariaLabel={`Önceki sayfa, sayfa ${page - 1}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Önceki
              </PageLink>
            )}

            {/* Page numbers */}
            {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <PageLink
                  key={p}
                  page={p}
                  q={q}
                  category={category}
                  sort={sort}
                  ariaLabel={`Sayfa ${p}`}
                  active={p === page}
                >
                  {p}
                </PageLink>
              );
            })}

            {pagination.totalPages > 7 && page < pagination.totalPages && (
              <>
                <span style={{ color: "var(--ink-4)", padding: "0 4px" }}>…</span>
                <PageLink
                  page={pagination.totalPages}
                  q={q}
                  category={category}
                  sort={sort}
                  ariaLabel={`Son sayfa, sayfa ${pagination.totalPages}`}
                  active={page === pagination.totalPages}
                >
                  {pagination.totalPages}
                </PageLink>
              </>
            )}

            {page < pagination.totalPages && (
              <PageLink page={page + 1} q={q} category={category} sort={sort} ariaLabel={`Sonraki sayfa, sayfa ${page + 1}`}>
                Sonraki
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </PageLink>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}

function PageLink({
  page,
  q,
  category,
  sort,
  children,
  ariaLabel,
  active = false,
}: {
  page: number;
  q: string;
  category: string;
  sort: string;
  children: ReactNode;
  ariaLabel: string;
  active?: boolean;
}) {
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (category) sp.set("category", category);
  if (sort && sort !== "newest") sp.set("sort", sort);
  sp.set("page", String(page));
  return (
    <Link
      href={`/kitaplar?${sp.toString()}`}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={`page-link ${active ? "active" : ""}`}
      style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "0 12px", minWidth: "40px" }}
    >
      {children}
    </Link>
  );
}
