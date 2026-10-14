"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Cpu,
  Presentation,
  FolderGit2,
  Clapperboard,
  Network,
  Zap,
  Users,
  Factory,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Boxes,
  Brain,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { clsx } from "clsx";

const SOVEREIGN_NAV = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Intelligence", href: "/intelligence", icon: Brain },
  { label: "AI Studio", href: "/ai", icon: Sparkles },
  { label: "ComfyUI", href: "/creative", icon: Boxes },
  { label: "Presenter X", href: "/presentx", icon: Presentation },
  { label: "Projects", href: "/projects", icon: FolderGit2 },
  { label: "Media Library", href: "/media", icon: Clapperboard },
  { label: "AI Router", href: "/desktop", icon: Network },
  { label: "Integrations", href: "/mcp", icon: Zap },
  { label: "Automation", href: "/agents", icon: Users },
  { label: "Workflows", href: "/factory", icon: Factory },
  { label: "Analytics", href: "/certification", icon: Activity },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useSystemStore();
  const collapsed = isSidebarCollapsed;

  return (
    <aside
      className={clsx(
        "h-full hidden lg:flex flex-col z-20 select-none transition-all duration-200 border-r border-[rgba(245,196,81,0.14)] bg-[#050505] relative overflow-hidden shrink-0",
        collapsed ? "w-[68px]" : "w-[210px]"
      )}
      style={{
        backgroundImage: "url('/assets/sovereign-sidebar-atmosphere.webp')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom center",
        backgroundSize: "cover",
      }}
    >
      {/* ── Dark Atmospheric Gradients for High Readability ──────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/88 to-transparent pointer-events-none" style={{ height: "65%" }} />
      <div className="absolute inset-0 bg-[#050505]/60 pointer-events-none" />

      {/* ── Collapse/Expand Button (Floating subtle toggle) ──────── */}
      <div className="relative z-10 flex items-center justify-end px-2 pt-2">
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md text-[#827C70] hover:text-[#F7F5EF] hover:bg-[#17140D] transition-colors"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* ── Main Navigation List (Starting at the top) ────────────── */}
      <nav className="relative z-10 flex-1 overflow-y-auto px-2.5 py-1 space-y-1" aria-label="Sovereign navigation">
        {SOVEREIGN_NAV.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-150 select-none group",
                collapsed && "justify-center px-0 py-2.5",
                active
                  ? "bg-[#F5C451] text-[#050505] font-bold shadow-[0_0_16px_rgba(245,196,81,0.35)]"
                  : "text-[#B8B2A5] hover:text-[#F7F5EF] hover:bg-[#17140D]/75 hover:border hover:border-[rgba(245,196,81,0.18)]"
              )}
            >
              <Icon
                className={clsx(
                  "w-4 h-4 shrink-0 transition-colors",
                  active ? "text-[#050505]" : "text-[#B8B2A5] group-hover:text-[#F5C451]"
                )}
                aria-hidden="true"
              />
              {!collapsed && (
                <span className={clsx("truncate text-[12px]", active ? "font-bold text-[#050505]" : "font-normal")}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom Sovereign Brand Emblem & Version ──────────────── */}
      <div className="relative z-10 shrink-0 px-3 py-4 text-center border-t border-[rgba(245,196,81,0.12)] bg-[#050505]/75 backdrop-blur-sm">
        {!collapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-[#F5C451] drop-shadow-[0_0_10px_rgba(245,196,81,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 22h20L12 2z" />
                <path d="M12 8l-5 10h10l-5-10z" />
              </svg>
            </div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-[#F7F5EF] uppercase font-satoshi">
              ANTIGRAVITY OS
            </div>
            <div className="text-[9px] font-mono text-[#827C70]">
              v2.1.1
            </div>
          </div>
        ) : (
          <div className="w-7 h-7 mx-auto flex items-center justify-center">
            <svg className="w-5 h-5 text-[#F5C451]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 22h20L12 2z" />
            </svg>
          </div>
        )}
      </div>
    </aside>
  );
};
