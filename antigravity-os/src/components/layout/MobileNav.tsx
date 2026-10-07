"use client";

import React, { useState, useEffect } from "react";
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
  X,
  Menu,
  Cpu,
  Lock,
  Radio,
  Search,
  ChevronRight,
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

const QUICK_BOTTOM_NAV = [
  { label: "Control", href: "/", icon: LayoutDashboard },
  { label: "Terminal", href: "/terminal", icon: Terminal },
  { label: "Hermes", href: "/hermes", icon: BrainCircuit },
  { label: "Factory", href: "/factory", icon: Factory },
];

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { setCommandPaletteOpen } = useSystemStore();

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* ── Mobile Slide-Over Drawer Overlay ─────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Slide-Over Drawer Content ────────────────────── */}
      <div
        className={clsx(
          "fixed top-0 left-0 bottom-0 w-[82vw] max-w-[320px] z-50 bg-[var(--ag-bg-deep)] border-r border-[var(--ag-border)] flex flex-col transition-transform duration-300 ease-out lg:hidden shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--ag-border)] shrink-0">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
            <div className="w-8 h-8 rounded-xl bg-[var(--ag-gold-alpha)] border border-[var(--ag-gold)]/30 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-[var(--ag-gold)]" />
            </div>
            <div>
              <div className="text-[12px] font-bold tracking-widest text-[var(--ag-text)] uppercase font-satoshi">
                ANTIGRAVITY <span className="text-[var(--ag-gold)]">OS</span>
              </div>
              <div className="text-[9px] text-[var(--ag-gold)] flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ag-success)] animate-pulse" />
                MOBILE CONSOLE
              </div>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-[var(--ag-muted)] hover:text-[var(--ag-text)] hover:bg-[var(--ag-elevated)] active:scale-95 transition-all"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Command Search Quick Button */}
        <div className="p-3 border-b border-[var(--ag-border)]">
          <button
            onClick={() => {
              setIsOpen(false);
              setCommandPaletteOpen(true);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] text-xs text-[var(--ag-muted)] hover:text-[var(--ag-text)] active:bg-[var(--ag-surface)] transition-colors min-h-[44px]"
          >
            <Search className="w-4 h-4 text-[var(--ag-gold)]" />
            <span className="font-mono text-[11px] truncate">Search commands & actions...</span>
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {MISSION_NAV.map((group) => (
            <div key={group.section}>
              <div className="px-2 mb-1 text-[9px] font-bold uppercase tracking-wider text-[var(--ag-muted)]">
                {group.section}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={clsx(
                        "flex items-center justify-between px-3 py-3 rounded-xl text-xs font-medium transition-all min-h-[44px]",
                        active
                          ? "bg-[var(--ag-gold-alpha)] text-[var(--ag-gold)] font-semibold border border-[var(--ag-gold)]/20"
                          : "text-[var(--ag-text-sec)] hover:bg-[var(--ag-elevated)] hover:text-[var(--ag-text)]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={clsx("w-4 h-4", active ? "text-[var(--ag-gold)]" : "text-[var(--ag-muted)]")} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Telemetry Summary in Mobile Drawer */}
        <div className="p-3 border-t border-[var(--ag-border)] bg-[var(--ag-elevated)]/50 text-[10px] font-mono space-y-1">
          <div className="flex justify-between text-[var(--ag-muted)]">
            <span>CORE STATUS</span>
            <span className="text-[var(--ag-success)] font-bold">V7.0 FROZEN</span>
          </div>
          <div className="flex justify-between text-[var(--ag-muted)]">
            <span>COMPUTE</span>
            <span className="text-[var(--ag-gold)]">LOCAL + CLOUD</span>
          </div>
        </div>

        {/* Footer Session */}
        <div className="p-3 border-t border-[var(--ag-border)] flex items-center justify-between">
          <div className="text-xs">
            <p className="font-bold text-[var(--ag-text)]">Operator</p>
            <p className="text-[10px] text-[var(--ag-gold)] font-mono">Authenticated</p>
          </div>
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
            className="px-3 py-2 rounded-xl text-xs text-[var(--ag-error)] hover:bg-[var(--ag-error-bg)] min-h-[44px] flex items-center gap-1.5"
            aria-label="Sign out"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* ── Bottom Navigation Bar for Mobile (Viewports < 1024px) ─── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--ag-bg-deep)]/95 backdrop-blur-xl border-t border-[var(--ag-border)] lg:hidden flex items-center justify-around px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl"
        role="navigation"
        aria-label="Mobile Bottom Bar"
      >
        {QUICK_BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[48px] rounded-xl transition-all",
                active
                  ? "text-[var(--ag-gold)] font-bold scale-105"
                  : "text-[var(--ag-muted)] hover:text-[var(--ag-text)]"
              )}
            >
              <Icon className={clsx("w-5 h-5 mb-0.5", active && "text-[var(--ag-gold)]")} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* Menu button to toggle full drawer */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[48px] rounded-xl text-[var(--ag-muted)] hover:text-[var(--ag-text)] active:scale-95 transition-all"
          aria-label="Open full menu"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Menu</span>
        </button>
      </nav>
    </>
  );
};
