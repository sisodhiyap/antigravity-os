"use client";

import React, { useState, useEffect, use } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import {
  FileText,
  Download,
  RefreshCw,
  Sparkles,
  Database,
  Target,
  Image as ImageIcon,
  Music,
  Video as VideoIcon,
  Box,
  AlertTriangle,
} from "lucide-react";

interface CaseStudyData {
  project: {
    id: string;
    name: string;
    description: string;
    brief?: string;
    createdAt: string;
    researchText?: string;
    strategyText?: string;
  };
  assets: {
    total: number;
    images: any[];
    audio: any[];
    video: any[];
    models: any[];
  };
  jobs: {
    total: number;
    succeeded: number;
    failed: number;
    providers: string[];
  };
  conversations: {
    total: number;
    messageCount: number;
  };
}

export default function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [data, setData] = useState<CaseStudyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const fetchCaseStudyData = async () => {
    setIsLoading(true);
    try {
      // Fetch project details
      const projRes = await fetch(`/api/omnicraft/projects/${id}`);
      const projJson = await projRes.json();
      if (!projJson.success) throw new Error(projJson.error);
      const project = projJson.data;

      // Fetch assets
      const assetsRes = await fetch(`/api/omnicraft/assets?projectId=${encodeURIComponent(id)}`);
      const assetsJson = await assetsRes.json();
      const assets: any[] = assetsJson.success ? assetsJson.data : [];

      // Fetch jobs
      const jobsRes = await fetch(`/api/omnicraft/jobs?projectId=${encodeURIComponent(id)}`);
      const jobsJson = await jobsRes.json();
      const jobs: any[] = jobsJson.success ? jobsJson.data : [];

      // Fetch conversations
      const convRes = await fetch(`/api/omnicraft/chat?projectId=${encodeURIComponent(id)}`);
      const convJson = await convRes.json();
      const conversations: any[] = convJson.success ? convJson.data : [];

      const images = assets.filter((a) => a.type === "IMAGE");
      const audio = assets.filter((a) => a.type === "AUDIO");
      const video = assets.filter((a) => a.type === "VIDEO");
      const models = assets.filter((a) => a.type === "MODEL_3D");

      const succeeded = jobs.filter((j) => j.status === "COMPLETED").length;
      const failed = jobs.filter((j) => j.status === "FAILED").length;
      const providers = [...new Set(jobs.map((j) => j.provider))];

      const messageCount = conversations.reduce((acc: number, c: any) => acc + (c.messages?.length || 0), 0);

      setData({
        project,
        assets: { total: assets.length, images, audio, video, models },
        jobs: { total: jobs.length, succeeded, failed, providers },
        conversations: { total: conversations.length, messageCount },
      });
    } catch (err: any) {
      console.error(err);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseStudyData();
  }, [id]);

  const handleExportMarkdown = async () => {
    if (!data) return;
    setIsExporting(true);
    setExportStatus(null);

    try {
      const res = await fetch(`/api/omnicraft/export?projectId=${encodeURIComponent(id)}&format=markdown`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${data.project.name.replace(/\s+/g, "_")}_case_study.md`;
        a.click();
        URL.revokeObjectURL(url);
        setExportStatus("Markdown exported successfully.");
      } else {
        const json = await res.json();
        setExportStatus(`Export failed: ${json.error}`);
      }
    } catch (err: any) {
      setExportStatus(`Export error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = async () => {
    if (!data) return;
    setIsExporting(true);
    setExportStatus(null);

    try {
      const res = await fetch(`/api/omnicraft/export?projectId=${encodeURIComponent(id)}&format=json`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${data.project.name.replace(/\s+/g, "_")}_export.json`;
        a.click();
        URL.revokeObjectURL(url);
        setExportStatus("JSON exported successfully.");
      } else {
        const json = await res.json();
        setExportStatus(`Export failed: ${json.error}`);
      }
    } catch (err: any) {
      setExportStatus(`Export error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-16 text-slate-500 text-xs font-mono animate-pulse">
        Building case study from database records...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-xs font-mono space-y-2">
        <AlertTriangle className="w-8 h-8 mx-auto text-red-400" />
        <p className="text-red-400">Failed to load case study data.</p>
        <Button onClick={fetchCaseStudyData} size="sm" variant="secondary">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono text-slate-100">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyber-cyan" />
            <h2 className="text-lg font-bold">CASE STUDY</h2>
          </div>
          <p className="text-xs text-slate-400">
            Auto-generated from real project database records. Only includes verified data.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={fetchCaseStudyData}
            variant="secondary"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button
            onClick={handleExportMarkdown}
            disabled={isExporting}
            size="sm"
            variant="secondary"
            className="gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Export MD
          </Button>
          <Button
            onClick={handleExportJson}
            disabled={isExporting}
            size="sm"
            className="gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </Button>
        </div>
      </div>

      {exportStatus && (
        <div className={`p-3 rounded-lg text-xs border ${exportStatus.includes("fail") || exportStatus.includes("error") ? "bg-red-950/20 border-red-500/20 text-red-400" : "bg-emerald-950/20 border-emerald-500/20 text-emerald-400"}`}>
          {exportStatus}
        </div>
      )}

      {/* Problem Statement */}
      <Card glow="cyan">
        <CardHeader>
          <CardTitle>
            <Sparkles className="w-4 h-4 text-cyber-cyan" />
            <span>1. Problem &amp; Project Brief</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-300 space-y-3">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Project Name</span>
            <span className="font-bold text-slate-200">{data.project.name}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Description</span>
            <p>{data.project.description || "No description provided."}</p>
          </div>
          {data.project.brief ? (
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Creative Brief</span>
              <p className="leading-relaxed whitespace-pre-wrap">{data.project.brief}</p>
            </div>
          ) : (
            <div className="p-3 bg-slate-950 border border-white/5 rounded text-slate-500 text-[10px]">
              No creative brief saved. Add one in the workspace settings.
            </div>
          )}
          <div className="text-[9px] text-slate-600">
            Project created: {new Date(data.project.createdAt).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Research */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Database className="w-4 h-4 text-cyber-cyan" />
            <span>2. Research &amp; Discovery</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs">
          {data.project.researchText ? (
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950 p-4 rounded-lg border border-white/5 max-h-64 overflow-y-auto">
              {data.project.researchText}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 space-y-1">
              <p className="text-[10px]">No research findings saved yet.</p>
              <p className="text-[9px] text-slate-600">Complete the UX Research tab to add findings here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Target className="w-4 h-4 text-cyber-cyan" />
            <span>3. Strategy &amp; Positioning</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs">
          {data.project.strategyText ? (
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950 p-4 rounded-lg border border-white/5 max-h-64 overflow-y-auto">
              {data.project.strategyText}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 space-y-1">
              <p className="text-[10px]">No strategy saved yet.</p>
              <p className="text-[9px] text-slate-600">Complete the Strategy tab to add content here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Media */}
      <Card>
        <CardHeader>
          <CardTitle>
            <ImageIcon className="w-4 h-4 text-cyber-cyan" />
            <span>4. Generated Media Assets</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Images", count: data.assets.images.length, icon: ImageIcon, color: "text-cyber-cyan" },
              { label: "Audio", count: data.assets.audio.length, icon: Music, color: "text-cyber-purple" },
              { label: "Video", count: data.assets.video.length, icon: VideoIcon, color: "text-cyber-cyan" },
              { label: "3D Models", count: data.assets.models.length, icon: Box, color: "text-cyber-cyan" },
            ].map(({ label, count, icon: Icon, color }) => (
              <div key={label} className="p-4 bg-slate-950 border border-white/10 rounded-xl text-center space-y-2">
                <Icon className={`w-6 h-6 mx-auto ${color}`} />
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-[10px] text-slate-500">{label}</div>
              </div>
            ))}
          </div>

          {data.assets.total === 0 && (
            <div className="mt-4 text-center py-4 text-slate-500 text-[10px]">
              No media assets generated yet. Use the Media Synth tab to create assets.
            </div>
          )}

          {/* Image gallery preview */}
          {data.assets.images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {data.assets.images.slice(0, 3).map((img) => (
                <div key={img.assetId} className="h-24 bg-slate-900 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
                  <img src={img.path} alt={img.altText || "Generated"} className="max-h-full object-contain" />
                </div>
              ))}
              {data.assets.images.length > 3 && (
                <div className="h-24 bg-slate-900 rounded-lg border border-white/10 flex items-center justify-center text-slate-500 text-[10px]">
                  +{data.assets.images.length - 3} more
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Sparkles className="w-4 h-4 text-cyber-cyan" />
            <span>5. AI Operations Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-950 border border-white/10 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-500 uppercase">Generation Jobs</span>
              <div className="text-xl font-bold">{data.jobs.total}</div>
              <div className="text-[9px] text-slate-600">
                {data.jobs.succeeded} succeeded · {data.jobs.failed} failed
              </div>
            </div>
            <div className="p-3 bg-slate-950 border border-white/10 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-500 uppercase">AI Conversations</span>
              <div className="text-xl font-bold">{data.conversations.messageCount}</div>
              <div className="text-[9px] text-slate-600">messages across {data.conversations.total} conversations</div>
            </div>
            <div className="p-3 bg-slate-950 border border-white/10 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-500 uppercase">Providers Used</span>
              <div className="text-xl font-bold">{data.jobs.providers.length || "—"}</div>
              <div className="text-[9px] text-slate-600">{data.jobs.providers.join(", ") || "No jobs recorded"}</div>
            </div>
          </div>

          {/* Business Results Disclaimer */}
          <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-lg">
            <p className="text-[10px] text-amber-400 font-bold uppercase mb-1">Business Outcome Data</p>
            <p className="text-[10px] text-slate-400">
              Business outcome data (conversion rates, revenue impact, user adoption) is not yet available.
              This section will populate once the campaign goes live and performance data is collected.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
