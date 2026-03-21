interface SectionHeadingProps {
  id?: string;
  titleId?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  id,
  titleId,
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      id={id}
      style={{
        textAlign: align,
        marginBottom: "clamp(32px, 5vw, 48px)",
      }}
    >
      {eyebrow && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
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
      <h2
        id={titleId}
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
          fontWeight: "700",
          color: "var(--ink)",
          lineHeight: "1.15",
          letterSpacing: "-0.025em",
          marginBottom: description ? "12px" : 0,
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          style={{
            fontSize: "1rem",
            color: "var(--ink-3)",
            lineHeight: "1.6",
            maxWidth: align === "center" ? "560px" : undefined,
            marginInline: align === "center" ? "auto" : undefined,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
