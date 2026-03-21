import Image from "next/image";
import Link from "next/link";
import type { Book } from "@/lib/types";
import { formatDuration, resolveMediaUrl } from "@/lib/utils";

interface BookCardProps {
  book: Book;
  index?: number;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="stars" aria-label={`${rating} yıldız`}>
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full) return (
          <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
        if (i === full && half) return (
          <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ opacity: 0.5 }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
        return (
          <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ opacity: 0.3 }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </span>
  );
}

function BookInitials({ title }: { title: string }) {
  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, var(--surface-2) 0%, var(--surface-3) 100%)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "3rem",
          fontWeight: "900",
          color: "#ffffff",
          opacity: 0.3,
          letterSpacing: "-0.04em",
        }}
      >
        {initials}
      </span>
    </div>
  );
}

export function BookCard({ book, index = 0 }: BookCardProps) {
  const delay = Math.min(index, 7);
  const delayClass = delay > 0 ? `delay-${delay}` : "";
  const coverUrl = book.cover_image ? resolveMediaUrl(book.cover_image) : null;

  return (
    <Link
      href={`/kitap/${book.id}`}
      className={`book-card animate-scale-in ${delayClass}`}
      aria-label={`${book.title} — ${book.author}`}
      style={{ display: "block", textDecoration: "none" }}
    >
      {/* Cover */}
      <div
        style={{
          position: "relative",
          aspectRatio: "2/3",
          overflow: "hidden",
          background: "var(--surface-2)",
        }}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={`${book.title} kapak görseli`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="book-cover-img"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <BookInitials title={book.title} />
        )}

        {/* Gradient overlay */}
        <div className="book-card-overlay" />

        {/* Bottom info */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "16px 14px 14px",
          }}
        >
          {book.category && (
            <span
              className="badge badge-gold"
              style={{ marginBottom: "8px", fontSize: "0.65rem" }}
            >
              {book.category.name}
            </span>
          )}
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.95rem",
              fontWeight: "700",
              color: "var(--ink)",
              lineHeight: "1.25",
              marginBottom: "3px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {book.title}
          </h3>
          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--ink-2)",
              fontStyle: "italic",
            }}
          >
            {book.author}
          </p>
        </div>
      </div>

      {/* Meta row */}
      <div
        style={{
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <StarRating rating={book.rating} />
          <span style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
            {book.rating.toFixed(1)}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.75rem",
            color: "var(--ink-3)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {formatDuration(book.duration)}
        </div>
      </div>
    </Link>
  );
}
