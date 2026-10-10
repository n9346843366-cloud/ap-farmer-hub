import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";

export function Card({ className, children, delay = 0 }: { className?: string; children: ReactNode; delay?: number }) {
  return (
    <section className={cn("glass card-lift animate-rise p-4", className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="eyebrow">{children}</p>
      {right}
    </div>
  );
}

export function DemoBadge({ label }: { label?: string }) {
  const { t } = useApp();
  return (
    <span className="rounded-md bg-accent/20 px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-accent-foreground">
      {label ?? t("demo")}
    </span>
  );
}

export function Notice({ tone = "warn", children }: { tone?: "warn" | "info" | "ok"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex gap-2 rounded-xl px-3 py-2.5 text-[13px] leading-snug",
        tone === "warn" && "bg-accent/15 text-accent-foreground",
        tone === "info" && "bg-info/10 text-foreground",
        tone === "ok" && "bg-primary/10 text-secondary-foreground",
      )}
    >
      <span>{tone === "warn" ? "⚠️" : tone === "ok" ? "✅" : "ℹ️"}</span>
      <div>{children}</div>
    </div>
  );
}

export function PageHeader({ title, sub, emoji, back = true }: { title: string; sub?: string; emoji?: string; back?: boolean }) {
  return (
    <div className="mb-4 animate-rise">
      {back && (
        <button onClick={() => history.back()} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
          ← <span>Back</span>
        </button>
      )}
      <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-balance">
        {emoji && <span className="mr-1.5">{emoji}</span>}
        {title}
      </h1>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Field({ label, optional, children, hint }: { label: string; optional?: boolean; children: ReactNode; hint?: string }) {
  const { t } = useApp();
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
        {label}
        {optional && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{t("optional")}</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl bg-card text-foreground caret-primary px-3.5 py-3 text-base ring-1 ring-input outline-none transition focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/70";

export function Btn({
  children, onClick, variant = "primary", className, type = "button", disabled,
}: { children: ReactNode; onClick?: () => void; variant?: "primary" | "soft" | "ghost" | "accent"; className?: string; type?: "button" | "submit"; disabled?: boolean }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-[15px] font-semibold transition active:scale-[0.98] disabled:opacity-50",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "soft" && "bg-secondary text-secondary-foreground",
        variant === "ghost" && "bg-surface-strong text-foreground ring-1 ring-border",
        variant === "accent" && "bg-accent text-accent-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Tile({ to, emoji, title, sub }: { to: string; emoji: string; title: string; sub: string }) {
  return (
    <Link to={to} className="glass card-lift block p-4 transition active:scale-[0.98]">
      <span className="text-2xl">{emoji}</span>
      <p className="mt-2 text-sm font-bold">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </Link>
  );
}

export function Empty({ emoji, title, children }: { emoji: string; title: string; children?: ReactNode }) {
  return (
    <div className="glass p-6 text-center">
      <p className="text-4xl">{emoji}</p>
      <p className="mt-2 font-bold">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function Chip({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-2 text-sm font-medium ring-1 transition",
        active ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-foreground ring-border",
      )}
    >
      {children}
    </button>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
    </div>
  );
}

export function useT() {
  const { lang } = useApp();
  return (en: string, te: string) => (lang === "te" ? te : en);
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl bg-background/60 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold leading-tight">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
