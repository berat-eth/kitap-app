import Image from "next/image";
import Link from "next/link";
import type { Book } from "@/lib/types";
import { formatDuration, resolveMediaUrl } from "@/lib/utils";

type Props = { book: Book; index?: number };

export function BookCard({ book, index = 0 }: Props) {
  const cover = resolveMediaUrl(book.cover_image);
  const delay = Math.min(index, 10) * 0.04;

  return (
    <article
      className="book-card group relative"
      style={{ animationDelay: `${delay}s` }}
    >
      <Link
        href={`/kitap/${book.id}`}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]"
      >
        <div
          className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--surface-muted)] shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_28px_60px_-24px_rgba(15,23,42,0.22)]"
        >
          {cover ? (
            <Image
              src={cover}
              alt={`${book.title} kapak görseli`}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--surface-muted)] to-[var(--surface)] p-4 text-center font-display text-2xl font-semibold text-[var(--muted)]"
              aria-hidden
            >
              {book.title.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/88 via-slate-900/20 to-transparent opacity-95" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="line-clamp-2 font-display text-base font-semibold leading-snug text-white drop-shadow-sm">
              {book.title}
            </p>
            <p className="mt-1 text-xs font-medium text-white/80">{book.author}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 px-0.5 text-xs text-[var(--muted)]">
          <span className="font-medium">{formatDuration(book.duration)}</span>
          {book.category?.name ? (
            <span className="truncate rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
              {book.category.name}
            </span>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
