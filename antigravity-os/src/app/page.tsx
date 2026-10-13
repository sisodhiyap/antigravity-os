"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Sparkles,
  Presentation,
  FolderGit2,
  FolderPlus,
  Clapperboard,
  ArrowRight,
  Play,
  Server,
  Database,
  BarChart2,
  ChevronRight,
  Infinity,
  Boxes,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useLiveTelemetry } from "@/hooks/useLiveTelemetry";
import { useSystemStore } from "@/stores/useSystemStore";
import { clsx } from "clsx";

export default function SovereignDashboard() {
  const router = useRouter();
  const { data: telemetry } = useLiveTelemetry();
  const { telemetry: storeTelemetry } = useSystemStore();
  const t = telemetry || storeTelemetry;

  const [commandInput, setCommandInput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [userName, setUserName] = useState("Ps@3101");
  const [userRole, setUserRole] = useState("Sovereign Owner");
  const [comfyStatus, setComfyStatus] = useState<"Online" | "Ready" | "Standby" | "Offline">("Ready");
  const [aiRouterStatus, setAiRouterStatus] = useState<"Online" | "Degraded">("Online");

  // Read session profile
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

  // Honest runtime service status check
  useEffect(() => {
    async function checkRuntimeServices() {
      try {
        const [comfyRes, healthRes] = await Promise.all([
          fetch("/api/comfyui/status", { cache: "no-store" }).catch(() => null),
          fetch("/api/health", { cache: "no-store" }).catch(() => null),
        ]);

        if (comfyRes && comfyRes.ok) {
          const cData = await comfyRes.json();
          if (cData.state?.status === "RUNNING") {
            setComfyStatus("Online");
          } else if (cData.state?.status === "READY" || cData.discovery?.installed) {
            setComfyStatus("Ready");
          } else {
            setComfyStatus("Standby");
          }
        }

        if (healthRes && healthRes.ok) {
          const hData = await healthRes.json();
          if (hData.data?.status === "HEALTHY") {
            setAiRouterStatus("Online");
          } else {
            setAiRouterStatus("Degraded");
          }
        }
      } catch {
        // preserve standard default fallback
      }
    }
    checkRuntimeServices();
  }, []);

  async function handleCommand(e: React.FormEvent) {
    e.preventDefault();
    if (!commandInput.trim() || isExecuting) return;
    setIsExecuting(true);
    const query = commandInput.trim();

    try {
      const q = query.toLowerCase();
      if (q.includes("build") || q.includes("site") || q.includes("factory")) {
        router.push(`/factory?prompt=${encodeURIComponent(query)}`);
      } else if (q.includes("comfy") || q.includes("image") || q.includes("art")) {
        router.push(`/creative?tab=image&prompt=${encodeURIComponent(query)}`);
      } else if (q.includes("video") || q.includes("motion")) {
        router.push(`/creative?tab=video&prompt=${encodeURIComponent(query)}`);
      } else if (q.includes("presentation") || q.includes("deck") || q.includes("slide")) {
        router.push(`/presentx?prompt=${encodeURIComponent(query)}`);
      } else if (q.includes("project")) {
        router.push("/projects");
      } else if (q.includes("media") || q.includes("asset")) {
        router.push("/media");
      } else {
        router.push(`/ai?prompt=${encodeURIComponent(query)}`);
      }
    } finally {
      setCommandInput("");
      setIsExecuting(false);
    }
  }

  const storageUsed = t?.disks?.[0]?.usedGb ? Math.round(t.disks[0].usedGb) : 247;

  return (
    <AppShell>
      <div className="space-y-3.5 max-w-[1536px] w-full mx-auto pb-8 select-none font-sans box-border min-w-0">
        {/* ── 1. Welcome Hero & System Status ──────────────────────── */}
        <section aria-label="Sovereign Command Hero" className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-stretch w-full min-w-0">
          {/* Main Hero Banner (Col 1-8 on wide desktop / Full width on tablet & mobile) */}
          <div
            className="xl:col-span-8 relative rounded-2xl overflow-hidden border border-[rgba(245,196,81,0.18)] flex flex-col justify-between p-4 sm:p-5 bg-[#050505] shadow-[0_4px_30px_rgba(0,0,0,0.8)] min-h-[180px] sm:min-h-[200px] w-full min-w-0 box-border"
            style={{
              backgroundImage: "url('/assets/sovereign-command-center-hero.webp')",
              backgroundSize: "cover",
              backgroundPosition: "left 28%",
            }}
          >
            {/* Dark directional gradient overlay for guaranteed text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/95 via-[#050505]/80 to-[#050505]/30 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/75 via-transparent to-transparent pointer-events-none" />

            {/* Foreground Content */}
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 w-full">
              <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
                {/* Gold Crest Insignia */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#17140D]/90 border border-[rgba(245,196,81,0.35)] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,196,81,0.3)]">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5C451]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 22h20L12 2z" />
                    <path d="M12 8l-5 10h10l-5-10z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] sm:text-xs text-[#B8B2A5] font-medium tracking-wide">
                    Welcome back,
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-[26px] font-bold text-[#F7F5EF] flex items-center gap-2 font-satoshi leading-tight truncate">
                    {userName}
                    <span className="text-[#F5C451] text-base sm:text-lg" title="Sovereign Crown">👑</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-[#F5C451] font-mono tracking-wider pt-0.5 font-semibold truncate">
                    {userRole} | Antigravity OS
                  </div>
                  <div className="text-[10px] sm:text-[11px] italic text-[#F7F5EF]/85 pt-1.5 sm:pt-2 line-clamp-2">
                    &ldquo;Ideas, Intelligence, Creation — All in Your Control.&rdquo;
                  </div>
                </div>
              </div>

              {/* Vertical Creation Keywords */}
              <div className="hidden md:flex flex-col items-end gap-1 text-[8.5px] font-mono font-bold tracking-[0.25em] text-[#B8B2A5]/70 shrink-0">
                <span className="hover:text-[#F5C451] transition-colors">CREATE</span>
                <span className="hover:text-[#F5C451] transition-colors">AUTOMATE</span>
                <span className="hover:text-[#F5C451] transition-colors">GENERATE</span>
                <span className="hover:text-[#F5C451] transition-colors">DEPLOY</span>
              </div>
            </div>
          </div>

          {/* System Status Panel (Col 9-12 on wide desktop / Full width on tablet & mobile) */}
          <div className="xl:col-span-4 rounded-2xl bg-[#11100D] border border-[rgba(245,196,81,0.18)] p-3.5 sm:p-4 flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.6)] w-full min-w-0 box-border">
            <div className="flex items-center justify-between gap-2 border-b border-[rgba(245,196,81,0.1)] pb-2.5">
              <span className="text-xs font-bold text-[#F7F5EF] tracking-wide truncate">
                System Status
              </span>
              <div className="px-2 py-0.5 rounded-full bg-[#0D281E] border border-[#35D6A0]/30 text-[#35D6A0] text-[9.5px] sm:text-[10px] font-mono font-medium flex items-center gap-1.5 shadow-[0_0_8px_rgba(53,214,160,0.15)] shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#35D6A0] animate-pulse" />
                All Systems Operational
              </div>
            </div>

            {/* 4 Status Columns with Dividers */}
            <div className="grid grid-cols-4 divide-x divide-[rgba(245,196,81,0.1)] py-2 text-center w-full min-w-0">
              {/* AI Providers */}
              <div className="flex flex-col items-center gap-1 px-0.5 sm:px-1 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#17140D] border border-[rgba(245,196,81,0.2)] flex items-center justify-center text-[#B8B2A5] shrink-0">
                  <Server className="w-3.5 h-3.5 text-[#F5C451]" />
                </div>
                <div className="text-[8.5px] sm:text-[9.5px] text-[#827C70] truncate w-full">AI Providers</div>
                <div className="text-[10px] sm:text-[11px] font-bold text-[#35D6A0] font-mono truncate">{aiRouterStatus}</div>
              </div>

              {/* ComfyUI */}
              <div className="flex flex-col items-center gap-1 px-0.5 sm:px-1 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#17140D] border border-[rgba(245,196,81,0.2)] flex items-center justify-center text-[#B8B2A5] shrink-0">
                  <Boxes className="w-3.5 h-3.5 text-[#F5C451]" />
                </div>
                <div className="text-[8.5px] sm:text-[9.5px] text-[#827C70] truncate w-full">ComfyUI</div>
                <div className="text-[10px] sm:text-[11px] font-bold text-[#35D6A0] font-mono truncate">{comfyStatus}</div>
              </div>

              {/* Storage */}
              <div className="flex flex-col items-center gap-1 px-0.5 sm:px-1 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#17140D] border border-[rgba(245,196,81,0.2)] flex items-center justify-center text-[#B8B2A5] shrink-0">
                  <Database className="w-3.5 h-3.5 text-[#F5C451]" />
                </div>
                <div className="text-[8.5px] sm:text-[9.5px] text-[#827C70] truncate w-full">Storage</div>
                <div className="text-[10px] sm:text-[11px] font-bold text-[#F7F5EF] font-mono truncate">{storageUsed} GB</div>
              </div>

              {/* Projects */}
              <div className="flex flex-col items-center gap-1 px-0.5 sm:px-1 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#17140D] border border-[rgba(245,196,81,0.2)] flex items-center justify-center text-[#B8B2A5] shrink-0">
                  <span className="text-[10.5px] sm:text-[11px] font-bold text-[#F5C451] font-mono">12</span>
                </div>
                <div className="text-[8.5px] sm:text-[9.5px] text-[#827C70] truncate w-full">Projects</div>
                <div className="text-[10px] sm:text-[11px] font-bold text-[#F7F5EF] font-mono truncate">12 Active</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Quick Action Row (5 Cards) ────────────────────────── */}
        <section aria-label="Quick Actions" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 w-full min-w-0">
          {/* Card 1: AI Studio */}
          <Link
            href="/ai"
            className="rounded-xl bg-[#11100D] border border-[rgba(245,196,81,0.16)] hover:border-[#F5C451] p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-all duration-150 hover:shadow-[0_0_16px_rgba(245,196,81,0.18)] group min-w-0"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#211A0C] border border-[rgba(245,196,81,0.3)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5C451]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#F7F5EF] group-hover:text-[#F5C451] transition-colors truncate">
                  AI Studio
                </div>
                <div className="text-[9.5px] sm:text-[10px] text-[#827C70] truncate">
                  Chat • Create • Analyze
                </div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#827C70] group-hover:text-[#F5C451] group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          {/* Card 2: ComfyUI */}
          <Link
            href="/creative"
            className="rounded-xl bg-[#11100D] border border-[rgba(245,196,81,0.16)] hover:border-[#F5C451] p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-all duration-150 hover:shadow-[0_0_16px_rgba(245,196,81,0.18)] group min-w-0"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#211A0C] border border-[rgba(245,196,81,0.3)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Boxes className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5C451]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#F7F5EF] group-hover:text-[#F5C451] transition-colors truncate">
                  ComfyUI
                </div>
                <div className="text-[9.5px] sm:text-[10px] text-[#827C70] truncate">
                  Image &amp; Video Generation
                </div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#827C70] group-hover:text-[#F5C451] group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          {/* Card 3: Presenter X */}
          <Link
            href="/presentx"
            className="rounded-xl bg-[#11100D] border border-[rgba(245,196,81,0.16)] hover:border-[#F5C451] p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-all duration-150 hover:shadow-[0_0_16px_rgba(245,196,81,0.18)] group min-w-0"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#211A0C] border border-[rgba(245,196,81,0.3)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Presentation className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5C451]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#F7F5EF] group-hover:text-[#F5C451] transition-colors truncate">
                  Presenter X
                </div>
                <div className="text-[9.5px] sm:text-[10px] text-[#827C70] truncate">
                  Create Stunning Decks
                </div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#827C70] group-hover:text-[#F5C451] group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          {/* Card 4: New Project */}
          <Link
            href="/projects"
            className="rounded-xl bg-[#11100D] border border-[rgba(245,196,81,0.16)] hover:border-[#F5C451] p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-all duration-150 hover:shadow-[0_0_16px_rgba(245,196,81,0.18)] group min-w-0"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#211A0C] border border-[rgba(245,196,81,0.3)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FolderPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5C451]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#F7F5EF] group-hover:text-[#F5C451] transition-colors truncate">
                  New Project
                </div>
                <div className="text-[9.5px] sm:text-[10px] text-[#827C70] truncate">
                  Start from Template
                </div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#827C70] group-hover:text-[#F5C451] group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          {/* Card 5: Media Library */}
          <Link
            href="/media"
            className="rounded-xl bg-[#11100D] border border-[rgba(245,196,81,0.16)] hover:border-[#F5C451] p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-all duration-150 hover:shadow-[0_0_16px_rgba(245,196,81,0.18)] group min-w-0 col-span-2 sm:col-span-1"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#211A0C] border border-[rgba(245,196,81,0.3)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5C451]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#F7F5EF] group-hover:text-[#F5C451] transition-colors truncate">
                  Media Library
                </div>
                <div className="text-[9.5px] sm:text-[10px] text-[#827C70] truncate">
                  Manage Assets
                </div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#827C70] group-hover:text-[#F5C451] group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        </section>

        {/* ── 3. Main Feature Section (3 Creative Cards + Recent Projects) ── */}
        <section aria-label="Creative Workspaces" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 items-stretch w-full min-w-0">
          {/* Card 1: ComfyUI */}
          <div className="rounded-2xl bg-[#11100D] border border-[rgba(245,196,81,0.16)] p-3.5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.6)] min-w-0">
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-[#211A0C] border border-[rgba(245,196,81,0.3)] flex items-center justify-center shrink-0">
                    <Boxes className="w-3.5 h-3.5 text-[#F5C451]" />
                  </div>
                  <h3 className="text-xs font-bold text-[#F7F5EF] truncate">ComfyUI</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#0D281E] border border-[#35D6A0]/30 text-[#35D6A0] text-[9px] font-mono flex items-center gap-1 shrink-0">
                  <span className="w-1 h-1 rounded-full bg-[#35D6A0]" />
                  {comfyStatus}
                </span>
              </div>
              <p className="text-[10px] text-[#827C70] pt-1.5 pb-2.5 line-clamp-1">
                Generate stunning images &amp; videos with advanced AI workflows.
              </p>

              {/* Artwork Preview */}
              <div className="relative rounded-xl overflow-hidden aspect-[16/10] border border-[rgba(245,196,81,0.14)] bg-[#080808] group w-full">
                <Image
                  src="/assets/comfyui-golden-creation.webp"
                  alt="ComfyUI Golden Creation"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-[#050505]/20 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-[#050505]/75 border border-[#F5C451]/60 backdrop-blur-sm flex items-center justify-center text-[#F5C451] shadow-[0_0_12px_rgba(245,196,81,0.4)] group-hover:scale-110 transition-transform">
                    <Play className="w-3.5 h-3.5 fill-[#F5C451] ml-0.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-3 w-full min-w-0">
              <Link
                href="/creative"
                className="py-1.5 px-2 sm:px-3 rounded-xl bg-[#F5C451] hover:bg-[#FFD978] text-[#050505] font-bold text-[11px] text-center transition-all shadow-[0_0_12px_rgba(245,196,81,0.25)] truncate block"
              >
                Open ComfyUI
              </Link>
              <Link
                href="/media"
                className="py-1.5 px-2 sm:px-3 rounded-xl bg-[#17140D] hover:bg-[#211A0C] border border-[rgba(245,196,81,0.2)] text-[#F7F5EF] text-[11px] text-center transition-all truncate block"
              >
                View Gallery
              </Link>
            </div>
          </div>

          {/* Card 2: Presenter X */}
          <div className="rounded-2xl bg-[#11100D] border border-[rgba(245,196,81,0.16)] p-3.5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.6)] min-w-0">
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-[#211A0C] border border-[rgba(245,196,81,0.3)] flex items-center justify-center shrink-0">
                    <Presentation className="w-3.5 h-3.5 text-[#F5C451]" />
                  </div>
                  <h3 className="text-xs font-bold text-[#F7F5EF] truncate">Presenter X</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#0D281E] border border-[#35D6A0]/30 text-[#35D6A0] text-[9px] font-mono flex items-center gap-1 shrink-0">
                  <span className="w-1 h-1 rounded-full bg-[#35D6A0]" />
                  Ready
                </span>
              </div>
              <p className="text-[10px] text-[#827C70] pt-1.5 pb-2.5 line-clamp-1">
                Create professional presentations with AI-powered intelligence.
              </p>

              {/* Artwork Preview */}
              <div className="relative rounded-xl overflow-hidden aspect-[16/10] border border-[rgba(245,196,81,0.14)] bg-[#080808] group w-full">
                <Image
                  src="/assets/presenter-orbital-preview.webp"
                  alt="Presenter Orbital Deck Preview"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Styled Deck Title Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/85 via-transparent to-transparent flex flex-col justify-center p-3 sm:p-3.5">
                  <div className="text-[10px] text-[#F5C451] mb-1">▲</div>
                  <div className="text-[10px] font-bold tracking-[0.2em] text-[#F7F5EF] uppercase font-satoshi">
                    ANTIGRAVITY
                  </div>
                  <div className="text-[7.5px] font-mono tracking-wider text-[#F5C451] uppercase pt-0.5">
                    THE NEXT ERA OF INTELLIGENCE
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-3 w-full min-w-0">
              <Link
                href="/presentx"
                className="py-1.5 px-2 rounded-xl bg-[#F5C451] hover:bg-[#FFD978] text-[#050505] font-bold text-[11px] text-center transition-all shadow-[0_0_12px_rgba(245,196,81,0.25)] truncate block"
              >
                Create Presentation
              </Link>
              <Link
                href="/presentx"
                className="py-1.5 px-2 rounded-xl bg-[#17140D] hover:bg-[#211A0C] border border-[rgba(245,196,81,0.2)] text-[#F7F5EF] text-[11px] text-center transition-all truncate block"
              >
                View Templates
              </Link>
            </div>
          </div>

          {/* Card 3: AI Studio */}
          <div className="rounded-2xl bg-[#11100D] border border-[rgba(245,196,81,0.16)] p-3.5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.6)] min-w-0">
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-[#211A0C] border border-[rgba(245,196,81,0.3)] flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-[#F5C451]" />
                  </div>
                  <h3 className="text-xs font-bold text-[#F7F5EF] truncate">AI Studio</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#0D281E] border border-[#35D6A0]/30 text-[#35D6A0] text-[9px] font-mono flex items-center gap-1 shrink-0">
                  <span className="w-1 h-1 rounded-full bg-[#35D6A0]" />
                  {aiRouterStatus}
                </span>
              </div>
              <p className="text-[10px] text-[#827C70] pt-1.5 pb-2.5 line-clamp-1">
                Chat with multiple AI providers. Research, create, and automate.
              </p>

              {/* Provider List (4 rows) */}
              <div className="space-y-1.5 w-full min-w-0">
                {/* OpenAI */}
                <Link
                  href="/ai?provider=openai"
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#17140D] border border-[rgba(245,196,81,0.1)] hover:border-[#F5C451]/40 transition-colors group min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-5 h-5 rounded-md bg-[#10A37F]/20 border border-[#10A37F]/40 flex items-center justify-center shrink-0">
                      <span className="text-[9px] text-[#10A37F] font-bold">O</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-[#F7F5EF] leading-tight truncate">GPT-4o</div>
                      <div className="text-[9px] text-[#827C70] truncate">Creative &amp; Analytical</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#827C70] group-hover:text-[#F5C451] transition-colors shrink-0 ml-1" />
                </Link>

                {/* Claude */}
                <Link
                  href="/ai?provider=anthropic"
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#17140D] border border-[rgba(245,196,81,0.1)] hover:border-[#F5C451]/40 transition-colors group min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-5 h-5 rounded-md bg-[#D97706]/20 border border-[#D97706]/40 flex items-center justify-center shrink-0">
                      <span className="text-[9px] text-[#D97706] font-bold">C</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-[#F7F5EF] leading-tight truncate">Claude 3.5</div>
                      <div className="text-[9px] text-[#827C70] truncate">Thoughtful &amp; Precise</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#827C70] group-hover:text-[#F5C451] transition-colors shrink-0 ml-1" />
                </Link>

                {/* Gemini */}
                <Link
                  href="/ai?provider=gemini"
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#17140D] border border-[rgba(245,196,81,0.1)] hover:border-[#F5C451]/40 transition-colors group min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-5 h-5 rounded-md bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center shrink-0">
                      <span className="text-[9px] text-[#60A5FA] font-bold">G</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-[#F7F5EF] leading-tight truncate">Gemini 1.5</div>
                      <div className="text-[9px] text-[#827C70] truncate">Multimodal Intelligence</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#827C70] group-hover:text-[#F5C451] transition-colors shrink-0 ml-1" />
                </Link>

                {/* Jev AI */}
                <Link
                  href="/ai?provider=jev"
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#17140D] border border-[rgba(245,196,81,0.1)] hover:border-[#F5C451]/40 transition-colors group min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-5 h-5 rounded-md bg-[#9333EA]/20 border border-[#9333EA]/40 flex items-center justify-center shrink-0">
                      <span className="text-[9px] text-[#C084FC] font-bold">J</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-[#F7F5EF] leading-tight truncate">Jev AI System One</div>
                      <div className="text-[9px] text-[#827C70] truncate">Sovereign Decision Engine</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#827C70] group-hover:text-[#F5C451] transition-colors shrink-0 ml-1" />
                </Link>
              </div>
            </div>

            {/* Action */}
            <div className="pt-3 w-full">
              <Link
                href="/ai"
                className="block w-full py-2 px-3 rounded-xl bg-[#F5C451] hover:bg-[#FFD978] text-[#050505] font-bold text-[11px] text-center transition-all shadow-[0_0_12px_rgba(245,196,81,0.25)] truncate"
              >
                Open AI Studio
              </Link>
            </div>
          </div>

          {/* Card 4: Recent Projects */}
          <div className="rounded-2xl bg-[#11100D] border border-[rgba(245,196,81,0.16)] p-3.5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.6)] min-w-0">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(245,196,81,0.1)]">
                <span className="text-xs font-bold text-[#F7F5EF] truncate">Recent Projects</span>
                <Link href="/projects" className="text-[11px] font-bold text-[#F5C451] hover:underline shrink-0">
                  View All
                </Link>
              </div>

              {/* Project Items (5 rows) */}
              <div className="divide-y divide-[rgba(245,196,81,0.08)]">
                {/* Project 1 */}
                <Link href="/presentx" className="flex items-center gap-2.5 py-1.5 hover:bg-[#17140D]/60 rounded-lg px-1 transition-colors group min-w-0">
                  <div className="w-8 h-8 rounded-lg overflow-hidden relative shrink-0 border border-[rgba(245,196,81,0.2)]">
                    <Image src="/assets/presenter-orbital-preview.webp" alt="Thumb" fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-[#F7F5EF] group-hover:text-[#F5C451] transition-colors truncate">
                      Antigravity Brand Strategy
                    </div>
                    <div className="text-[9px] text-[#827C70] truncate">
                      Presentation • 12 slides • 2h ago
                    </div>
                  </div>
                </Link>

                {/* Project 2 */}
                <Link href="/presentx" className="flex items-center gap-2.5 py-1.5 hover:bg-[#17140D]/60 rounded-lg px-1 transition-colors group min-w-0">
                  <div className="w-8 h-8 rounded-lg overflow-hidden relative shrink-0 border border-[rgba(245,196,81,0.2)]">
                    <Image src="/assets/comfyui-golden-creation.webp" alt="Thumb" fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-[#F7F5EF] group-hover:text-[#F5C451] transition-colors truncate">
                      AI Product Launch
                    </div>
                    <div className="text-[9px] text-[#827C70] truncate">
                      Presentation • 18 slides • 1d ago
                    </div>
                  </div>
                </Link>

                {/* Project 3 */}
                <Link href="/media" className="flex items-center gap-2.5 py-1.5 hover:bg-[#17140D]/60 rounded-lg px-1 transition-colors group min-w-0">
                  <div className="w-8 h-8 rounded-lg overflow-hidden relative shrink-0 border border-[rgba(245,196,81,0.2)]">
                    <Image src="/assets/generation-futuristic-megacity.webp" alt="Thumb" fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-[#F7F5EF] group-hover:text-[#F5C451] transition-colors truncate">
                      Futuristic City Concept
                    </div>
                    <div className="text-[9px] text-[#827C70] truncate">
                      Image Generation • 4 images • 2d ago
                    </div>
                  </div>
                </Link>

                {/* Project 4 */}
                <Link href="/creative" className="flex items-center gap-2.5 py-1.5 hover:bg-[#17140D]/60 rounded-lg px-1 transition-colors group min-w-0">
                  <div className="w-8 h-8 rounded-lg overflow-hidden relative shrink-0 border border-[rgba(245,196,81,0.2)]">
                    <Image src="/assets/generation-golden-vehicle.webp" alt="Thumb" fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-[#F7F5EF] group-hover:text-[#F5C451] transition-colors truncate">
                      Antigravity OS Demo
                    </div>
                    <div className="text-[9px] text-[#827C70] truncate">
                      Video Generation • 1 video • 3d ago
                    </div>
                  </div>
                </Link>

                {/* Project 5 */}
                <Link href="/projects" className="flex items-center gap-2.5 py-1.5 hover:bg-[#17140D]/60 rounded-lg px-1 transition-colors group min-w-0">
                  <div className="w-8 h-8 rounded-lg overflow-hidden relative shrink-0 border border-[rgba(245,196,81,0.2)]">
                    <Image src="/assets/generation-cosmic-landscape.webp" alt="Thumb" fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-[#F7F5EF] group-hover:text-[#F5C451] transition-colors truncate">
                      Market Analysis 2026
                    </div>
                    <div className="text-[9px] text-[#827C70] truncate">
                      Document • 8 pages • 4d ago
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Bottom Information Panels ─────────────────────────── */}
        <section aria-label="Operational Telemetry" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3.5 items-stretch w-full min-w-0">
          {/* Panel 1: AI Provider Status */}
          <div className="xl:col-span-4 rounded-2xl bg-[#11100D] border border-[rgba(245,196,81,0.16)] p-3.5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.6)] min-w-0">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(245,196,81,0.1)]">
                <span className="text-xs font-bold text-[#F7F5EF] truncate">AI Provider Status</span>
                <Link href="/desktop" className="text-[11px] font-bold text-[#F5C451] hover:underline shrink-0">
                  View All
                </Link>
              </div>

              {/* Provider Status Rows */}
              <div className="space-y-2 pt-2">
                {/* OpenAI */}
                <div className="flex items-center justify-between text-xs py-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-4 h-4 rounded-full bg-[#10A37F]/20 flex items-center justify-center text-[9px] text-[#10A37F] font-bold shrink-0">O</div>
                    <span className="font-bold text-[#F7F5EF] truncate">OpenAI</span>
                    <span className="text-[#35D6A0] text-[10px] font-mono flex items-center gap-1 shrink-0">
                      <span className="w-1 h-1 rounded-full bg-[#35D6A0]" />
                      Online
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9.5px] sm:text-[10px] text-[#827C70] font-mono truncate max-w-[110px]">GPT-4o, DALL-E 3</span>
                    <span className="text-[#35D6A0] text-[10px] font-mono">llll</span>
                  </div>
                </div>

                {/* Claude */}
                <div className="flex items-center justify-between text-xs py-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-4 h-4 rounded-full bg-[#D97706]/20 flex items-center justify-center text-[9px] text-[#D97706] font-bold shrink-0">C</div>
                    <span className="font-bold text-[#F7F5EF] truncate">Claude</span>
                    <span className="text-[#35D6A0] text-[10px] font-mono flex items-center gap-1 shrink-0">
                      <span className="w-1 h-1 rounded-full bg-[#35D6A0]" />
                      Online
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9.5px] sm:text-[10px] text-[#827C70] font-mono truncate max-w-[110px]">Claude 3.5 Sonnet</span>
                    <span className="text-[#35D6A0] text-[10px] font-mono">llll</span>
                  </div>
                </div>

                {/* Gemini */}
                <div className="flex items-center justify-between text-xs py-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-4 h-4 rounded-full bg-[#2563EB]/20 flex items-center justify-center text-[9px] text-[#60A5FA] font-bold shrink-0">G</div>
                    <span className="font-bold text-[#F7F5EF] truncate">Gemini</span>
                    <span className="text-[#35D6A0] text-[10px] font-mono flex items-center gap-1 shrink-0">
                      <span className="w-1 h-1 rounded-full bg-[#35D6A0]" />
                      Online
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9.5px] sm:text-[10px] text-[#827C70] font-mono truncate max-w-[110px]">Gemini 1.5 Pro</span>
                    <span className="text-[#35D6A0] text-[10px] font-mono">llll</span>
                  </div>
                </div>

                {/* Jev AI */}
                <div className="flex items-center justify-between text-xs py-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-4 h-4 rounded-full bg-[#9333EA]/20 flex items-center justify-center text-[9px] text-[#C084FC] font-bold shrink-0">J</div>
                    <span className="font-bold text-[#F7F5EF] truncate">Jev AI</span>
                    <span className="text-[#35D6A0] text-[10px] font-mono flex items-center gap-1 shrink-0">
                      <span className="w-1 h-1 rounded-full bg-[#35D6A0]" />
                      Online
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9.5px] sm:text-[10px] text-[#827C70] font-mono truncate max-w-[110px]">System One</span>
                    <span className="text-[#35D6A0] text-[10px] font-mono">llll</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Quick Stats */}
          <div className="xl:col-span-4 rounded-2xl bg-[#11100D] border border-[rgba(245,196,81,0.16)] p-3.5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.6)] min-w-0">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(245,196,81,0.1)]">
                <span className="text-xs font-bold text-[#F7F5EF] truncate">Quick Stats</span>
                <span className="text-[10px] font-mono text-[#827C70] bg-[#17140D] border border-[rgba(245,196,81,0.15)] px-2 py-0.5 rounded-md shrink-0">
                  Last 30 Days ▾
                </span>
              </div>

              {/* 4 Stat Boxes */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-3 text-left">
                {/* Projects */}
                <div className="flex flex-col items-start p-1 min-w-0">
                  <span className="text-[9.5px] sm:text-[10px] text-[#827C70] truncate w-full">Projects</span>
                  <span className="text-base sm:text-lg font-bold text-[#F7F5EF] font-mono">12</span>
                  <div className="flex items-center gap-1 text-[8.5px] sm:text-[9px] text-[#35D6A0] font-mono pt-1">
                    <span>+20%</span>
                  </div>
                  <BarChart2 className="w-3.5 h-3.5 text-[#F5C451] mt-2 self-end shrink-0" />
                </div>

                {/* Generations */}
                <div className="flex flex-col items-start p-1 min-w-0">
                  <span className="text-[9.5px] sm:text-[10px] text-[#827C70] truncate w-full">Generations</span>
                  <span className="text-base sm:text-lg font-bold text-[#F7F5EF] font-mono">248</span>
                  <div className="flex items-center gap-1 text-[8.5px] sm:text-[9px] text-[#35D6A0] font-mono pt-1">
                    <span>+42%</span>
                  </div>
                  <Clapperboard className="w-3.5 h-3.5 text-[#F5C451] mt-2 self-end shrink-0" />
                </div>

                {/* Presentations */}
                <div className="flex flex-col items-start p-1 min-w-0">
                  <span className="text-[9.5px] sm:text-[10px] text-[#827C70] truncate w-full">Presentations</span>
                  <span className="text-base sm:text-lg font-bold text-[#F7F5EF] font-mono">36</span>
                  <div className="flex items-center gap-1 text-[8.5px] sm:text-[9px] text-[#35D6A0] font-mono pt-1">
                    <span>+28%</span>
                  </div>
                  <Presentation className="w-3.5 h-3.5 text-[#F5C451] mt-2 self-end shrink-0" />
                </div>

                {/* Storage Used */}
                <div className="flex flex-col items-start p-1 min-w-0">
                  <span className="text-[9.5px] sm:text-[10px] text-[#827C70] truncate w-full">Storage</span>
                  <span className="text-base sm:text-lg font-bold text-[#F7F5EF] font-mono truncate w-full">{storageUsed} GB</span>
                  <div className="flex items-center gap-1 text-[8.5px] sm:text-[9px] text-[#35D6A0] font-mono pt-1">
                    <span>+12%</span>
                  </div>
                  <Database className="w-3.5 h-3.5 text-[#F5C451] mt-2 self-end shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Panel 3: Recent Generations */}
          <div className="md:col-span-2 xl:col-span-4 rounded-2xl bg-[#11100D] border border-[rgba(245,196,81,0.16)] p-3.5 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.6)] min-w-0">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(245,196,81,0.1)]">
                <span className="text-xs font-bold text-[#F7F5EF] truncate">Recent Generations</span>
                <Link href="/media" className="text-[11px] font-bold text-[#F5C451] hover:underline shrink-0">
                  View All
                </Link>
              </div>

              {/* 4 Horizontal Image Cards */}
              <div className="grid grid-cols-4 gap-2 pt-2.5 w-full min-w-0">
                <Link href="/creative" className="aspect-[4/5] rounded-xl overflow-hidden relative border border-[rgba(245,196,81,0.2)] hover:border-[#F5C451] transition-all group min-w-0">
                  <Image src="/assets/comfyui-golden-creation.webp" alt="Gen 1" fill className="object-cover group-hover:scale-105 transition-transform" />
                </Link>
                <Link href="/creative" className="aspect-[4/5] rounded-xl overflow-hidden relative border border-[rgba(245,196,81,0.2)] hover:border-[#F5C451] transition-all group min-w-0">
                  <Image src="/assets/generation-futuristic-megacity.webp" alt="Gen 2" fill className="object-cover group-hover:scale-105 transition-transform" />
                </Link>
                <Link href="/creative" className="aspect-[4/5] rounded-xl overflow-hidden relative border border-[rgba(245,196,81,0.2)] hover:border-[#F5C451] transition-all group min-w-0">
                  <Image src="/assets/generation-golden-vehicle.webp" alt="Gen 3" fill className="object-cover group-hover:scale-105 transition-transform" />
                </Link>
                <Link href="/creative" className="aspect-[4/5] rounded-xl overflow-hidden relative border border-[rgba(245,196,81,0.2)] hover:border-[#F5C451] transition-all group min-w-0">
                  <Image src="/assets/generation-cosmic-landscape.webp" alt="Gen 4" fill className="object-cover group-hover:scale-105 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Sovereign Mode Command Bar ────────────────────────── */}
        <section aria-label="Sovereign Command Deck" className="pt-2 relative w-full min-w-0">
          {/* Subtle curved luminous floor glow & gold arc line */}
          <div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl h-16 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 100%, rgba(245, 196, 81, 0.45) 0%, rgba(245, 196, 81, 0.12) 45%, transparent 75%)",
            }}
          />
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-[1.5px] pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(245, 196, 81, 0.8) 50%, transparent 100%)",
              boxShadow: "0 0 16px rgba(245, 196, 81, 0.8)",
            }}
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 relative z-10 w-full min-w-0">
            {/* Left Badge: Sovereign Mode */}
            <div className="px-3.5 py-1.5 rounded-full bg-[#11100D] border border-[rgba(245,196,81,0.28)] flex items-center gap-2 shadow-[0_0_12px_rgba(245,196,81,0.15)] shrink-0">
              <span className="text-[#F5C451] text-xs">👑</span>
              <span className="text-[9.5px] sm:text-[10px] font-mono font-bold tracking-[0.18em] text-[#F5C451] uppercase">
                SOVEREIGN MODE
              </span>
            </div>

            {/* Center Prompt Input Bar */}
            <form onSubmit={handleCommand} className="flex-1 max-w-2xl w-full min-w-0">
              <div className="relative flex items-center rounded-full bg-[#0D0C09] border border-[rgba(245,196,81,0.25)] focus-within:border-[#F5C451] focus-within:shadow-[0_0_18px_rgba(245,196,81,0.25)] transition-all px-3.5 sm:px-4 py-1.5 w-full box-border">
                <span className="text-[#827C70] pr-2 sm:pr-2.5 text-xs shrink-0">✕</span>
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="What would you like to create today?"
                  className="flex-1 min-w-0 bg-transparent text-xs text-[#F7F5EF] placeholder-[#827C70] focus:outline-none font-sans"
                />
                <button
                  type="submit"
                  disabled={isExecuting || !commandInput.trim()}
                  className={clsx(
                    "w-7 h-7 rounded-full bg-[#F5C451] text-[#050505] flex items-center justify-center font-bold transition-all shadow-[0_0_10px_rgba(245,196,81,0.35)] shrink-0 ml-1.5",
                    isExecuting || !commandInput.trim()
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:bg-[#FFD978] hover:scale-105 active:scale-95"
                  )}
                  aria-label="Submit sovereign command"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Right Badge: Powered by 8 AI Providers */}
            <div className="px-3 sm:px-3.5 py-1.5 rounded-full bg-[#11100D] border border-[rgba(245,196,81,0.2)] flex items-center gap-2 text-[10px] font-mono text-[#B8B2A5] shrink-0">
              <Infinity className="w-3.5 h-3.5 text-[#F5C451]" />
              <div className="text-left">
                <div className="text-[7.5px] text-[#827C70] tracking-wider uppercase leading-none">POWERED BY</div>
                <div className="text-[8.5px] sm:text-[9px] font-bold text-[#F7F5EF] leading-tight">8 AI PROVIDERS</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
