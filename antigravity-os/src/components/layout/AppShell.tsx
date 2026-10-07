"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPalette } from "@/components/layout/CommandPalette";

/** Wraps authenticated workspace pages with sidebar, mobile nav, header, and command palette */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--ag-bg)] ag-grid-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-3 sm:p-5 pb-24 lg:pb-5 max-w-[1680px] w-full mx-auto space-y-5 animate-[fade-in_0.3s_ease-out]"
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
