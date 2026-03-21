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
    getBooks({
      page,
      limit: 16,
      search: q || undefined,
      category: category || undefined,
      sort,
    }),
    getCategories(),
  ]);

  const sortOptions = [
    { value: "newest", label: "Yeniler" },
    { value: "popular", label: "Popüler" },
    { value: "rating", label: "Puan" },
    { value: "title", label: "Başlık (A–Z)" },
  ];

  return (
    <main className="relative z-[1] mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
      <SectionHeading
        eyebrow="Katalog"
        title="Tüm sesli kitaplar"
        description="Arama, kategori ve sıralama ile listeyi daraltın. Veriler API üzerinden gelir."
      />

      <form
        className="mb-12 flex flex-col gap-4 rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] md:flex-row md:flex-wrap md:items-end md:gap-5 md:p-6"
        method="get"
        action="/kitaplar"
      >
        <label className="flex min-w-[200px] flex-1 flex-col gap-2 text-sm font-medium">
          <span className="text-[var(--muted)]">Arama</span>
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Başlık veya yazar"
            className="rounded-xl border border-[var(--stroke)] bg-[var(--page-bg)] px-4 py-3 text-[var(--ink-bright)] placeholder:text-[var(--muted)] transition-shadow focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
          />
        </label>
        <label className="flex min-w-[170px] flex-col gap-2 text-sm font-medium">
          <span className="text-[var(--muted)]">Kategori</span>
          <select
            name="category"
            defaultValue={category}
            className="rounded-xl border border-[var(--stroke)] bg-[var(--page-bg)] px-4 py-3 text-[var(--ink-bright)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
          >
            <option value="">Tümü</option>
            {categories.map((c) => (
              <option key={String(c.id)} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[170px] flex-col gap-2 text-sm font-medium">
          <span className="text-[var(--muted)]">Sırala</span>
          <select
            name="sort"
            defaultValue={sort}
            className="rounded-xl border border-[var(--stroke)] bg-[var(--page-bg)] px-4 py-3 text-[var(--ink-bright)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-white shadow-[0_12px_36px_-14px_rgba(13,148,136,0.55)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)] md:mb-0"
        >
          Uygula
        </button>
      </form>

      {books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--stroke-strong)] bg-[var(--surface)] px-6 py-12 text-center">
          <p className="text-[var(--muted)]">
            Sonuç bulunamadı. Filtreleri değiştirin veya{" "}
            <Link href="/" className="font-semibold text-[var(--accent)] hover:underline">
              ana sayfaya
            </Link>{" "}
            dönün.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
          {books.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <nav
          className="mt-14 flex flex-wrap items-center justify-center gap-3"
          aria-label="Sayfalama"
        >
          {page > 1 ? (
            <PageLink page={page - 1} q={q} category={category} sort={sort}>
              ← Önceki
            </PageLink>
          ) : null}
          <span className="rounded-full bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--muted)] shadow-sm">
            Sayfa {pagination.page} / {pagination.totalPages}
          </span>
          {page < pagination.totalPages ? (
            <PageLink page={page + 1} q={q} category={category} sort={sort}>
              Sonraki →
            </PageLink>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}

function PageLink({
  page,
  q,
  category,
  sort,
  children,
}: {
  page: number;
  q: string;
  category: string;
  sort: string;
  children: ReactNode;
}) {
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (category) sp.set("category", category);
  if (sort && sort !== "newest") sp.set("sort", sort);
  sp.set("page", String(page));
  return (
    <Link
      href={`/kitaplar?${sp.toString()}`}
      className="rounded-full border border-[var(--stroke)] bg-[var(--surface)] px-5 py-2 text-sm font-medium text-[var(--ink-bright)] shadow-sm transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
    >
      {children}
    </Link>
  );
}
