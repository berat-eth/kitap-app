import Link from "next/link";

export function HeroIntro() {
  return (
    <div className="relative z-[1] max-w-2xl">
      <p className="hero-reveal text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)] [animation-delay:0ms]">
        Dinlemek için tasarlandı
      </p>
      <h1 className="hero-reveal mt-5 font-display text-[clamp(2.25rem,5.5vw,3.75rem)] font-semibold leading-[1.05] tracking-tight text-[var(--ink-bright)] [animation-delay:80ms]">
        Sesli kitapları{" "}
        <span className="relative whitespace-nowrap">
          <span className="relative z-[1]">tek yerde</span>
          <span
            className="absolute -bottom-1 left-0 right-0 -z-0 h-3 rounded-full bg-[var(--accent-soft)]"
            aria-hidden
          />
        </span>{" "}
        keşfedin.
      </h1>
      <p className="hero-reveal mt-6 max-w-lg text-lg leading-relaxed text-[var(--muted)] [animation-delay:160ms]">
        Öne çıkanlar ve popüler başlıklar; tarayıcıdan hızlı önizleme. Tam dinleme
        deneyimi için uygulamayı kullanın.
      </p>
      <div className="hero-reveal mt-10 flex flex-wrap items-center gap-3 [animation-delay:240ms]">
        <Link
          href="/kitaplar"
          className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgba(13,148,136,0.55)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_-12px_rgba(13,148,136,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]"
        >
          Kataloğu aç
        </Link>
        <a
          href="#one-cikan"
          className="inline-flex items-center justify-center rounded-full border border-[var(--stroke-strong)] bg-[var(--surface)] px-6 py-3.5 text-sm font-medium text-[var(--ink)] shadow-sm transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]"
        >
          Öne çıkanlar
        </a>
      </div>
    </div>
  );
}
