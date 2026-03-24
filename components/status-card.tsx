type StatusCardProps = {
  title: string;
  value: string;
  detail: string;
  delay?: string;
};

export function StatusCard({ title, value, detail, delay = "0s" }: StatusCardProps) {
  return (
    <article
      className="animate-rise rounded-2xl border border-ink/10 bg-white/70 p-6 shadow-panel backdrop-blur"
      style={{ animationDelay: delay }}
    >
      <p className="text-sm font-semibold uppercase tracking-widest text-moss/70">{title}</p>
      <p className="mt-2 font-heading text-3xl text-ink">{value}</p>
      <p className="mt-3 text-sm text-ink/70">{detail}</p>
    </article>
  );
}
