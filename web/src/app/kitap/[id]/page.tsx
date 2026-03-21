import Image from "next/image";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/section-heading";
import { getBookById, getChapters } from "@/lib/api";
import { formatDuration, resolveMediaUrl } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) return { title: "Kitap bulunamadı" };
  return {
    title: book.title,
    description: book.description || `${book.author} — Wirbooks sesli kitap`,
  };
}

export default async function BookPage({ params }: Props) {
  const { id } = await params;
  const [book, chapters] = await Promise.all([getBookById(id), getChapters(id)]);
  if (!book) notFound();

  const cover = resolveMediaUrl(book.cover_image);

  return (
    <main className="relative z-[1] mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
      <Link
        href="/kitaplar"
        className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
      >
        ← Kataloga dön
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,300px)_1fr] lg:items-start lg:gap-16">
        <div className="relative mx-auto w-full max-w-[280px] lg:mx-0 lg:max-w-none">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--surface-muted)] shadow-[var(--shadow-card)] lg:rotate-[-2deg]">
            {cover ? (
              <Image
                src={cover}
                alt={`${book.title} kapak görseli`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 280px, 300px"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-4xl text-[var(--muted)]">
                {book.title.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div
            className="pointer-events-none absolute -bottom-5 -right-5 hidden h-28 w-28 rounded-full border border-[var(--stroke)] bg-[var(--accent-soft)] lg:block"
            aria-hidden
          />
        </div>

        <div>
          {book.category?.name ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              {book.category.name}
            </p>
          ) : null}
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-[var(--ink-bright)] md:text-[2.75rem]">
            {book.title}
          </h1>
          <p className="mt-4 text-lg text-[var(--muted)]">{book.author}</p>
          {book.narrator ? (
            <p className="mt-1 text-sm text-[var(--muted)]">
              Seslendiren:{" "}
              <span className="font-medium text-[var(--ink)]">{book.narrator}</span>
            </p>
          ) : null}
          <dl className="mt-8 flex flex-wrap gap-8 rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] px-6 py-5 text-sm shadow-[var(--shadow-soft)]">
            <div>
              <dt className="text-[var(--muted)]">Süre</dt>
              <dd className="mt-1 font-semibold text-[var(--ink-bright)]">
                {formatDuration(book.duration)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Puan</dt>
              <dd className="mt-1 font-semibold text-[var(--ink-bright)]">
                {book.rating > 0 ? book.rating.toFixed(1) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Dinlenme</dt>
              <dd className="mt-1 font-semibold text-[var(--ink-bright)]">
                {book.play_count ?? 0}
              </dd>
            </div>
          </dl>
          {book.description ? (
            <div className="mt-10 max-w-2xl rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] md:p-8">
              <p className="whitespace-pre-line leading-relaxed text-[var(--ink)]">
                {book.description}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <section className="mt-16 md:mt-24">
        <SectionHeading
          eyebrow="Bölümler"
          title="Dinle"
          description="Tarayıcıda önizleme. Kesintisiz dinleme için mobil uygulamayı kullanın."
        />
        {chapters.length === 0 ? (
          <p className="text-[var(--muted)]">Bu kitap için bölüm listesi yok.</p>
        ) : (
          <ol className="space-y-3">
            {chapters.map((ch, idx) => {
              const src = resolveMediaUrl(ch.audio_url);
              return (
                <li
                  key={String(ch.id)}
                  className="flex flex-col gap-4 rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] p-5 shadow-sm md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--page-bg)] text-xs font-bold text-[var(--accent)]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-[var(--ink-bright)]">{ch.title}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {formatDuration(ch.duration)}
                      </p>
                    </div>
                  </div>
                  {src ? (
                    <audio
                      controls
                      preload="none"
                      className="h-10 w-full max-w-md accent-[var(--accent)]"
                      src={src}
                    >
                      Tarayıcı ses oynatmayı desteklemiyor.
                    </audio>
                  ) : (
                    <span className="text-xs text-[var(--muted)]">Ses dosyası yok</span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}
