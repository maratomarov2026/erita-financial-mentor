import type { ReactNode } from "react";
import clsx from "clsx";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-xl2 bg-paper shadow-soft p-5", className)}>{children}</div>
  );
}

export function SectionTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-warmbrown">{children}</h2>
      {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const base = "rounded-full px-5 py-3 font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-terracotta text-white hover:bg-terracotta-dark",
    secondary: "bg-sage-light text-sage-dark hover:bg-sage/40",
    ghost: "bg-transparent text-warmbrown hover:bg-blush/60",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(base, variants[variant], className)}
    >
      {children}
    </button>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "warning";
}) {
  const toneClass =
    tone === "positive" ? "text-sage-dark" : tone === "warning" ? "text-terracotta-dark" : "text-warmbrown";
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted font-semibold">{label}</span>
      <span className={clsx("text-2xl font-extrabold", toneClass)}>{value}</span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </Card>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="w-full h-3 bg-blush/60 rounded-full overflow-hidden">
      <div className="h-full bg-sage rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Chip({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-full px-4 py-2 text-sm font-semibold border transition-colors",
        active
          ? "bg-terracotta text-white border-terracotta"
          : "bg-paper text-warmbrown border-blush hover:border-terracotta-light",
      )}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  suffix,
  className,
}: {
  label?: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <label className={clsx("block min-w-0", className)}>
      {label && <span className="block text-sm font-semibold text-warmbrown mb-1 truncate">{label}</span>}
      <div className="flex items-center rounded-xl2 border border-blush bg-paper px-3 py-3 focus-within:border-terracotta min-w-0">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent outline-none text-warmbrown"
        />
        {suffix && <span className="text-muted text-xs ml-1 whitespace-nowrap shrink-0">{suffix}</span>}
      </div>
    </label>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card className="text-center py-10">
      <p className="font-bold text-warmbrown mb-1">{title}</p>
      <p className="text-sm text-muted">{body}</p>
    </Card>
  );
}
