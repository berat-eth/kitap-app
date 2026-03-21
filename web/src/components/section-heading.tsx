type Props = { id?: string; eyebrow?: string; title: string; description?: string };

export function SectionHeading({ id, eyebrow, title, description }: Props) {
  return (
    <div id={id} className="mb-12 max-w-2xl scroll-mt-28">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[var(--ink-bright)] md:text-[2.15rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">{description}</p>
      ) : null}
    </div>
  );
}
