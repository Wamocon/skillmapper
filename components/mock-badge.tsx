export function MockBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-rust/40 bg-rust/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rust ${className}`}
    >
      Mock
    </span>
  );
}
