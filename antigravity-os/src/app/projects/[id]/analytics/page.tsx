"use client";

import React, { useState, useEffect, use } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { BarChart, DollarSign, Database, Activity, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

export default function ProjectAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [stats, setStats] = useState<{
    assetCount: number;
    totalSizeBytes: number;
    assetsByType: Record<string, number>;
    generationJobs: any[];
    succeededJobs: number;
    failedJobs: number;
    spentUsd: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch real assets for this project
      const assetRes = await fetch(`/api/omnicraft/assets?projectId=${encodeURIComponent(id)}`);
      const assetJson = await assetRes.json();
      const assets: any[] = assetJson.success ? assetJson.data : [];

      // Fetch real generation jobs for this project
      const jobsRes = await fetch(`/api/omnicraft/jobs?projectId=${encodeURIComponent(id)}`);
      const jobsJson = await jobsRes.json();
      const jobs: any[] = jobsJson.success ? jobsJson.data : [];

      // Fetch provider stats for spend
      const pRes = await fetch("/api/omnicraft/providers");
      const pJson = await pRes.json();
      const spentUsd = pJson.success ? pJson.data.stats.globalSpendUsd : 0;

      // Count assets by type
      const assetsByType: Record<string, number> = {};
      let totalSizeBytes = 0;
      for (const a of assets) {
        assetsByType[a.type] = (assetsByType[a.type] || 0) + 1;
        totalSizeBytes += a.sizeBytes || 0;
      }

      const succeededJobs = jobs.filter((j: any) => j.status === "COMPLETED").length;
      const failedJobs = jobs.filter((j: any) => j.status === "FAILED").length;

      setStats({
        assetCount: assets.length,
        totalSizeBytes,
        assetsByType,
        generationJobs: jobs,
        succeededJobs,
        failedJobs,
        spentUsd,
      });
    } catch (_) {
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [id]);

  const totalJobs = stats ? stats.succeededJobs + stats.failedJobs : 0;
  const successRate = totalJobs > 0 ? ((stats!.succeededJobs / totalJobs) * 100).toFixed(1) : null;

  return (
    <div className="space-y-6 font-mono text-slate-100">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Project Analytics</h2>
        <button
          onClick={fetchStats}
          className="text-slate-400 hover:text-cyber-cyan transition"
          title="Refresh stats"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-500 text-xs animate-pulse">
          Loading real analytics from database...
        </div>
      ) : !stats ? (
        <div className="text-center py-16 text-slate-500 text-xs">
          Failed to load analytics. Check authentication.
        </div>
      ) : (
        <>
          {/* Real Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <Card glow="cyan">
              <CardHeader>
                <CardTitle>
                  <Activity className="w-4 h-4 text-cyber-cyan" />
                  <span>Generated Assets</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyber-cyan">{stats.assetCount}</div>
                <div className="text-[10px] text-slate-500 mt-1">stored in database</div>
              </CardContent>
            </Card>

            <Card glow="purple">
              <CardHeader>
                <CardTitle>
                  <DollarSign className="w-4 h-4 text-cyber-purple" />
                  <span>AI Gateway Spend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyber-purple">${stats.spentUsd.toFixed(4)}</div>
                <div className="text-[10px] text-slate-500 mt-1">global workspace spend</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <Database className="w-4 h-4 text-cyber-cyan" />
                  <span>Storage Used</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-200">
                  {stats.totalSizeBytes < 1024 * 1024
                    ? `${(stats.totalSizeBytes / 1024).toFixed(1)} KB`
                    : `${(stats.totalSizeBytes / 1024 / 1024).toFixed(2)} MB`}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">on-disk assets</div>
              </CardContent>
            </Card>
          </div>

          {/* Asset Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>
                <BarChart className="w-4 h-4 text-cyber-cyan" />
                <span>Asset Breakdown by Type</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.assetCount === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <BarChart className="w-10 h-10 mx-auto text-slate-700" />
                  <p className="text-xs">No assets generated yet.</p>
                  <p className="text-[10px] text-slate-600">
                    Generate images, audio, video, or 3D models in the Media Synth tab to see analytics.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {Object.entries(stats.assetsByType).map(([type, count]) => (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-300 font-bold">{type}</span>
                        <span className="text-slate-400">{count} asset{count !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded overflow-hidden">
                        <div
                          className="h-full bg-cyber-cyan"
                          style={{ width: `${Math.min(100, (count / stats.assetCount) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generation Job Success Rate — real data only */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Activity className="w-4 h-4 text-cyber-cyan" />
                <span>Generation Job Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalJobs === 0 ? (
                <div className="text-center py-6 text-slate-500 text-[10px]">
                  No generation jobs recorded for this project yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-950 border border-white/5 rounded-lg text-center space-y-1">
                    <div className="text-slate-400 text-[10px] uppercase">Total Jobs</div>
                    <div className="text-2xl font-bold">{totalJobs}</div>
                  </div>
                  <div className="p-3 bg-slate-950 border border-emerald-500/20 rounded-lg text-center space-y-1">
                    <div className="flex items-center gap-1 justify-center text-emerald-400 text-[10px] uppercase">
                      <CheckCircle2 className="w-3 h-3" /> Succeeded
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">{stats.succeededJobs}</div>
                  </div>
                  <div className="p-3 bg-slate-950 border border-red-500/20 rounded-lg text-center space-y-1">
                    <div className="flex items-center gap-1 justify-center text-red-400 text-[10px] uppercase">
                      <XCircle className="w-3 h-3" /> Failed
                    </div>
                    <div className="text-2xl font-bold text-red-400">{stats.failedJobs}</div>
                  </div>
                </div>
              )}

              {successRate !== null && (
                <div className="mt-4 p-3 bg-slate-950 border border-white/5 rounded-lg space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Success Rate (measured)</span>
                    <span className="text-emerald-400 font-bold">{successRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${successRate}%` }} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
