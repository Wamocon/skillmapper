import { clsx } from "clsx";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

export function Card({ children, className, padding = "md" }: CardProps) {
  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8 md:p-12",
  };

  return (
    <article
      className={clsx(
        "rounded-2xl border border-ink/10 bg-white/70 shadow-panel backdrop-blur",
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </article>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="font-heading text-3xl text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink/70">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
