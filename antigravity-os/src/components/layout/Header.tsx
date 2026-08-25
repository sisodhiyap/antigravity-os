"use client";

import React, { useEffect } from "react";
import {
  Search,
  Play,
  Pause,
  Clock,
  Command,
  Radio,
} from "lucide-react";
import { useSystemStore } from "@/stores/useSystemStore";
import { useLiveTelemetry } from "@/hooks/useLiveTelemetry";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { formatUptime } from "@/lib/utils";

export const Header: React.FC = () => {
  const {
    telemetry,
    isLive,
    toggleLive,
    refreshIntervalMs,
    setRefreshInterval,
    setCommandPaletteOpen,
  } = useSystemStore();

  const { isFetching } = useLiveTelemetry();

  // Keyboard shortcut listener for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setCommandPaletteOpen]);

  return (
    <header className="glass-panel border-b border-white/10 sticky top-0 z-20 px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Search / Command palette trigger */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-3 bg-slate-950/80 hover:bg-slate-900 border border-white/10 hover:border-cyber-cyan/40 px-3.5 py-1.5 rounded-xl text-xs font-mono text-slate-400 transition-all duration-200 w-72 max-w-full justify-between shadow-inner"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>Quick actions, agents, MCP...</span>
        </div>
        <kbd className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] border border-white/10 flex items-center gap-0.5">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </button>

      {/* Right controls: Live Stream Toggle, Uptime, Status */}
      <div className="flex items-center gap-3">
        {/* System Uptime Badge */}
        <div className="hidden lg:flex items-center gap-1.5 font-mono text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-white/5">
          <Clock className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>UPTIME: <span className="text-slate-200 font-bold">{formatUptime(telemetry.uptimeSeconds)}</span></span>
        </div>

        {/* Refresh Rate Selector */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-white/5 font-mono text-[11px]">
          <button
            onClick={() => setRefreshInterval(1000)}
            className={`px-2 py-0.5 rounded ${
              refreshIntervalMs === 1000 ? "bg-cyber-cyan/20 text-cyber-cyan font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            1s
          </button>
          <button
            onClick={() => setRefreshInterval(3000)}
            className={`px-2 py-0.5 rounded ${
              refreshIntervalMs === 3000 ? "bg-cyber-cyan/20 text-cyber-cyan font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            3s
          </button>
        </div>

        {/* Live Stream Toggle Button */}
        <Button
          onClick={toggleLive}
          variant={isLive ? "primary" : "secondary"}
          size="sm"
          className="gap-1.5 font-mono text-xs h-8"
        >
          {isLive ? (
            <>
              <Radio className={`w-3.5 h-3.5 ${isFetching ? "text-slate-950 animate-pulse" : ""}`} />
              <span>LIVE POLLING</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>PAUSED</span>
            </>
          )}
        </Button>

        {/* System Status Pill */}
        <Badge variant="neon" dot className="hidden sm:inline-flex">
          ONLINE
        </Badge>
      </div>
    </header>
  );
};
