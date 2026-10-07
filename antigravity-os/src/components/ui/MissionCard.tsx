"use client";

import React, { useRef, useCallback } from "react";
import { clsx } from "clsx";
import { Loader2, AlertTriangle } from "lucide-react";

export interface MissionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  status?: string | React.ReactNode;
  selected?: boolean;
  interactive?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
  glowColor?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
}

export const MissionCard = React.forwardRef<HTMLDivElement, MissionCardProps>(
  (
    {
      title,
      description,
      icon,
      status,
      selected = false,
      interactive = true,
      disabled = false,
      loading = false,
      error = null,
      glowColor,
      headerAction,
      footer,
      className,
      children,
      onClick,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const cardRef = useRef<HTMLDivElement>(null);

    // Track mouse position for the living radial glow
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty("--mouse-x", `${x}px`);
      el.style.setProperty("--mouse-y", `${y}px`);
    }, []);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (interactive && !disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.(e as any);
        }
        onKeyDown?.(e);
      },
      [interactive, disabled, onClick, onKeyDown]
    );

    return (
      <div
        ref={(node) => {
          (cardRef as any).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as any).current = node;
        }}
        onMouseMove={interactive && !disabled ? handleMouseMove : undefined}
        onClick={!disabled && !loading ? onClick : undefined}
        onKeyDown={handleKeyDown}
        tabIndex={interactive && !disabled ? 0 : undefined}
        role={interactive ? "button" : undefined}
        aria-disabled={disabled || loading}
        aria-selected={selected}
        className={clsx(
          "mission-card p-4 sm:p-5 flex flex-col",
          interactive && "cursor-pointer select-none",
          selected && "selected",
          disabled && "opacity-50 pointer-events-none",
          loading && "opacity-80 pointer-events-none",
          className
        )}
        {...props}
      >
        {/* Header Section */}
        {(title || icon || status || headerAction) && (
          <div className="flex items-start justify-between gap-3 mb-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {icon && (
                <div className="w-8 h-8 rounded-lg bg-[var(--ag-gold-alpha)] border border-[var(--ag-gold)]/20 flex items-center justify-center shrink-0 text-[var(--ag-gold)]">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h3 className="text-[13px] font-bold text-[var(--ag-text)] truncate font-satoshi tracking-tight">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-[11px] text-[var(--ag-text-sec)] truncate mt-0.5">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {loading && <Loader2 className="w-3.5 h-3.5 text-[var(--ag-gold)] animate-spin" />}
              {status && (
                typeof status === "string" ? (
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-[var(--ag-border)] bg-[var(--ag-elevated)] text-[var(--ag-muted)]">
                    {status}
                  </span>
                ) : (
                  status
                )
              )}
              {headerAction}
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-3 p-2.5 rounded-lg bg-[var(--ag-error-bg)] border border-[var(--ag-error)]/25 text-[var(--ag-error)] text-xs flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* Main Card Body */}
        {children && <div className="flex-1 min-w-0">{children}</div>}

        {/* Optional Footer */}
        {footer && <div className="mt-4 pt-3 border-t border-[var(--ag-border-subtle)] shrink-0">{footer}</div>}
      </div>
    );
  }
);

MissionCard.displayName = "MissionCard";
