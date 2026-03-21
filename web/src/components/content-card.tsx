interface ContentCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  accent?: boolean;
}

export function ContentCard({ title, children, icon, accent = false }: ContentCardProps) {
  return (
    <section
      aria-labelledby={`card-${title.replace(/\s+/g, "-").toLowerCase()}`}
      style={{
        background: accent ? "linear-gradient(135deg, var(--surface-2) 0%, var(--surface-3) 100%)" : "var(--surface)",
        border: `1px solid ${accent ? "var(--border-2)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "clamp(24px, 4vw, 36px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {accent && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, #ffffff, rgba(255,255,255,0.3), transparent)",
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
          marginBottom: "16px",
        }}
      >
        {icon && (
          <div
            aria-hidden="true"
            style={{
              flexShrink: 0,
              width: "40px",
              height: "40px",
              borderRadius: "10px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#d0d0d0",
              fontSize: "1.1rem",
            }}
          >
            {icon}
          </div>
        )}
        <h2
          id={`card-${title.replace(/\s+/g, "-").toLowerCase()}`}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.25rem",
            fontWeight: "700",
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            lineHeight: "1.3",
          }}
        >
          {title}
        </h2>
      </div>

      <div
        style={{
          fontSize: "0.9rem",
          color: "var(--ink-2)",
          lineHeight: "1.75",
        }}
      >
        {children}
      </div>
    </section>
  );
}
