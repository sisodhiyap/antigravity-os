"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { FolderKanban, Plus, RefreshCw, FolderOpen, Briefcase } from "lucide-react";

export default function ProjectsDirectoryPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [brief, setBrief] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      // Uses session cookie auth — no email needed in URL
      const res = await fetch("/api/omnicraft/projects");
      const json = await res.json();
      if (json.success) setProjects(json.data);
    } catch (_) {}
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsCreating(true);

    try {
      const res = await fetch("/api/omnicraft/projects", {
        method: "POST",
        body: JSON.stringify({ name, description: desc, brief }),
      });
      const json = await res.json();
      if (json.success) {
        setName("");
        setDesc("");
        setBrief("");
        fetchProjects();
      }
    } catch (_) {} finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-slate-100">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-cyber-cyan" />
            <span>PROJECTS CAMPAIGN DIRECTORY</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access, structure, and orchestrate campaign content workspaces.
          </p>
        </div>

        <Button onClick={fetchProjects} variant="secondary" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          <span>Sync Directory</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <FolderOpen className="w-4 h-4 text-cyber-cyan" />
                <span>Active Campaign Workspaces ({projects.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <Briefcase className="w-10 h-10 mx-auto text-slate-700" />
                  <p className="text-xs">No active projects found.</p>
                  <p className="text-[10px] text-slate-600">Complete the form on the right to initialize your first campaign workspace.</p>
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
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                          {p.brief || p.description || "No brief provided."}
                        </p>
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

        {/* Create Form */}
        <Card glow="purple">
          <CardHeader>
            <CardTitle>
              <Plus className="w-4 h-4 text-cyber-purple" />
              <span>Initialize Workspace</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q4 Growth Sprint Ad Reel"
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyber-cyan text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Campaign Objective</label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="One-line objective summary"
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyber-cyan text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Creative Brief (optional)</label>
                <textarea
                  rows={4}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Describe target channels, audience, brand voice, KPIs, and creative direction..."
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyber-cyan text-slate-200"
                />
              </div>
              <Button type="submit" disabled={isCreating || !name} className="w-full">
                <span>{isCreating ? "PROVISIONING..." : "INITIALIZE WORKSPACE"}</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
