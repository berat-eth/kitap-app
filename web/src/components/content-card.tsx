type Props = {
  title: string;
  children: React.ReactNode;
  id?: string;
};

export function ContentCard({ title, children, id }: Props) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-2xl border border-[var(--stroke)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] md:p-8"
    >
      <h2 className="font-display text-xl font-semibold text-[var(--ink-bright)] md:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[var(--ink)] leading-relaxed [&_li]:text-[var(--ink)] [&_strong]:font-semibold [&_strong]:text-[var(--ink-bright)] [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
