"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell, Sun, Moon, ChevronDown, Sparkles } from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { ThemeToggle } from "@/components/ui/DesignSystem";

export const Header: React.FC = () => {
  const { setCommandPaletteOpen } = useSystemStore();
  const [userName, setUserName] = useState("Ps@3101");
  const [userRole, setUserRole] = useState("OWNER");

  // Read user session if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem("omnicraft_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.name || u?.email) {
          setUserName(u.name || u.email);
        }
      }
    } catch {}
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

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 py-2.5 border-b border-[rgba(245,196,81,0.12)] bg-[#050505]/95 backdrop-blur-xl w-full box-border"
      role="banner"
    >
      {/* ── Left — Sovereign Emblem & Brand ─────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5C451] drop-shadow-[0_0_8px_rgba(245,196,81,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 22h20L12 2z" />
              <path d="M12 8l-5 10h10l-5-10z" />
            </svg>
          </div>
          <div>
            <div className="text-xs sm:text-[13px] font-bold tracking-[0.15em] text-[#F7F5EF] uppercase font-satoshi flex items-center gap-1.5 leading-none">
              ANTIGRAVITY <span className="text-[#F5C451]">OS</span>
            </div>
            <div className="hidden sm:block text-[8px] font-mono tracking-[0.22em] text-[#8C6B27] uppercase font-medium pt-0.5">
              SOVEREIGN AI CREATIVE OPERATING SYSTEM
            </div>
          </div>
        </Link>
      </div>

      {/* ── Center — Responsive Sovereign Search Bar ────────────── */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex-1 min-w-0 max-w-xl mx-1 sm:mx-3 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 rounded-full bg-[#0D0C09] border border-[rgba(245,196,81,0.18)] hover:border-[rgba(245,196,81,0.4)] text-[12px] text-[#827C70] transition-all duration-200 hover:shadow-[0_0_16px_rgba(245,196,81,0.18)] group"
        aria-label="Search projects, tools, models, or actions (Ctrl+K)"
      >
        <Search className="w-3.5 h-3.5 text-[#F5C451] shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left truncate font-sans text-[#827C70] group-hover:text-[#B8B2A5] text-[11px] sm:text-[12px]">
          <span className="sm:hidden">Search...</span>
          <span className="hidden sm:inline">Search projects, tools, models, or actions...</span>
        </span>
        <kbd className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#17140D] border border-[rgba(245,196,81,0.2)] text-[10px] text-[#B8B2A5] font-mono shrink-0">
          Ctrl + K
        </kbd>
      </button>

      {/* ── Right — Notifications, ThemeToggle, Profile ──────────── */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Notifications */}
        <button
          className="p-1.5 rounded-lg text-[#827C70] hover:text-[#F5C451] hover:bg-[#17140D] transition-colors relative"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#F5C451]" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile */}
        <Link
          href="/profile"
          className="flex items-center gap-2 pl-1.5 sm:pl-2 pr-1.5 py-1 rounded-full bg-[#11100D] border border-[rgba(245,196,81,0.22)] hover:border-[#F5C451] transition-all group shrink-0"
          title="Account Menu"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#F5C451] to-[#8C6B27] p-[1.5px] shrink-0 shadow-[0_0_10px_rgba(245,196,81,0.3)]">
            <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center text-[10px] font-bold text-[#F5C451]">
              P
            </div>
          </div>
          <div className="hidden sm:block text-left pr-1">
            <div className="text-[11px] font-bold text-[#F7F5EF] leading-tight group-hover:text-[#F5C451] transition-colors truncate max-w-[80px]">
              {userName}
            </div>
            <div className="text-[8px] font-mono tracking-wider text-[#827C70] uppercase">
              {userRole}
            </div>
          </div>
          <ChevronDown className="hidden sm:block w-3 h-3 text-[#827C70] group-hover:text-[#F5C451] transition-colors" />
        </Link>
      </div>
    </header>
  );
};
