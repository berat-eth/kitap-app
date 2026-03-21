import { BookCard } from "@/components/book-card";
import { HeroIntro } from "@/components/hero-intro";
import { SectionHeading } from "@/components/section-heading";
import { getFeaturedBooks, getPopularBooks } from "@/lib/api";

export default async function Home() {
  const [featured, popular] = await Promise.all([
    getFeaturedBooks(),
    getPopularBooks(),
  ]);

  return (
    <>
      <section className="relative z-[1] px-5 pb-6 pt-4 md:px-8 md:pb-10 md:pt-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--stroke)] bg-[var(--surface)] shadow-[var(--shadow-soft)] md:rounded-[2.25rem]">
          <div
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[var(--accent-soft)] blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 left-1/4 h-56 w-56 rounded-full bg-orange-100/80 blur-3xl"
            aria-hidden
          />
          <div className="relative grid gap-12 px-6 py-14 md:grid-cols-[1.1fr_minmax(0,0.9fr)] md:items-center md:px-14 md:py-20">
            <HeroIntro />
            <div className="relative hidden min-h-[280px] md:block" aria-hidden>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-[min(100%,320px)] w-[min(100%,280px)] rotate-3 rounded-2xl border border-[var(--stroke)] bg-gradient-to-br from-teal-50 via-white to-orange-50/90 shadow-[var(--shadow-card)]" />
                <div className="absolute -bottom-4 -left-2 h-24 w-24 rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] shadow-lg" />
                <div className="absolute -right-1 top-8 h-16 w-40 rounded-full bg-[var(--accent)]/15 blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-[1] mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
        <section id="one-cikan">
          <SectionHeading
            eyebrow="Öne çıkanlar"
            title="Yeni ve seçilmiş başlıklar"
            description="Kapak ve süre bilgisiyle hızlıca göz atın; detay için karta tıklayın."
          />
          {featured.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--stroke-strong)] bg-[var(--surface)] px-6 py-10 text-center">
              <p className="text-[var(--muted)]">
                Şu an listelenecek kitap yok. Backend&apos;in çalıştığından ve{" "}
                <code className="rounded-md bg-[var(--surface-muted)] px-2 py-0.5 text-xs font-medium text-[var(--ink-bright)]">
                  NEXT_PUBLIC_API_URL
                </code>{" "}
                ayarının doğru olduğundan emin olun.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
              {featured.map((book, i) => (
                <BookCard key={book.id} book={book} index={i} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-20 md:mt-28">
          <SectionHeading
            eyebrow="Popüler"
            title="En çok dinlenenler"
            description="Dinlenme sayısına göre sıralanan başlıklar."
          />
          {popular.length === 0 ? (
            <p className="text-[var(--muted)]">Popüler liste henüz dolmuyor.</p>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
              {popular.map((book, i) => (
                <BookCard key={`pop-${book.id}`} book={book} index={i} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
