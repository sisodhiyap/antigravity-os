"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Cpu, 
  Layers, 
  GitBranch, 
  Video, 
  Image as ImageIcon, 
  Music, 
  Globe, 
  Terminal, 
  Play, 
  ExternalLink, 
  Trash2, 
  Server, 
  ShieldCheck, 
  Activity,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface Project {
  projectName: string;
  blueprint: {
    name: string;
    type: string;
    title: string;
    description: string;
    designSystem: {
      bgGradient: string;
    };
    pages: string[];
    features: string[];
  };
  generatedAt: string;
}

export default function ProductFactoryDashboard() {
  // Website Factory Inputs
  const [projName, setProjName] = useState("");
  const [projPrompt, setProjPrompt] = useState("");
  const [projType, setProjType] = useState("landing");
  const [projTheme, setProjTheme] = useState("cyber");
  
  // Status states
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  
  // Deployment Statuses
  const [deployingProject, setDeployingProject] = useState<string | null>(null);
  const [deploymentResults, setDeploymentResults] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchProjects();
    fetchAssets();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/factory/projects");
      const json = await res.json();
      if (json.success) {
        setProjects(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await fetch("/api/tasks");
      const json = await res.json();
      if (json.success) {
        setAssets(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load assets:", err);
    }
  };

  const handleBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim() || !projPrompt.trim()) return;

    setIsBuilding(true);
    setBuildLogs([
      "Initializing AI Website Generation Pipeline...",
      "Analyzing user requirements & prompt content...",
      "Formulating custom structural blueprint...",
      "Synthesizing visual assets planner (Image & Video timeline)...",
    ]);

    try {
      // Step-by-step logs simulation for UX
      setTimeout(() => setBuildLogs(prev => [...prev, "Invoking AI router for copy generation..."]), 1000);
      setTimeout(() => setBuildLogs(prev => [...prev, "Applying Design system theme tokens..."]), 2000);
      setTimeout(() => setBuildLogs(prev => [...prev, "Writing dynamic Next.js code page files..."]), 3000);

      const res = await fetch("/api/factory/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projName,
          type: projType,
          prompt: projPrompt,
          theme: projTheme
        })
      });

      const json = await res.json();
      if (json.success) {
        setBuildLogs(prev => [
          ...prev,
          `✅ Dynamic Website code page generated at: ${json.data.codePath}`,
          "✅ Blueprint registered under .antigravity/projects/",
          "🎉 Product build finalized and routable!"
        ]);
        setProjName("");
        setProjPrompt("");
        fetchProjects();
      } else {
        setBuildLogs(prev => [...prev, `❌ Error: ${json.error}`]);
      }
    } catch (err: any) {
      setBuildLogs(prev => [...prev, `❌ Network error: ${err.message}`]);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleDeploy = async (name: string, provider: string) => {
    setDeployingProject(name);
    try {
      const res = await fetch("/api/factory/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName: name, provider })
      });
      const json = await res.json();
      if (json.success) {
        setDeploymentResults(prev => ({
          ...prev,
          [name]: json.data
        }));
      }
    } catch (err: any) {
      alert(`Deployment failed: ${err.message}`);
    } finally {
      setDeployingProject(null);
    }
  };

  return (
    <div className="space-y-8 pb-12 font-mono">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/30 border border-white/5 rounded-2xl backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyber-cyan shadow-glow-cyan" />
            <span>SOVEREIGN PRODUCT & CREATIVE DEPLOYMENT FACTORY</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sovereign Next.js layout engine, visual assets pipeline, Git checkpoints, and Vercel automation.
          </p>
        </div>
        <div className="flex gap-2 text-[10px] text-slate-400">
          <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span>GIT: ACTIVE</span>
          </div>
          <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-pink-400" />
            <span>VERCEL: READY</span>
          </div>
        </div>
      </div>

      {/* 8-STAGE VISUAL PIPELINE PROGRESSION RIBBON */}
      <div className="glass-panel p-4 rounded-2xl border border-cyber-cyan/30 space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span className="font-bold text-cyber-cyan">AUTONOMOUS WEBSITE GENERATION PIPELINE</span>
          <span>8-Stage Deterministic Progression</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-[11px] font-mono">
          {[
            { step: 1, name: "PROMPT", status: "READY" },
            { step: 2, name: "UNDERSTAND", status: isBuilding ? "ACTIVE" : "READY" },
            { step: 3, name: "BLUEPRINT", status: isBuilding ? "ACTIVE" : "READY" },
            { step: 4, name: "DESIGN", status: isBuilding ? "ACTIVE" : "READY" },
            { step: 5, name: "ASSETS", status: isBuilding ? "ACTIVE" : "READY" },
            { step: 6, name: "CODE", status: isBuilding ? "ACTIVE" : "READY" },
            { step: 7, name: "QA", status: "READY" },
            { step: 8, name: "DEPLOY", status: "VERCEL" },
          ].map((s) => (
            <div
              key={s.step}
              className={`p-2 rounded-xl border text-center transition-all ${
                s.status === "ACTIVE"
                  ? "bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan font-bold animate-pulse"
                  : "bg-slate-950/60 border-white/5 text-slate-400"
              }`}
            >
              <div className="text-[9px] text-slate-500">{s.step}. STAGE</div>
              <div className="font-bold">{s.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Website Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-md space-y-6">
            <h2 className="text-sm font-bold text-slate-200 border-b border-white/5 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyber-cyan" />
              <span>SYNTHESIZE NEW AI WEBSITE PRODUCT</span>
            </h2>

            <form onSubmit={handleBuild} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">PROJECT CODENAME</label>
                  <input
                    type="text"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="e.g. portfolio-ai-studio"
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">PRODUCT TYPE</label>
                    <select
                      value={projType}
                      onChange={(e) => setProjType(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-300"
                    >
                      <option value="landing">Landing Page</option>
                      <option value="portfolio">AI Portfolio</option>
                      <option value="agency">Agency Site</option>
                      <option value="studio">Production Studio</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">DESIGN THEME</label>
                    <select
                      value={projTheme}
                      onChange={(e) => setProjTheme(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-300"
                    >
                      <option value="cyber">Cyber Cyan</option>
                      <option value="neon">Neon Emerald</option>
                      <option value="glass">Indigo Glass</option>
                      <option value="retro">Amber Retro</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">NATURAL LANGUAGE DIRECTIVE</label>
                <textarea
                  value={projPrompt}
                  onChange={(e) => setProjPrompt(e.target.value)}
                  placeholder="Describe the website, pages, copywriting, and graphics requirements..."
                  className="w-full h-24 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isBuilding}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-purple text-slate-950 font-bold text-xs hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(0,240,255,0.4)]"
              >
                {isBuilding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SYNTHESIZING & VALIDATING DYNAMIC CODE...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>COMPILE & INJECT INTO NEXT.JS PLATFORM</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Active Projects List */}
          <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-md space-y-6">
            <h2 className="text-sm font-bold text-slate-200 border-b border-white/5 pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-pink-400" />
              <span>ACTIVE SYNTHESIZED PROJECTS</span>
            </h2>

            {projects.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No generated projects found under .antigravity/projects.
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((proj, idx) => {
                  const name = proj.projectName;
                  const isDeploying = deployingProject === name;
                  const deployRecord = deploymentResults[name];

                  return (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{name}</span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 uppercase">
                            {proj.blueprint.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 max-w-md">
                          {proj.blueprint.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`/generated/${name}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs flex items-center gap-1 text-cyan-400 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>PREVIEW</span>
                        </a>

                        <button
                          onClick={() => handleDeploy(name, "Vercel")}
                          disabled={isDeploying}
                          className="px-3 py-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-xs flex items-center gap-1 text-pink-400 transition-colors"
                        >
                          {isDeploying ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Globe className="w-3.5 h-3.5" />
                          )}
                          <span>DEPLOY</span>
                        </button>
                      </div>

                      {deployRecord && (
                        <div className="w-full mt-2 pt-2 border-t border-white/5 text-[9px] text-slate-400 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>STATUS: <span className="text-emerald-400 font-bold">[{deployRecord.status}]</span></span>
                            <span>COMMIT: <span className="font-mono text-cyan-400">{deployRecord.commitHash?.slice(0, 7)}</span></span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>URL: <a href={deployRecord.url} target="_blank" rel="noreferrer" className="text-cyan-400 underline">{deployRecord.url}</a></span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Logs & Visual Assets Library */}
        <div className="space-y-6">
          {/* Output Logs Terminal */}
          <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-md space-y-4">
            <h2 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>FACTORY LOG OUTPUTS</span>
            </h2>

            <div className="h-40 rounded-xl bg-slate-950 p-3.5 border border-white/5 font-mono text-[9px] text-slate-400 overflow-y-auto space-y-1">
              {buildLogs.length === 0 ? (
                <div className="text-slate-600">Awaiting compilation request...</div>
              ) : (
                buildLogs.map((log, idx) => (
                  <div key={idx} className={log.startsWith("❌") ? "text-rose-400" : log.startsWith("✅") || log.startsWith("🎉") ? "text-emerald-400" : "text-slate-400"}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Providers & Registry Metrics */}
          <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-md space-y-4">
            <h2 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-pink-400" />
              <span>AI PROVIDERS LATENCY REGISTRY</span>
            </h2>

            <div className="space-y-2 text-[10px]">
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-white/5 flex items-center justify-between">
                <span>Ollama (qwen2.5-coder:14b)</span>
                <span className="text-slate-400 font-bold">~22.7s [ONLINE]</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-white/5 flex items-center justify-between">
                <span>OpenRouter (nemotron-3.5-lightning:free)</span>
                <span className="text-emerald-400 font-bold">~600ms [LIVE]</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-white/5 flex items-center justify-between">
                <span>DeepSeek Cloud</span>
                <span className="text-rose-400 font-bold">[AUTH_FAIL_401]</span>
              </div>
            </div>
          </div>

          {/* Visual Assets Library */}
          <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-md space-y-4">
            <h2 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>CREATIVE ASSET REGISTER</span>
            </h2>

            <div className="space-y-3">
              {/* Generated Images */}
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Images generated</span>
                </div>
                <div className="rounded-lg overflow-hidden border border-white/10 bg-slate-950 p-1 flex items-center justify-center">
                  <img src="/generated-assets/images/img_1787464656222_33869123.svg" className="h-16 w-auto max-w-full" alt="Generated SVG Preview" />
                </div>
              </div>

              {/* Generated Videos */}
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
                  <Video className="w-3.5 h-3.5 text-pink-400" />
                  <span>Videos generated</span>
                </div>
                <div className="text-[9px] text-slate-400 flex items-center justify-between p-1 bg-slate-950/60 rounded">
                  <span className="truncate">vid_1787464656314_70f4d4e0.webm</span>
                  <span className="text-emerald-400">READY</span>
                </div>
              </div>

              {/* Audio Synthesis */}
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
                  <Music className="w-3.5 h-3.5 text-purple-400" />
                  <span>Audio Speech output</span>
                </div>
                <div className="text-[9px] text-slate-400 flex items-center justify-between p-1 bg-slate-950/60 rounded">
                  <span className="truncate">aud_1787464656342_28f598c9.wav</span>
                  <span className="text-emerald-400">READY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
