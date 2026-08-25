"use client";

import React, { useState, useRef, useEffect } from "react";
import { Terminal, Send, Trash2, Maximize2, Minimize2, CornerDownLeft, Sparkles } from "lucide-react";
import { useTerminalStore } from "@/stores/useTerminalStore";
import { Button } from "@/ui/Button";
import { Badge } from "@/ui/Badge";

export const TerminalWidget: React.FC = () => {
  const { logs, executeCommand, clearLogs } = useTerminalStore();
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    executeCommand(input);
    setInput("");
  };

  const quickCommands = ["status", "swarm", "gpu", "mcp", "test", "clear"];

  const getLogColor = (level: string) => {
    switch (level) {
      case "success":
        return "text-cyber-neon";
      case "warn":
        return "text-cyber-amber";
      case "error":
        return "text-red-400";
      case "command":
        return "text-cyber-cyan font-bold";
      default:
        return "text-slate-300";
    }
  };

  return (
    <div
      className={`glass-panel rounded-xl overflow-hidden transition-all duration-300 flex flex-col border border-cyber-cyan/30 shadow-glow-cyan/20 ${
        isExpanded ? "h-[560px]" : "h-[340px]"
      }`}
    >
      {/* Terminal Title Bar */}
      <div className="bg-slate-950/90 px-4 py-2.5 flex items-center justify-between border-b border-white/10 select-none">
        <div className="flex items-center gap-2 font-mono text-xs text-slate-200 font-bold">
          <Terminal className="w-4 h-4 text-cyber-cyan" />
          <span>ANTIGRAVITY v2.0 INTERACTIVE OS KERNEL SHELL</span>
          <Badge variant="cyan" dot className="text-[9px] px-1.5 py-0">
            WSL2 / CUDA
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => clearLogs()}
            title="Clear logs"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Minimize" : "Maximize"}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Quick Command Bar */}
      <div className="bg-slate-900/60 px-4 py-1.5 flex items-center gap-1.5 border-b border-white/5 overflow-x-auto text-[11px] font-mono">
        <span className="text-slate-500 text-[10px] uppercase tracking-wider mr-1">Quick:</span>
        {quickCommands.map((cmd) => (
          <button
            key={cmd}
            onClick={() => executeCommand(cmd)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyber-cyan/20 hover:text-cyber-cyan text-slate-300 transition-colors border border-white/5"
          >
            ${cmd}
          </button>
        ))}
      </div>

      {/* Log Output Screen */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1.5 bg-slate-950/80">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 leading-relaxed">
            <span className="text-slate-600 text-[10px] select-none">[{log.timestamp}]</span>
            <span className="text-slate-500 text-[10px] font-bold select-none">[{log.sender}]</span>
            <span className={`break-all ${getLogColor(log.level)}`}>{log.message}</span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* Command Input Field */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-950 p-2.5 border-t border-white/10 flex items-center gap-2"
      >
        <span className="text-cyber-cyan font-mono text-sm pl-2 font-bold select-none">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type command (e.g. status, swarm, gpu, test, help)..."
          className="flex-1 bg-transparent font-mono text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
        />
        <Button type="submit" variant="primary" size="sm" className="h-7 px-2.5 gap-1 text-[11px]">
          <span>RUN</span>
          <CornerDownLeft className="w-3 h-3" />
        </Button>
      </form>
    </div>
  );
};
