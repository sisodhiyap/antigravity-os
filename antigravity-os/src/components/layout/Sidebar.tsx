"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Terminal,
  BrainCircuit,
  Users,
  Network,
  Factory,
  Clapperboard,
  FolderGit2,
  Activity,
  ShieldCheck,
  Settings,
  Presentation,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Lock,
  Zap,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { clsx } from "clsx";

const MISSION_NAV = [
  {
    section: "COMMAND",
    items: [
      { label: "Mission Control", href: "/", icon: LayoutDashboard },
      { label: "V7 Desktop Hub", href: "/desktop", icon: Cpu },
      { label: "Command Center", href: "/terminal", icon: Terminal },
    ],
  },
  {
    section: "INTELLIGENCE",
    items: [
      { label: "Hermes Agent", href: "/hermes", icon: BrainCircuit },
      { label: "AI Control", href: "/ai", icon: BrainCircuit },
      { label: "Agents", href: "/agents", icon: Users },
      { label: "MCP Hub", href: "/mcp", icon: Network },
    ],
  },
  {
    section: "CREATION",
    items: [
      { label: "Project Basket", href: "/basket", icon: FolderGit2 },
      { label: "PresentX Studio", href: "/presentx", icon: Presentation },
      { label: "Website Factory", href: "/factory", icon: Factory },
      { label: "Media Studio", href: "/media", icon: Clapperboard },
      { label: "Projects", href: "/projects", icon: FolderGit2 },
    ],
  },
  {
    section: "SYSTEM & CONTROL",
    items: [
      { label: "Profile", href: "/profile", icon: Users },
      { label: "Privacy Center", href: "/privacy", icon: Lock },
      { label: "Security Center", href: "/security", icon: ShieldCheck },
      { label: "Health Center", href: "/health-center", icon: Activity },
      { label: "Certification", href: "/certification", icon: ShieldCheck },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useSystemStore();
  const collapsed = isSidebarCollapsed;

  return (
    <aside
      className={clsx(
        "h-screen sticky top-0 hidden lg:flex flex-col z-30 select-none transition-all duration-250 border-r border-[var(--ag-border)] bg-[var(--ag-bg-deep)]",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* ── Brand & Mission Control Header ───────────────────────── */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--ag-border)] shrink-0">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
            <div className="w-8 h-8 rounded-xl bg-[var(--ag-gold-alpha)] border border-[var(--ag-gold)]/30 flex items-center justify-center shrink-0 shadow-[var(--ag-shadow-gold)] group-hover:border-[var(--ag-gold)] transition-colors">
              <Cpu className="w-4 h-4 text-[var(--ag-gold)]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold tracking-widest text-[var(--ag-text)] uppercase truncate font-satoshi">
                ANTIGRAVITY <span className="text-[var(--ag-gold)]">OS</span>
              </div>
              <div className="text-[9px] text-[var(--ag-gold)] flex items-center gap-1.5 font-mono tracking-wider font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ag-success)] animate-[status-pulse_2s_ease-in-out_infinite]" />
                SYSTEM ONLINE
              </div>
            </div>
          </Link>
        ) : (
          <Link
            href="/"
            className="w-8 h-8 mx-auto rounded-xl bg-[var(--ag-gold-alpha)] border border-[var(--ag-gold)]/30 flex items-center justify-center"
            aria-label="Antigravity OS Mission Control"
          >
            <Cpu className="w-4 h-4 text-[var(--ag-gold)]" aria-hidden="true" />
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className={clsx(
            "p-1.5 rounded-lg text-[var(--ag-muted)] hover:text-[var(--ag-text)] hover:bg-[var(--ag-elevated)] transition-colors",
            collapsed && "ml-auto"
          )}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ── Main Navigation ───────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4" aria-label="Mission navigation">
        {MISSION_NAV.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <div className="px-2.5 mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--ag-muted)]">
                {group.section}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
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
                      "mc-nav-item",
                      collapsed && "justify-center px-0 py-2.5",
                      active && "active"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "w-4 h-4 shrink-0 transition-colors",
                        active ? "text-[var(--ag-gold)]" : "text-[var(--ag-muted)]"
                      )}
                      aria-hidden="true"
                    />
                    {!collapsed && (
                      <span className={clsx("truncate", active && "font-semibold text-[var(--ag-text)]")}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Compute Telemetry Deck ────────────────────────────────── */}
      {!collapsed && (
        <div className="shrink-0 px-3 py-2.5 mx-2 mb-2 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-1.5 text-[10px] font-mono">
          <div className="flex items-center justify-between text-[var(--ag-muted)] text-[9px] font-bold uppercase tracking-wider">
            <span>COMPUTE</span>
            <span className="text-[var(--ag-success)]">ACTIVE</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--ag-muted)]">OLLAMA</span>
            <span className="text-[var(--ag-success)] font-bold">ONLINE</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--ag-muted)]">AIRLLM</span>
            <span className="text-[var(--ag-gold)] font-bold">STANDBY</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--ag-muted)]">CLOUD</span>
            <span className="text-[var(--ag-info)] font-bold">READY</span>
          </div>
          <div className="pt-1 border-t border-[var(--ag-border-subtle)] flex justify-between text-[9px] text-[var(--ag-muted)]">
            <span>GPU: 4.2/6 GB</span>
            <span>RAM: LIVE</span>
          </div>
        </div>
      )}

      {/* ── User Session Footer ───────────────────────────────────── */}
      <div className="shrink-0 px-2 pb-3 pt-2 border-t border-[var(--ag-border)]">
        <div className={clsx("flex items-center justify-between px-2 py-1", collapsed && "justify-center px-0")}>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-[var(--ag-text)] truncate font-satoshi">Operator</p>
              <p className="text-[9px] text-[var(--ag-gold)] truncate font-mono">Authenticated</p>
            </div>
          )}
          <button
            onClick={async () => {
              await fetch("/api/omnicraft/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "logout" }),
              }).catch(() => {});
              if (typeof window !== "undefined") {
                localStorage.removeItem("omnicraft_user");
                window.location.href = "/login";
              }
            }}
            title="Sign Out"
            className="p-1.5 rounded-lg text-[var(--ag-muted)] hover:text-[var(--ag-error)] hover:bg-[var(--ag-error-bg)] transition-colors"
            aria-label="Sign out"
          >
            <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
};

