"use client";

import React from "react";
import { TerminalWidget } from "@/components/terminal/TerminalWidget";
import { Terminal, Shield, Zap, Sparkles } from "lucide-react";
import { Badge } from "@/ui/Badge";

export default function TerminalPage() {
  return (
    <div className="space-y-6 font-mono">
      <div className="glass-panel p-6 rounded-2xl border border-cyber-cyan/30 shadow-glow-cyan/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-cyber-cyan" />
            <span>FULL KERNEL TERMINAL & SUBSYSTEM CONSOLE</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stdout/stderr stream, agent task dispatcher, and local hardware telemetry bridge.
          </p>
        </div>

        <Badge variant="cyan" dot className="py-1 px-3 text-xs">
          INTERACTIVE TTY READY
        </Badge>
      </div>

      <TerminalWidget />
    </div>
  );
}
