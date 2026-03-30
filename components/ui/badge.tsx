import { clsx } from "clsx";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-ink/20 bg-ink/5 text-ink/70",
  success: "border-moss/40 bg-moss/10 text-moss",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-700",
  error: "border-rust/40 bg-rust/10 text-rust",
  info: "border-blue-500/40 bg-blue-100 text-blue-700",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
