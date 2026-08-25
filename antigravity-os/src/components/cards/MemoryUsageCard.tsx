"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { Brain, Database, Sparkles, Share2 } from "lucide-react";
import { MemoryMetric } from "@/types/telemetry";
import { formatBytes, formatNumber } from "@/lib/utils";

interface MemoryUsageCardProps {
  memory: MemoryMetric;
}

export const MemoryUsageCard: React.FC<MemoryUsageCardProps> = ({ memory }) => {
  return (
    <Card glow="purple">
      <CardHeader>
        <CardTitle>
          <Brain className="w-4 h-4 text-cyber-purple" />
          <span>PERSISTENT VECTOR & GRAPH MEMORY</span>
        </CardTitle>
        <Badge variant="purple" dot>
          {memory.cacheHitRatePercent}% CACHE HIT
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Database className="w-3 h-3 text-cyber-cyan" /> VECTOR EMBEDDINGS
            </div>
            <div className="text-sm font-bold text-cyber-cyan mt-1">
              {formatNumber(memory.vectorDbNodes)} nodes
            </div>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Share2 className="w-3 h-3 text-cyber-neon" /> GRAPH ENTITIES
            </div>
            <div className="text-sm font-bold text-cyber-neon mt-1">
              {formatNumber(memory.graphEntities)} / {formatNumber(memory.graphRelations)} rels
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
          <span>KNOWLEDGE BASE FOOTPRINT</span>
          <span className="text-slate-200 font-bold">{formatBytes(memory.totalKnowledgeBytes)}</span>
        </div>

        <div className="flex gap-2 pt-0.5">
          <Badge variant="cyan" className="text-[10px] flex-1 justify-center py-1">
            PINECONE HYBRID: ACTIVE
          </Badge>
          <Badge variant="neon" className="text-[10px] flex-1 justify-center py-1">
            SQLITE KNOWLEDGE: SYNCED
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
