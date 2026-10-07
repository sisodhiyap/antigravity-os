"use client";

import React from "react";
import { clsx } from "clsx";

// ── StatusBadge ────────────────────────────────────────────────────
type StatusBadgeVariant = "online" | "offline" | "degraded" | "ready" | "simulation" | "info" | "gold";

interface StatusBadgeProps {
  variant?: StatusBadgeVariant;
  label: string;
  pulse?: boolean;
  className?: string;
}

const STATUS_COLORS: Record<StatusBadgeVariant, { dot: string; text: string; bg: string }> = {
  online:     { dot: "bg-[var(--ag-success)]",  text: "text-[var(--ag-success)]",  bg: "bg-[var(--ag-success-bg)] border-[var(--ag-success)]/20" },
  offline:    { dot: "bg-[var(--ag-error)]",    text: "text-[var(--ag-error)]",    bg: "bg-[var(--ag-error-bg)] border-[var(--ag-error)]/20" },
  degraded:   { dot: "bg-[var(--ag-warning)]",  text: "text-[var(--ag-warning)]",  bg: "bg-[var(--ag-warning-bg)] border-[var(--ag-warning)]/20" },
  ready:      { dot: "bg-[var(--ag-info)]",     text: "text-[var(--ag-info)]",     bg: "bg-[rgba(122,171,207,0.1)] border-[var(--ag-info)]/20" },
  simulation: { dot: "bg-[var(--ag-muted)]",    text: "text-[var(--ag-muted)]",    bg: "bg-[var(--ag-elevated)] border-[var(--ag-border)]" },
  info:       { dot: "bg-[var(--ag-info)]",     text: "text-[var(--ag-info)]",     bg: "bg-[rgba(122,171,207,0.1)] border-[var(--ag-info)]/20" },
  gold:       { dot: "bg-[var(--ag-gold)]",     text: "text-[var(--ag-gold)]",     bg: "bg-[var(--ag-gold-alpha)] border-[var(--ag-gold)]/20" },
};

export function StatusBadge({ variant = "info", label, pulse, className }: StatusBadgeProps) {
  const c = STATUS_COLORS[variant];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border",
        c.bg,
        c.text,
        className
      )}
    >
      <span
        className={clsx("w-1.5 h-1.5 rounded-full shrink-0", c.dot, pulse && "animate-[status-pulse_2s_ease-in-out_infinite]")}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

// ── MetricCard ─────────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  trend?: "up" | "down" | "flat";
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ label, value, unit, sub, icon, className }: MetricCardProps) {
  return (
    <div
      className={clsx(
        "ag-card p-4 space-y-2",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--ag-muted)]">
          {label}
        </span>
        {icon && <span className="text-[var(--ag-gold)] opacity-70">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[var(--ag-text)] font-satoshi tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-[11px] text-[var(--ag-text-sec)] font-medium">{unit}</span>
        )}
      </div>
      {sub && <p className="text-[11px] text-[var(--ag-muted)]">{sub}</p>}
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  gold?: boolean;
  role?: string;
  "aria-label"?: string;
}

export function Card({ children, className, elevated, gold, ...rest }: CardProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "ag-card",
        elevated && "bg-[var(--ag-elevated)] shadow-[var(--ag-shadow-md)]",
        gold && "border-[var(--ag-gold)]/20 bg-[var(--ag-gold-alpha)]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}


// ── ThemeToggle ────────────────────────────────────────────────────
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const options: { value: "dark" | "light" | "system"; icon: React.ReactNode; label: string }[] = [
    { value: "dark",   icon: <Moon className="w-3 h-3" />,    label: "Dark" },
    { value: "light",  icon: <Sun className="w-3 h-3" />,     label: "Light" },
    { value: "system", icon: <Monitor className="w-3 h-3" />, label: "System" },
  ];

  return (
    <div
      className={clsx(
        "flex items-center gap-0.5 p-0.5 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)]",
        className
      )}
      role="group"
      aria-label="Theme selection"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          title={opt.label}
          aria-pressed={theme === opt.value}
          className={clsx(
            "flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150",
            theme === opt.value
              ? "bg-[var(--ag-gold)] text-[#0B0B0A] shadow-sm"
              : "text-[var(--ag-muted)] hover:text-[var(--ag-text-sec)]"
          )}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}

// ── Toast (minimal) ────────────────────────────────────────────────
interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  onClose?: () => void;
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
  const colors = {
    success: "border-[var(--ag-success)]/30 text-[var(--ag-success)] bg-[var(--ag-success-bg)]",
    error:   "border-[var(--ag-error)]/30 text-[var(--ag-error)] bg-[var(--ag-error-bg)]",
    warning: "border-[var(--ag-warning)]/30 text-[var(--ag-warning)] bg-[var(--ag-warning-bg)]",
    info:    "border-[var(--ag-border)] text-[var(--ag-text-sec)] bg-[var(--ag-surface)]",
  };

  return (
    <div
      role="alert"
      className={clsx(
        "flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-sm animate-[slide-up_0.3s_ease-out]",
        colors[type]
      )}
    >
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity" aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
}

// ── Tooltip ────────────────────────────────────────────────────────
export function Tooltip({ children, tip }: { children: React.ReactNode; tip: string }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-md bg-[var(--ag-elevated)] border border-[var(--ag-border)] text-[11px] text-[var(--ag-text-sec)] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-[var(--ag-shadow-md)]">
        {tip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[var(--ag-border)]" />
      </div>
    </div>
  );
}
