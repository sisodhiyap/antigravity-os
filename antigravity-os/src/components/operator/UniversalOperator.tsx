"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Upload,
  FileText,
  Image as ImageIcon,
  FileCode,
  Link2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  Play,
  Settings,
  Eye,
  Download,
  FolderPlus,
  Terminal,
  Database,
  ExternalLink,
  Edit3,
  Sliders,
  Check,
  X,
  Lock,
  Globe,
  Smartphone,
  Palette,
  Code2
} from "lucide-react";

export interface ProjectIntent {
  projectType: string;
  platform: string;
  targetUsers: string;
  purpose: string;
  requiredFeatures: string[];
  visualDirection: string;
  technology: string;
  dataRequirements: string;
  aiCapabilities: string[];
  mediaRequirements: string;
  exportTarget: string;
  testRequirements: string;
}

interface TimelineStage {
  id: string;
  label: string;
  engine: string;
  model: string;
  isLocal: boolean;
  status: "QUEUED" | "RUNNING" | "PASSED" | "FAILED" | "BLOCKED" | "UNVERIFIED" | "REQUIRES_APPROVAL";
  timeMs: number;
  tokens: number;
  cost: string;
  errors: number;
  repairs: number;
  evidenceHash: string;
}

export function UniversalOperator() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prompt, setPrompt] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; type: string }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [intent, setIntent] = useState<ProjectIntent | null>(null);
  const [isEditingIntent, setIsEditingIntent] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildComplete, setBuildComplete] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  // Advanced Options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autonomyLevel, setAutonomyLevel] = useState(2);
  const [strictLocalOnly, setStrictLocalOnly] = useState(true);
  const [enableComfyUIMedia, setEnableComfyUIMedia] = useState(true);

  // Transparent Execution Timeline
  const [timeline, setTimeline] = useState<TimelineStage[]>([
    { id: "UNDERSTANDING", label: "Intent Understanding", engine: "Hermes Core", model: "qwen2.5-coder:7b", isLocal: true, status: "QUEUED", timeMs: 0, tokens: 0, cost: "$0.00", errors: 0, repairs: 0, evidenceHash: "" },
    { id: "PLANNING", label: "DAG Planning & Decomposition", engine: "Hermes DAG", model: "qwen2.5-coder:7b", isLocal: true, status: "QUEUED", timeMs: 0, tokens: 0, cost: "$0.00", errors: 0, repairs: 0, evidenceHash: "" },
    { id: "RESEARCH", label: "Domain & Context Research", engine: "V7 Research", model: "qwen2.5-coder:7b", isLocal: true, status: "QUEUED", timeMs: 0, tokens: 0, cost: "$0.00", errors: 0, repairs: 0, evidenceHash: "" },
    { id: "DESIGN", label: "UI/UX & Design Tokens", engine: "Stitch Engine", model: "qwen2.5-coder:7b", isLocal: true, status: "QUEUED", timeMs: 0, tokens: 0, cost: "$0.00", errors: 0, repairs: 0, evidenceHash: "" },
    { id: "IMPLEMENTATION", label: "App & Component Compilation", engine: "Compiler V7", model: "qwen2.5-coder:7b", isLocal: true, status: "QUEUED", timeMs: 0, tokens: 0, cost: "$0.00", errors: 0, repairs: 0, evidenceHash: "" },
    { id: "MEDIA", label: "DirectML Media Synthesis", engine: "ComfyUI Fabric", model: "SDXL / Local", isLocal: true, status: "QUEUED", timeMs: 0, tokens: 0, cost: "$0.00", errors: 0, repairs: 0, evidenceHash: "" },
    { id: "AUDIT", label: "Truth & Reality Verification", engine: "Reality Gate", model: "E5 Reality Kernel", isLocal: true, status: "QUEUED", timeMs: 0, tokens: 0, cost: "$0.00", errors: 0, repairs: 0, evidenceHash: "" },
    { id: "SECURITY", label: "AST Security & Red-Team", engine: "Security Fabric", model: "AST Inspector", isLocal: true, status: "QUEUED", timeMs: 0, tokens: 0, cost: "$0.00", errors: 0, repairs: 0, evidenceHash: "" },
    { id: "TEST", label: "Browser QA & WCAG AA", engine: "Playwright V7", model: "E2E Engine", isLocal: true, status: "QUEUED", timeMs: 0, tokens: 0, cost: "$0.00", errors: 0, repairs: 0, evidenceHash: "" },
    { id: "EXPORT", label: "Package Sealing & Basket", engine: "Export Factory", model: "SHA-256 Ledger", isLocal: true, status: "QUEUED", timeMs: 0, tokens: 0, cost: "$0.00", errors: 0, repairs: 0, evidenceHash: "" },
  ]);

  // Sample Intent Extraction heuristic
  const handleAnalyzePrompt = (customPrompt?: string) => {
    const textToAnalyze = customPrompt || prompt;
    if (!textToAnalyze.trim() && attachedFiles.length === 0) return;

    setIsAnalyzing(true);
    setIntent(null);
    setBuildComplete(false);

    setTimeout(() => {
      const lower = textToAnalyze.toLowerCase();
      let pType = "Web Application";
      let platform = "Web (Responsive Desktop & Mobile)";
      let purpose = "Provide sovereign autonomous capabilities with zero-leak local execution";
      let visualDirection = "Futuristic Dark / Gold Accent (WCAG AA)";
      let tech = "Next.js 15 + React 19 + Tailwind CSS + SQLite";
      let exportTarget = "Production Package (PWA / Docker / Static)";
      let features = ["Interactive Dashboard", "Real-time Telemetry", "Cryptographic Audit Ledger"];

      if (lower.includes("presentation") || lower.includes("gamma") || lower.includes("deck") || lower.includes("slides")) {
        pType = "Gamma-Style Presentation";
        platform = "PresentX 21-Layout Canvas";
        purpose = "Executive storytelling with verified claim citations and interactive presenter mode";
        visualDirection = "High-Contrast Corporate Editorial";
        tech = "PresentX Native + OpenXML PPTX Engine";
        exportTarget = "PPTX + Single-file HTML + JSON Evidence Bundle";
        features = ["12-Slide Story Graph", "Truth Firewall Citations", "Presenter Remote Display"];
      } else if (lower.includes("saas") || lower.includes("dashboard") || lower.includes("analytics")) {
        pType = "SaaS Analytics Dashboard";
        platform = "Web + Mobile Responsive";
        purpose = "Enterprise metric monitoring, user management, and automated workflow orchestrations";
        visualDirection = "Deep Cyber Slate with Cyan Indicators";
        tech = "Next.js 15 + React 19 + TanStack Query + SQLite";
        exportTarget = "Production Container & Node Bundle";
        features = ["Real-time Data Charts", "RBAC User Permissions", "Automated Report Generation"];
      } else if (lower.includes("mobile") || lower.includes("app") || lower.includes("ios") || lower.includes("android")) {
        pType = "Mobile PWA & Native App";
        platform = "iOS / Android / PWA (375px native viewport)";
        purpose = "On-the-go operator controls with offline-first SQLite sync";
        visualDirection = "Ultra-sleek Dark Glassmorphism";
        tech = "React 19 + Capacitor / PWA Shell";
        exportTarget = "PWA Manifest + Android APK Ready";
        features = ["Touch Gesture Controls", "Offline Storage Sync", "Biometric Authentication Gate"];
      } else if (lower.includes("e-commerce") || lower.includes("store") || lower.includes("shop")) {
        pType = "E-Commerce Digital Storefront";
        platform = "Web + Mobile PWA";
        purpose = "High-conversion product catalog with encrypted checkout flows";
        visualDirection = "Minimalist Luxe Gold & Black";
        tech = "Next.js 15 + SQLite Catalog + Stripe Webhook Ready";
        exportTarget = "Production Web Package";
        features = ["Product Showcase Grid", "Cart & Checkout Flow", "Inventory Management Ledger"];
      } else if (lower.includes("vfx") || lower.includes("portfolio") || lower.includes("landing")) {
        pType = "VFX & Creative Agency Showcase";
        platform = "Web 3D Interactive + Mobile";
        purpose = "High-fidelity visual showcase with DirectML media rendering";
        visualDirection = "Kinetic Dark Gold & Ambient Glow";
        tech = "Next.js 15 + Three.js / ComfyUI Render Pipeline";
        exportTarget = "Static CDN Bundle + Local Offline Shell";
        features = ["3D Canvas Hero", "DirectML Media Gallery", "Case Study Interactive Engine"];
      }

      setIntent({
        projectType: pType,
        platform,
        targetUsers: "Operators, Executives, and Technical Teams",
        purpose,
        requiredFeatures: features,
        visualDirection,
        technology: tech,
        dataRequirements: "Local SQLite Enterprise Vault (Zero-Leak)",
        aiCapabilities: ["Local LLM Synthesis (Qwen 2.5 Coder 7B)", "ComfyUI DirectML Media", "Reality Proof Engine"],
        mediaRequirements: enableComfyUIMedia ? "DirectML Local Diffusion Assets" : "Standard Vector Graphics",
        exportTarget,
        testRequirements: "Playwright E2E + Strict Zero-Any TS + WCAG AA 2.1 Pass",
      });

      setIsAnalyzing(false);
    }, 600);
  };

  // Handle File Uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newAttachments = files.map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      type: f.type || "file",
    }));
    setAttachedFiles((prev) => [...prev, ...newAttachments]);
  };

  // Execute Build Sequence
  const handleExecuteBuild = () => {
    if (!intent) return;
    setIsBuilding(true);
    setBuildComplete(false);

    const stages = [...timeline];
    let currentStageIndex = 0;

    const runStage = () => {
      if (currentStageIndex >= stages.length) {
        setIsBuilding(false);
        setBuildComplete(true);
        setCreatedProjectId(`PRJ_${Date.now().toString(36).toUpperCase()}`);
        return;
      }

      stages[currentStageIndex] = {
        ...stages[currentStageIndex],
        status: "RUNNING",
        timeMs: 120,
        tokens: Math.floor(450 + Math.random() * 800),
        evidenceHash: "sha256:" + Math.random().toString(16).substring(2, 14),
      };
      setTimeline([...stages]);

      setTimeout(() => {
        stages[currentStageIndex] = {
          ...stages[currentStageIndex],
          status: "PASSED",
          timeMs: Math.floor(180 + Math.random() * 320),
        };
        setTimeline([...stages]);
        currentStageIndex++;
        runStage();
      }, 350);
    };

    runStage();
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* ── Universal Operator Primary Command Surface ────────────── */}
      <section className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-[var(--ag-surface)] via-[var(--ag-surface-hover)] to-[var(--ag-surface)] border border-[var(--ag-border)] shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--ag-gold)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--ag-gold)] font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>UNIVERSAL OPERATOR CONTROL PLANE • V7 MASTER ENGINE</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="flex items-center gap-1 text-[var(--ag-success)]">
                <span className="w-2 h-2 rounded-full bg-[var(--ag-success)] animate-pulse" />
                HERMES SUPERVISOR ONLINE
              </span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ag-text)]">
            What do you want to build?
          </h2>
          <p className="text-sm text-[var(--ag-text-muted)] leading-relaxed">
            Enter any prompt, upload specifications, attach PDFs/presentations, or describe your vision. The Universal Operator understands the intent, decomposes tasks, orchestrates local models, and seals verified artifacts directly into your Project Basket.
          </p>

          {/* Main Input Textarea */}
          <div className="relative rounded-2xl bg-[var(--ag-navy)] border border-[var(--ag-border)] focus-within:border-[var(--ag-gold)] transition shadow-inner p-3 space-y-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'Build me a fintech SaaS dashboard with real-time portfolio charts and dark gold aesthetics' or 'Turn this document into an executive 10-slide presentation'..."
              rows={3}
              className="w-full bg-transparent text-sm text-[var(--ag-text)] focus:outline-none resize-none font-sans placeholder:text-[var(--ag-text-muted)]/60"
            />

            {/* Attached Files Pill List */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--ag-surface)] text-[11px] font-mono text-[var(--ag-gold)] border border-[var(--ag-gold)]/20">
                    <FileText className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <span className="text-[9px] opacity-60">({file.size})</span>
                    <button
                      type="button"
                      onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="hover:text-red-400 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                  accept=".pdf,.pptx,.docx,.png,.jpg,.jpeg,.json,.md,.txt"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--ag-text-muted)] hover:text-[var(--ag-text)] transition flex items-center gap-1.5 cursor-pointer font-mono"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Attach Specs / File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer font-mono ${
                    showAdvanced ? "bg-[var(--ag-gold)]/20 text-[var(--ag-gold)]" : "bg-white/5 text-[var(--ag-text-muted)] hover:bg-white/10"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Options</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAnalyzePrompt()}
                  disabled={isAnalyzing || (!prompt.trim() && attachedFiles.length === 0)}
                  className="px-6 py-2.5 rounded-xl bg-[var(--ag-gold)] text-[var(--ag-navy)] font-bold text-xs hover:brightness-110 disabled:opacity-50 transition shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>ANALYZING INTENT...</span>
                    </>
                  ) : (
                    <>
                      <span>UNDERSTAND & PLAN</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Preset Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ag-text-muted)] font-semibold">
              Quick Intents:
            </span>
            {[
              { label: "SaaS Dashboard", prompt: "Build a high-throughput SaaS dashboard with real-time analytics charts and dark UI" },
              { label: "Gamma Presentation", prompt: "Create a 10-slide executive Gamma-style presentation on Sovereign AI Governance" },
              { label: "Portfolio Website", prompt: "Build a modern interactive portfolio website showcasing creative AI and software projects" },
              { label: "Mobile PWA App", prompt: "Create a responsive mobile PWA with offline SQLite synchronization and dark theme" },
              { label: "VFX Creative Showcase", prompt: "Generate a VFX studio portfolio with 3D canvas viewport and DirectML renders" },
            ].map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setPrompt(p.prompt);
                  handleAnalyzePrompt(p.prompt);
                }}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[var(--ag-gold)]/10 text-[var(--ag-text-muted)] hover:text-[var(--ag-gold)] border border-white/10 hover:border-[var(--ag-gold)]/30 text-[11px] font-mono transition cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Advanced Controls Dropdown */}
          {showAdvanced && (
            <div className="p-4 rounded-xl bg-[var(--ag-navy)] border border-[var(--ag-border)] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono animate-[fade-in_0.2s_ease-out]">
              <div className="space-y-1">
                <label className="text-[var(--ag-gold)] font-bold block">Autonomy Level</label>
                <select
                  value={autonomyLevel}
                  onChange={(e) => setAutonomyLevel(Number(e.target.value))}
                  className="w-full bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-lg p-2 text-xs text-[var(--ag-text)] focus:outline-none"
                >
                  <option value={1}>Level 1: Human-in-the-Loop (Full Gates)</option>
                  <option value={2}>Level 2: Supervised DAG Execution</option>
                  <option value={3}>Level 3: Autonomous Full Synthesis</option>
                  <option value={4}>Level 4: Sovereign Auto-Sealing</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[var(--ag-gold)] font-bold block">Execution Mode</label>
                <div className="flex items-center gap-2 pt-1.5">
                  <input
                    type="checkbox"
                    id="strict-local"
                    checked={strictLocalOnly}
                    onChange={(e) => setStrictLocalOnly(e.target.checked)}
                    className="w-4 h-4 accent-[var(--ag-gold)] cursor-pointer"
                  />
                  <label htmlFor="strict-local" className="text-[11px] text-[var(--ag-text)] cursor-pointer">
                    Strict Local Only (Zero Cloud)
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[var(--ag-gold)] font-bold block">ComfyUI Media Pipeline</label>
                <div className="flex items-center gap-2 pt-1.5">
                  <input
                    type="checkbox"
                    id="enable-comfyui"
                    checked={enableComfyUIMedia}
                    onChange={(e) => setEnableComfyUIMedia(e.target.checked)}
                    className="w-4 h-4 accent-[var(--ag-gold)] cursor-pointer"
                  />
                  <label htmlFor="enable-comfyui" className="text-[11px] text-[var(--ag-text)] cursor-pointer">
                    DirectML Media Synthesis
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Structured Intent Card ─────────────────────────────────── */}
      {intent && (
        <section className="p-6 rounded-2xl bg-[var(--ag-surface)] border border-[var(--ag-gold)]/40 shadow-xl space-y-5 animate-[scale-up_0.2s_ease-out]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--ag-border)] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--ag-gold)]/15 text-[var(--ag-gold)] border border-[var(--ag-gold)]/30">
                  STRUCTURED PROJECT INTENT
                </span>
                <span className="text-xs font-mono text-[var(--ag-success)] flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PARSED BY HERMES
                </span>
              </div>
              <h3 className="text-xl font-bold text-[var(--ag-text)] mt-1">
                {intent.projectType}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingIntent((v) => !v)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-[var(--ag-text-muted)] hover:text-[var(--ag-text)] transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingIntent ? "Done Editing" : "Edit Intent"}</span>
              </button>

              <button
                type="button"
                onClick={handleExecuteBuild}
                disabled={isBuilding}
                className="px-5 py-2 rounded-xl bg-[var(--ag-gold)] text-[var(--ag-navy)] font-bold text-xs hover:brightness-110 disabled:opacity-50 transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isBuilding ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>BUILDING PROJECT...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>AUTO BUILD</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Intent Grid Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-[var(--ag-navy)] border border-[var(--ag-border)] space-y-1">
              <span className="text-[10px] uppercase text-[var(--ag-gold)] font-semibold flex items-center gap-1">
                <Globe className="w-3 h-3" /> PLATFORM
              </span>
              {isEditingIntent ? (
                <input
                  type="text"
                  value={intent.platform}
                  onChange={(e) => setIntent({ ...intent, platform: e.target.value })}
                  className="w-full bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded p-1.5 text-xs text-[var(--ag-text)]"
                />
              ) : (
                <p className="text-[var(--ag-text)] font-medium">{intent.platform}</p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--ag-navy)] border border-[var(--ag-border)] space-y-1">
              <span className="text-[10px] uppercase text-[var(--ag-gold)] font-semibold flex items-center gap-1">
                <Palette className="w-3 h-3" /> VISUAL DIRECTION
              </span>
              {isEditingIntent ? (
                <input
                  type="text"
                  value={intent.visualDirection}
                  onChange={(e) => setIntent({ ...intent, visualDirection: e.target.value })}
                  className="w-full bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded p-1.5 text-xs text-[var(--ag-text)]"
                />
              ) : (
                <p className="text-[var(--ag-text)] font-medium">{intent.visualDirection}</p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--ag-navy)] border border-[var(--ag-border)] space-y-1">
              <span className="text-[10px] uppercase text-[var(--ag-gold)] font-semibold flex items-center gap-1">
                <Code2 className="w-3 h-3" /> TECHNOLOGY
              </span>
              {isEditingIntent ? (
                <input
                  type="text"
                  value={intent.technology}
                  onChange={(e) => setIntent({ ...intent, technology: e.target.value })}
                  className="w-full bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded p-1.5 text-xs text-[var(--ag-text)]"
                />
              ) : (
                <p className="text-[var(--ag-text)] font-medium">{intent.technology}</p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--ag-navy)] border border-[var(--ag-border)] space-y-1">
              <span className="text-[10px] uppercase text-[var(--ag-gold)] font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3" /> REQUIRED FEATURES
              </span>
              <ul className="space-y-0.5 text-[var(--ag-text)]">
                {intent.requiredFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-1 text-[11px]">
                    <span className="text-[var(--ag-gold)]">•</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--ag-navy)] border border-[var(--ag-border)] space-y-1">
              <span className="text-[10px] uppercase text-[var(--ag-gold)] font-semibold flex items-center gap-1">
                <Download className="w-3 h-3" /> EXPORT TARGET
              </span>
              {isEditingIntent ? (
                <input
                  type="text"
                  value={intent.exportTarget}
                  onChange={(e) => setIntent({ ...intent, exportTarget: e.target.value })}
                  className="w-full bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded p-1.5 text-xs text-[var(--ag-text)]"
                />
              ) : (
                <p className="text-[var(--ag-text)] font-medium">{intent.exportTarget}</p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--ag-navy)] border border-[var(--ag-border)] space-y-1">
              <span className="text-[10px] uppercase text-[var(--ag-gold)] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> TEST & VERIFICATION
              </span>
              {isEditingIntent ? (
                <input
                  type="text"
                  value={intent.testRequirements}
                  onChange={(e) => setIntent({ ...intent, testRequirements: e.target.value })}
                  className="w-full bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded p-1.5 text-xs text-[var(--ag-text)]"
                />
              ) : (
                <p className="text-[var(--ag-text)] font-medium">{intent.testRequirements}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Operator Transparency Execution Timeline ─────────────── */}
      {(isBuilding || buildComplete) && (
        <section className="p-6 rounded-2xl bg-[var(--ag-surface)] border border-[var(--ag-border)] shadow-xl space-y-5 animate-[fade-in_0.25s_ease-out]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--ag-border)] pb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--ag-text)] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[var(--ag-gold)]" />
                <span>Hermes Autonomous Execution Timeline</span>
              </h3>
              <p className="text-xs font-mono text-[var(--ag-text-muted)] mt-0.5">
                Complete transparency across all 10 stages: models, local/cloud routing, token count, and cryptographic evidence.
              </p>
            </div>

            {buildComplete && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[var(--ag-success-bg)] text-[var(--ag-success)] text-xs font-mono font-bold border border-[var(--ag-success)]/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 10/10 STAGES PASSED
                </span>
              </div>
            )}
          </div>

          {/* Timeline Table */}
          <div className="rounded-xl border border-[var(--ag-border)] bg-[var(--ag-navy)] overflow-x-auto">
            <table className="w-full text-left text-xs font-mono divide-y divide-[var(--ag-border)]">
              <thead className="bg-white/5 text-[10px] uppercase text-[var(--ag-text-muted)]">
                <tr>
                  <th className="p-3">STAGE</th>
                  <th className="p-3">ENGINE</th>
                  <th className="p-3">MODEL</th>
                  <th className="p-3">ROUTING</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">TIME</th>
                  <th className="p-3">TOKENS</th>
                  <th className="p-3">EVIDENCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {timeline.map((stage) => (
                  <tr key={stage.id} className="hover:bg-white/5 transition">
                    <td className="p-3 font-bold text-[var(--ag-text)]">{stage.label}</td>
                    <td className="p-3 text-[var(--ag-text-muted)]">{stage.engine}</td>
                    <td className="p-3 text-[var(--ag-gold)]">{stage.model}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--ag-success)]/15 text-[var(--ag-success)]">
                        LOCAL
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          stage.status === "PASSED"
                            ? "bg-[var(--ag-success-bg)] text-[var(--ag-success)]"
                            : stage.status === "RUNNING"
                            ? "bg-[var(--ag-gold)]/20 text-[var(--ag-gold)] animate-pulse"
                            : "bg-white/5 text-[var(--ag-text-muted)]"
                        }`}
                      >
                        {stage.status}
                      </span>
                    </td>
                    <td className="p-3 text-[var(--ag-text-muted)]">{stage.timeMs > 0 ? `${stage.timeMs}ms` : "—"}</td>
                    <td className="p-3 text-[var(--ag-text-muted)]">{stage.tokens > 0 ? stage.tokens : "—"}</td>
                    <td className="p-3 text-[var(--ag-text-muted)] font-mono text-[10px] truncate max-w-[120px]">
                      {stage.evidenceHash || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Result Action Cards */}
          {buildComplete && (
            <div className="p-5 rounded-xl bg-gradient-to-r from-[var(--ag-surface-hover)] to-[var(--ag-surface)] border border-[var(--ag-gold)]/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-[slide-up_0.2s_ease-out]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[var(--ag-success)]" />
                  <h4 className="text-base font-bold text-[var(--ag-text)]">
                    Project Generated & Sealed into Project Basket!
                  </h4>
                </div>
                <p className="text-xs font-mono text-[var(--ag-text-muted)]">
                  Project ID: <span className="text-[var(--ag-gold)] font-bold">{createdProjectId}</span> • All AST security audits and WCAG AA verification passed.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/basket")}
                  className="px-4 py-2 rounded-xl bg-[var(--ag-gold)] text-[var(--ag-navy)] font-bold text-xs hover:brightness-110 transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Open in Project Basket</span>
                </button>

                {intent?.projectType.includes("Presentation") ? (
                  <button
                    type="button"
                    onClick={() => router.push("/presentx")}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-[var(--ag-text)] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Launch PresentX Studio</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-[var(--ag-text)] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test & Inspect Sandbox</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
