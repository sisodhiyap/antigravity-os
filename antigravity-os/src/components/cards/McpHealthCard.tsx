"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { Network, CheckCircle2, Zap } from "lucide-react";
import { McpServerMetric } from "@/types/telemetry";

interface McpHealthCardProps {
  mcp: McpServerMetric[];
}

export const McpHealthCard: React.FC<McpHealthCardProps> = ({ mcp }) => {
  const totalTools = mcp.reduce((acc, curr) => acc + curr.toolCount, 0);

  return (
    <Card glow="neon">
      <CardHeader>
        <CardTitle>
          <Network className="w-4 h-4 text-cyber-neon" />
          <span>MODEL CONTEXT PROTOCOL (MCP)</span>
        </CardTitle>
        <Badge variant="neon" dot>
          {mcp.length} SERVERS / {totalTools} TOOLS
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {mcp.map((server) => (
            <div
              key={server.name}
              className="bg-slate-950/60 p-2 rounded-lg border border-white/5 flex items-center justify-between text-xs font-mono"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyber-neon" />
                <div>
                  <span className="text-slate-200 font-bold block">{server.name}</span>
                  <span className="text-[10px] text-slate-500">{server.mode} Mode • {server.toolCount} tools</span>
                </div>
              </div>

              <div className="text-right">
                <Badge variant="cyan" className="text-[9px] px-1.5 py-0">
                  {server.latencyMs} ms
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
