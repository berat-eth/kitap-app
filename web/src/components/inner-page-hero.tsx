type Props = {
  title: string;
  description?: string;
};

export function InnerPageHero({ title, description }: Props) {
  return (
    <header className="mb-12 max-w-3xl">
      <h1 className="font-display text-[clamp(1.85rem,4vw,2.75rem)] font-semibold leading-tight tracking-tight text-[var(--ink-bright)]">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">{description}</p>
      ) : null}
    </header>
  );
}
