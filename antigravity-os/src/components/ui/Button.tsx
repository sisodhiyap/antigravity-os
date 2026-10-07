"use client";

import React from "react";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "outline" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", loading, icon, iconRight, fullWidth, children, className, disabled, ...props },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-widest transition-all duration-200 cursor-pointer border select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ag-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ag-bg)] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none";

    const variantKey = variant === "secondary" ? "ghost" : (variant ?? "primary");
    const variants = {
      primary:
        "bg-[var(--ag-gold)] text-[#0B0B0A] border-[var(--ag-gold)] hover:bg-[var(--ag-gold-bright)] hover:shadow-[0_0_24px_-6px_rgba(201,162,39,0.5)] hover:-translate-y-px active:translate-y-0",
      ghost:
        "bg-transparent text-[var(--ag-text-sec)] border-[var(--ag-border)] hover:text-[var(--ag-text)] hover:border-[var(--ag-gold-soft)] hover:bg-[var(--ag-gold-alpha)]",
      danger:
        "bg-transparent text-[var(--ag-error)] border-[rgba(217,108,108,0.3)] hover:bg-[var(--ag-error-bg)] hover:border-[var(--ag-error)]",
      outline:
        "bg-transparent text-[var(--ag-gold)] border-[var(--ag-gold)] hover:bg-[var(--ag-gold-alpha)] hover:shadow-[var(--ag-shadow-gold)]",
    };

    const sizes = {
      sm: "text-[10px] px-3 py-1.5 rounded-md gap-1.5",
      md: "text-[11px] px-4 py-2.5 rounded-lg",
      lg: "text-[12px] px-6 py-3 rounded-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(base, variants[variantKey as keyof typeof variants], sizes[size], fullWidth && "w-full", className)}
        {...props}
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
        {children}
        {!loading && iconRight}
      </button>
    );
  }
);
Button.displayName = "Button";
