"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import {
  Sparkles,
  Layers,
  Cpu,
  Database,
  Briefcase,
  Plus,
  RefreshCw,
  FolderOpen,
} from "lucide-react";

export default function DashboardOverviewPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const loadData = async () => {
    try {
      const userStr = typeof window !== "undefined" ? localStorage.getItem("omnicraft_user") : null;
      const email = userStr ? JSON.parse(userStr).email : "";

      const pRes = await fetch(`/api/omnicraft/projects?email=${encodeURIComponent(email)}`);
      const pJson = await pRes.json();
      if (pJson.success) setProjects(pJson.data);

      const aRes = await fetch("/api/omnicraft/assets");
      const aJson = await aRes.json();
      if (aJson.success) setAssets(aJson.data);

      const provRes = await fetch("/api/omnicraft/providers");
      const provJson = await provRes.json();
      if (provJson.success) {
        setProviders(provJson.data.providers);
        // Extract jobs
        const jRes = await fetch("/api/tasks");
        const jJson = await jRes.json();
        if (jJson.success) setJobs(jJson.data);
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    setIsCreating(true);

    const userStr = typeof window !== "undefined" ? localStorage.getItem("omnicraft_user") : null;
    const email = userStr ? JSON.parse(userStr).email : "";

    try {
      const res = await fetch("/api/omnicraft/projects", {
        method: "POST",
        body: JSON.stringify({ name: newProjectName, description: newProjectDesc, email }),
      });
      const json = await res.json();
      if (json.success) {
        setNewProjectName("");
        setNewProjectDesc("");
        loadData();
      }
    } catch (_) {} finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-slate-100">
      {/* Top Welcome Ribbon */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyber-cyan" />
            <span>OMNICRAFT ENTERPRISE DASHBOARD</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-tenant project directory, gateway telemetry, and persistent assets.
          </p>
        </div>

        <Button onClick={loadData} variant="secondary" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Overview</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Side: Create Project & Project Directory */}
        <div className="xl:col-span-2 space-y-6">
          <Card glow="cyan">
            <CardHeader>
              <CardTitle>
                <Plus className="w-4 h-4 text-cyber-cyan" />
                <span>Initialize New Campaign Project</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Project Name</label>
                  <input
                    type="text"
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g. Q4 Brand Launch Video Campaign"
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyber-cyan text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Description</label>
                  <input
                    type="text"
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    placeholder="Brief description of goals and channels..."
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyber-cyan text-slate-200"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={isCreating || !newProjectName} className="w-full">
                    <span>{isCreating ? "INITIALIZING..." : "CREATE PROJECT"}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <FolderOpen className="w-4 h-4 text-cyber-cyan" />
                <span>Campaign Projects Directory</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-10 text-slate-500 space-y-2">
                  <Briefcase className="w-8 h-8 mx-auto text-slate-700" />
                  <p className="text-xs">No projects yet.</p>
                  <p className="text-[10px] text-slate-600">Create your first campaign project workspace above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((p) => (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      className="p-4 rounded-xl bg-slate-950 hover:bg-white/5 border border-white/10 hover:border-cyber-cyan/30 transition-all flex flex-col justify-between h-32"
                    >
                      <div>
                        <div className="font-bold text-slate-200 text-xs truncate">{p.name}</div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{p.description || "No description provided."}</p>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-white/5 pt-2 mt-2">
                        <span>ID: {p.id}</span>
                        <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Active Telemetry and Gateway Status */}
        <div className="space-y-6">
          <Card glow="purple">
            <CardHeader>
              <CardTitle>
                <Cpu className="w-4 h-4 text-cyber-purple" />
                <span>AI Gateway Health Registry</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              {providers.length === 0 ? (
                <div className="text-slate-500 text-[10px]">No active providers checked.</div>
              ) : (
                providers.map((p) => (
                  <div key={p.providerId} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-white/5">
                    <div>
                      <span className="text-slate-300 font-bold block">{p.name}</span>
                      <span className="text-[9px] text-slate-500">{p.category}</span>
                    </div>
                    <Badge variant={p.healthState === "HEALTHY" ? "neon" : "purple"}>
                      {p.executionMode === "LOCAL" ? "LOCAL" : p.healthState}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Database className="w-4 h-4 text-cyber-cyan" />
                <span>Media Assets Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Total Registered Assets</span>
                <span className="text-slate-200 font-bold">{assets.length}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Images Synthesized</span>
                <span className="text-slate-200 font-bold">{assets.filter((a) => a.type === "IMAGE").length}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-400">Audio Narrations</span>
                <span className="text-slate-200 font-bold">{assets.filter((a) => a.type === "AUDIO").length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Video reels & 3D models</span>
                <span className="text-slate-200 font-bold">
                  {assets.filter((a) => a.type === "VIDEO" || a.type === "MODEL_3D").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
