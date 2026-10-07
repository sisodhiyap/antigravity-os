"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Command, Bell, User, Radio, Cpu, Zap, Activity } from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { useLiveTelemetry } from "@/hooks/useLiveTelemetry";
import { ThemeToggle } from "@/components/ui/DesignSystem";
import { clsx } from "clsx";

export const Header: React.FC = () => {
  const { setCommandPaletteOpen, isLive, toggleLive } = useSystemStore();
  const { data: telemetry, isFetching } = useLiveTelemetry();
  const [time, setTime] = useState("");

  // Live clock
  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandPaletteOpen]);

  const gpuVram = telemetry?.gpu?.vramUsedMb
    ? `${(telemetry.gpu.vramUsedMb / 1024).toFixed(1)}GB`
    : "4.2GB";

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-[var(--ag-border)] bg-[var(--ag-bg-deep)]/90 backdrop-blur-xl"
      role="banner"
    >
      {/* ── Left — Title (Mobile & Tablet) ────────────────────────── */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--ag-gold-alpha)] border border-[var(--ag-gold)]/30 flex items-center justify-center">
            <Cpu className="w-3.5 h-3.5 text-[var(--ag-gold)]" />
          </div>
          <span className="text-[11px] font-bold tracking-widest text-[var(--ag-text)] uppercase font-satoshi">
            AGY <span className="text-[var(--ag-gold)]">OS</span>
          </span>
        </div>

        {/* System Online Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--ag-elevated)] border border-[var(--ag-border)] text-[10px] font-mono text-[var(--ag-muted)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--ag-success)] animate-[status-pulse_2s_ease-in-out_infinite]" />
          <span className="text-[var(--ag-text)] font-semibold">MISSION CONTROL</span>
        </div>
      </div>

      {/* ── Center — Universal Command Bar ────────────────────────── */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex-1 max-w-xl flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] text-[12px] text-[var(--ag-muted)] transition-all duration-180 hover:border-[var(--ag-gold)]/40 hover:text-[var(--ag-text-sec)] hover:shadow-[var(--ag-shadow-gold)] group"
        aria-label="Open command palette (Ctrl+K)"
      >
        <Search className="w-3.5 h-3.5 text-[var(--ag-muted)] group-hover:text-[var(--ag-gold)] transition-colors shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left truncate font-mono">
          What should I build, analyze, fix or deploy?
        </span>
        <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--ag-surface)] border border-[var(--ag-border)] text-[10px] text-[var(--ag-muted)] font-mono shrink-0">
          <Command className="w-2.5 h-2.5" aria-hidden="true" />
          K
        </kbd>
      </button>

      {/* ── Right — Telemetry & Actions ───────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick System Indicators (Desktop) */}
        <div className="hidden xl:flex items-center gap-3 px-3 py-1 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] text-[10px] font-mono text-[var(--ag-muted)]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--ag-success)]" />
            <span>AI: <strong className="text-[var(--ag-gold)]">AUTO</strong></span>
          </div>
          <div className="h-3 w-px bg-[var(--ag-border)]" />
          <div>
            <span>GPU: <strong className="text-[var(--ag-text)]">{gpuVram}</strong></span>
          </div>
          <div className="h-3 w-px bg-[var(--ag-border)]" />
          <div>
            <span>RAM: <strong className="text-[var(--ag-success)]">AVAIL</strong></span>
          </div>
        </div>

        {/* Live Stream Polling */}
        <button
          onClick={toggleLive}
          title={isLive ? "Pause live polling" : "Resume live polling"}
          aria-pressed={isLive}
          className={clsx(
            "hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-wider transition-all duration-150 border",
            isLive
              ? "border-[var(--ag-success)]/30 bg-[var(--ag-success-bg)] text-[var(--ag-success)]"
              : "border-[var(--ag-border)] bg-[var(--ag-elevated)] text-[var(--ag-muted)]"
          )}
        >
          <Radio
            className={clsx("w-3 h-3", isLive && isFetching && "animate-pulse")}
            aria-hidden="true"
          />
          <span className="hidden md:inline">{isLive ? "Live" : "Paused"}</span>
        </button>

        {/* Clock */}
        <div className="hidden lg:block text-[11px] font-mono text-[var(--ag-muted)] tabular-nums px-1.5">
          {time}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Avatar Link */}
        <Link
          href="/profile"
          className="w-8 h-8 rounded-xl bg-[var(--ag-gold-alpha)] border border-[var(--ag-gold)]/30 flex items-center justify-center text-[var(--ag-gold)] shadow-[var(--ag-shadow-gold)] font-bold text-xs font-mono hover:scale-105 hover:border-[var(--ag-gold)] transition-all cursor-pointer"
          title="Owner Profile"
        >
          OP
        </Link>
      </div>
    </header>
  );
};

