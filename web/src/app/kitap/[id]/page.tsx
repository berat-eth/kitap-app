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
    <div className="section">
      <div className="container">
        {/* Back link */}
        <Link
          href="/kitaplar"
          aria-label="Kitap kataloğuna dön"
          className="back-link"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Kataloğa Dön
        </Link>

        {/* Book Hero */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 280px) 1fr",
            gap: "clamp(32px, 6vw, 64px)",
            alignItems: "start",
            marginBottom: "clamp(48px, 8vw, 80px)",
          }}
          className="book-detail-grid"
        >
          {/* Cover */}
          <div
            className="animate-scale-in"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "280px",
              margin: "0 auto",
            }}
          >
            <figure style={{ margin: 0 }}>
              <div
                style={{
                  position: "relative",
                  aspectRatio: "2/3",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  border: "1px solid var(--border-2)",
                  boxShadow: "var(--shadow-card)",
                  background: "var(--surface-2)",
                  transform: "rotate(-1.5deg)",
                }}
              >
                {cover ? (
                  <Image
                    src={cover}
                    alt=""
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="280px"
                    priority
                    aria-hidden
                  />
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-display)",
                      fontSize: "4rem",
                      fontWeight: "900",
                      color: "#ffffff",
                      opacity: 0.3,
                    }}
                    aria-hidden
                  >
                    {book.title.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <figcaption className="sr-only">{book.title} kapak görseli</figcaption>
            </figure>

            {/* Glow decoration */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: "-20px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "80%",
                height: "40px",
                background: "radial-gradient(ellipse, rgba(255,255,255,0.08) 0%, transparent 70%)",
                filter: "blur(12px)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Info */}
          <div className="animate-fade-up">
            {book.category?.name && (
              <span className="badge badge-gold" style={{ marginBottom: "16px" }}>
                {book.category.name}
              </span>
            )}

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                fontWeight: "900",
                lineHeight: "1.1",
                letterSpacing: "-0.03em",
                color: "var(--ink)",
                marginBottom: "12px",
              }}
            >
              {book.title}
            </h1>

            <p
              style={{
                fontSize: "1.1rem",
                color: "var(--ink-2)",
                marginBottom: "6px",
                fontStyle: "italic",
              }}
            >
              {book.author}
            </p>

            {book.narrator && (
              <p style={{ fontSize: "0.875rem", color: "var(--ink-3)", marginBottom: "24px" }}>
                Seslendiren:{" "}
                <span style={{ color: "var(--ink-2)", fontWeight: "500" }}>{book.narrator}</span>
              </p>
            )}

            {/* Stats */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "28px",
                marginTop: book.narrator ? 0 : "24px",
              }}
            >
              <div className="stat-card" style={{ flex: "1 1 100px", minWidth: "100px" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                  Süre
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: "700", color: "var(--ink)" }}>
                  {formatDuration(book.duration)}
                </div>
              </div>
              <div className="stat-card" style={{ flex: "1 1 100px", minWidth: "100px" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                  Puan
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: "700",                 color: "#d0d0d0" }}>
                  {book.rating > 0 ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {book.rating.toFixed(1)}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </span>
                  ) : "—"}
                </div>
              </div>
              <div className="stat-card" style={{ flex: "1 1 100px", minWidth: "100px" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                  Dinlenme
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: "700", color: "var(--ink)" }}>
                  {(book.play_count ?? 0).toLocaleString("tr-TR")}
                </div>
              </div>
            </div>

            {/* Description */}
            {book.description && (
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "24px",
                  maxWidth: "600px",
                }}
              >
                <p
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: "1.75",
                    color: "var(--ink-2)",
                    whiteSpace: "pre-line",
                  }}
                >
                  {book.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chapters */}
        <section aria-labelledby="heading-chapters">
          <SectionHeading
            titleId="heading-chapters"
            eyebrow="Bölümler"
            title="Dinle"
            description="Tarayıcıda önizleme. Kesintisiz dinleme için mobil uygulamayı kullanın."
          />

          {chapters.length === 0 ? (
            <p style={{ color: "var(--ink-3)" }} role="status">
              Bu kitap için bölüm listesi yok.
            </p>
          ) : (
            <ul
              style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}
              role="list"
            >
              {chapters.map((ch, idx) => {
                const src = resolveMediaUrl(ch.audio_url);
                const label = `${book.title}: ${ch.title}. Ses oynatıcısı.`;
                return (
                  <li
                    key={String(ch.id)}
                    className="chapter-row animate-fade-up"
                    style={{ animationDelay: `${Math.min(idx * 40, 320)}ms` }}
                  >
                    {/* Number */}
                    <span
                      aria-hidden="true"
                      style={{
                        flexShrink: 0,
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        color: "#d0d0d0",
                      }}
                    >
                      {idx + 1}
                    </span>

                    {/* Title + duration */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: "600", color: "var(--ink)", fontSize: "0.9rem", marginBottom: "2px" }}>
                        <span className="sr-only">Bölüm {idx + 1}. </span>
                        {ch.title}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--ink-3)" }}>
                        {formatDuration(ch.duration)}
                      </p>
                    </div>

                    {/* Audio */}
                    {src ? (
                      <audio
                        controls
                        preload="none"
                        className="audio-player"
                        style={{ maxWidth: "320px", flexShrink: 0 }}
                        src={src}
                        aria-label={label}
                      >
                        Tarayıcı ses oynatmayı desteklemiyor.
                      </audio>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--ink-4)" }} role="status">
                        Ses dosyası yok
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .book-detail-grid {
            grid-template-columns: 1fr !important;
          }
          .chapter-row {
            flex-wrap: wrap;
          }
          .audio-player {
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
