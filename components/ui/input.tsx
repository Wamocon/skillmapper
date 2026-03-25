import { clsx } from "clsx";
import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from "react";

// ─── Text Input ────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-ink/80">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          "w-full rounded-xl border bg-white px-3 py-2 text-sm transition",
          "focus:outline-none focus:ring-2 focus:ring-moss/40",
          error ? "border-rust/60" : "border-ink/20",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-rust">{error}</p>}
    </div>
  );
}

// ─── Textarea ──────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-semibold text-ink/80">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={clsx(
          "w-full rounded-xl border bg-white px-3 py-2 text-sm transition",
          "focus:outline-none focus:ring-2 focus:ring-moss/40",
          error ? "border-rust/60" : "border-ink/20",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-rust">{error}</p>}
    </div>
  );
}

// ─── Select ────────────────────────────────────────────────────────────────

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-ink/80">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          "w-full rounded-xl border bg-white px-3 py-2 text-sm transition",
          "focus:outline-none focus:ring-2 focus:ring-moss/40",
          error ? "border-rust/60" : "border-ink/20",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rust">{error}</p>}
    </div>
  );
}

// ─── Checkbox ──────────────────────────────────────────────────────────────

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  error?: string;
}

export function Checkbox({ label, error, className, id, ...props }: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? `checkbox-${generatedId}`;
  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id={checkboxId}
          className={clsx("mt-1 h-4 w-4 rounded border-ink/30 text-moss focus:ring-moss/40", className)}
          {...props}
        />
        <label htmlFor={checkboxId} className="text-sm text-ink/80">
          {label}
        </label>
      </div>
      {error && <p className="text-xs text-rust">{error}</p>}
    </div>
  );
}
