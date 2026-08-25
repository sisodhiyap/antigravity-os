"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { GitBranch, GitCommit, GitPullRequest, AlertCircle, CheckCircle2 } from "lucide-react";
import { GitHubMetric } from "@/types/telemetry";

interface GitHubStatusCardProps {
  github: GitHubMetric;
}

export const GitHubStatusCard: React.FC<GitHubStatusCardProps> = ({ github }) => {
  return (
    <Card glow="purple">
      <CardHeader>
        <CardTitle>
          <GitBranch className="w-4 h-4 text-cyber-purple" />
          <span>VCS & GITHUB STATUS</span>
        </CardTitle>
        <Badge variant="purple" dot>
          SYNCED ({github.syncStatus.toUpperCase()})
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5 font-mono text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-cyber-cyan font-bold">{github.repo}</span>
            <span className="text-slate-400 text-[11px]">branch: <span className="text-slate-200">{github.branch}</span></span>
          </div>
          <div className="text-[11px] text-slate-300 truncate flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-white/5">
            <GitCommit className="w-3.5 h-3.5 text-cyber-neon shrink-0" />
            <span className="text-cyber-neon font-semibold">[{github.lastCommitSha}]</span>
            <span className="truncate">{github.lastCommitMessage}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs">
          <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <GitPullRequest className="w-3 h-3 text-cyber-cyan" /> PENDING PRS
            </div>
            <div className="text-xs font-bold text-cyber-cyan mt-0.5">{github.pendingPrs}</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3 text-cyber-amber" /> OPEN ISSUES
            </div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">{github.openIssues}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
