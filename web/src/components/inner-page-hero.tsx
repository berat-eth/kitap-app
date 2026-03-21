interface InnerPageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function InnerPageHero({ eyebrow, title, description }: InnerPageHeroProps) {
  return (
    <header
      style={{
        paddingTop: "clamp(48px, 8vw, 80px)",
        paddingBottom: "clamp(32px, 5vw, 56px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "200px",
          background: "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(240,168,50,0.06) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative" }}>
        {eyebrow && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <span className="gold-line" aria-hidden="true" />
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: "600",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#d0d0d0",
                fontFamily: "var(--font-body)",
              }}
            >
              {eyebrow}
            </span>
          </div>
        )}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: "900",
            lineHeight: "1.1",
            letterSpacing: "-0.03em",
            color: "var(--ink)",
            marginBottom: description ? "16px" : 0,
            maxWidth: "700px",
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.15rem)",
              color: "var(--ink-2)",
              lineHeight: "1.7",
              maxWidth: "560px",
            }}
          >
            {description}
          </p>
        )}
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent, var(--border-2), transparent)",
        }}
      />
    </header>
  );
}
