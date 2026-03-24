type ScorePillProps = {
  label: string;
  value: number;
};

export function ScorePill({ label, value }: ScorePillProps) {
  const state = value >= 75 ? "stark" : value >= 50 ? "mittel" : "kritisch";
  const color = value >= 75 ? "bg-moss/20 text-moss" : value >= 50 ? "bg-amber-500/20 text-amber-700" : "bg-rust/20 text-rust";

  return (
    <div className="rounded-xl border border-ink/10 bg-white/70 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wider text-ink/70">{label}</p>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${color}`}>{state}</span>
      </div>
      <p className="mt-2 text-2xl font-heading text-ink">{value}%</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-moss" style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}
