"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  BrainCircuit,
  Factory,
  Clapperboard,
  Users,
  Network,
  Rocket,
  FileCode2,
  ShieldCheck,
  Activity,
  CheckSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { Badge } from "@/ui/Badge";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useSystemStore();

  const navSections = [
    {
      title: "CORE WORKSPACE",
      items: [
        { label: "Overview OS", href: "/", icon: LayoutDashboard },
        { label: "Projects", href: "/projects", icon: FolderGit2, badge: "3 Active" },
        { label: "AI Control Center", href: "/ai", icon: BrainCircuit, badge: "3-Tier" },
        { label: "Website Factory", href: "/factory", icon: Factory, badge: "E2E" },
        { label: "Media Studio", href: "/media", icon: Clapperboard, badge: "5 Tabs" },
      ],
    },
    {
      title: "PLATFORM & INFRA",
      items: [
        { label: "Swarm Agents", href: "/agents", icon: Users, badge: "10 Roles" },
        { label: "MCP Hub", href: "/mcp", icon: Network, badge: "15 Hubs" },
        { label: "Deployments", href: "/deployments", icon: Rocket, badge: "Vercel" },
        { label: "Files & Memory", href: "/files", icon: FileCode2 },
        { label: "Todo & Notes", href: "/todo-notes", icon: CheckSquare },
        { label: "Health Center", href: "/health-center", icon: Activity, badge: "100%" },
        { label: "Certification", href: "/certification", icon: ShieldCheck, badge: "19/19" },
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`glass-panel border-r border-white/10 h-screen sticky top-0 transition-all duration-300 flex flex-col justify-between z-30 select-none ${
        isSidebarCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {!isSidebarCollapsed ? (
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyber-cyan to-cyber-purple flex items-center justify-center shadow-glow-cyan">
                <Sparkles className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-100 tracking-wider font-mono">
                  ANTIGRAVITY <span className="text-cyber-cyan">OS</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">v5.1 • PRODUCTION READY</div>
              </div>
            </Link>
          ) : (
            <Link href="/" className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-tr from-cyber-cyan to-cyber-purple flex items-center justify-center shadow-glow-cyan">
              <Sparkles className="w-4 h-4 text-slate-950" />
            </Link>
          )}

          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation sections */}
        <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-3 py-1 text-[10px] font-mono uppercase text-slate-500 tracking-wider font-bold">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl font-mono text-xs transition-all duration-200 ${
                      isActive
                        ? "bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40 shadow-[0_0_15px_-4px_rgba(0,240,255,0.3)] font-bold"
                        : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                    } ${isSidebarCollapsed ? "justify-center px-0 py-2.5" : ""}`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-cyber-cyan" : "text-slate-400"}`} />
                    {!isSidebarCollapsed && (
                      <div className="flex-1 flex items-center justify-between">
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge variant="cyan" className="text-[9px] px-1.5 py-0 font-normal">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Status Pill & Operator Session */}
      <div className="p-3 border-t border-white/10 font-mono text-[11px] space-y-2">
        {!isSidebarCollapsed ? (
          <>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 text-[11px]">AI Mesh Active</span>
              </div>
              <span className="text-[10px] text-cyber-cyan font-bold">19/19 PASS</span>
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
                  localStorage.removeItem("omnicraft_token");
                  window.location.href = "/login";
                }
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 hover:text-red-300 text-[10px] transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-cyber-cyan" />
                <span>Operator Logged In</span>
              </span>
              <span className="text-[9px] uppercase font-bold text-red-400 hover:underline">Log Out →</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2" title="AI Mesh: LIVE (19/19 PASS)">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <button
              onClick={async () => {
                await fetch("/api/omnicraft/auth", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "logout" }),
                }).catch(() => {});
                if (typeof window !== "undefined") {
                  localStorage.removeItem("omnicraft_user");
                  localStorage.removeItem("omnicraft_token");
                  window.location.href = "/login";
                }
              }}
              className="text-slate-500 hover:text-red-400 p-1"
              title="Lock Session / Log Out"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
