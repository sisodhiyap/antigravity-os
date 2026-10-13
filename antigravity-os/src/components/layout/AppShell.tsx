"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPalette } from "@/components/layout/CommandPalette";

/**
 * Sovereign AppShell:
 * Top Header spans full viewport width across the top without horizontal overflow.
 * Left Sidebar sits underneath Header with atmospheric interstellar artwork.
 * Main content area has min-w-0 to prevent flex expansion and scrolls cleanly.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#050505] text-[#F7F5EF] select-none box-border">
      {/* ── Full-Width Top Header ────────────────────────────── */}
      <Header />

      {/* ── Body Container: Sidebar + Main Content ───────────── */}
      <div className="flex-1 flex min-h-0 min-w-0 w-full overflow-hidden">
        <Sidebar />
        <main
          id="main-content"
          className="flex-1 min-w-0 overflow-y-auto px-3 sm:px-5 lg:px-6 py-3.5 sm:py-4 pb-24 lg:pb-8 max-w-[1536px] w-full mx-auto animate-[fade-in_0.2s_ease-out] box-border"
          role="main"
          aria-label="Main content"
        >
          {children}
        </main>
      </div>

      <MobileNav />
      <CommandPalette />
    </div>
  );
}
