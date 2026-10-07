"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  Sparkles,
  Plus,
  Presentation,
  FolderPlus,
  Layers,
  Wand2,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Palette,
  FileText,
  Upload,
  ArrowRight,
  ExternalLink,
  Sliders,
  Check,
  AlertCircle,
  Eye,
  Lock,
} from "lucide-react";
import { PresentationProject, VisualDirection, PresentationType, IntentCard } from "@/presentx/types";
import { PRO_TEMPLATES, ProTemplate } from "@/presentx/templates";
import { VISUAL_DIRECTIONS } from "@/presentx/engine/PresentXDesignSystem";
import { PresentXIntentBuilder } from "@/presentx/engine/PresentXIntentBuilder";
import { usePresentXStore } from "@/presentx/store/usePresentXStore";
import { clsx } from "clsx";

export default function PresentXDashboard() {
  const router = useRouter();
  const { setProject } = usePresentXStore();

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [recentProjects, setRecentProjects] = useState<PresentationProject[]>([]);
  const [selectedDirection, setSelectedDirection] = useState<VisualDirection>("FUTURISTIC");
  const [selectedType, setSelectedType] = useState<PresentationType>("PITCH_DECK");
  const [slideCount, setSlideCount] = useState(10);
  
  // Intent Card Modal state
  const [showIntentModal, setShowIntentModal] = useState(false);
  const [intentCard, setIntentCard] = useState<IntentCard | null>(null);

  const PIPELINE_STEPS = [
    { num: "01", name: "Understanding", engine: "Hermes Autonomous Supervisor", status: "PENDING" },
    { num: "02", name: "Planning", engine: "Hermes Task Planner", status: "PENDING" },
    { num: "03", name: "Research & Grounding", engine: "Trust Fabric Claim Registry", status: "PENDING" },
    { num: "04", name: "Fact Verification", engine: "Truth Firewall Gate", status: "PENDING" },
    { num: "05", name: "Story Architecture", engine: "PresentX Creative Director", status: "PENDING" },
    { num: "06", name: "Design System", engine: "PresentX Design Tokens", status: "PENDING" },
    { num: "07", name: "Visual Generation", engine: "ComfyUI DirectML / Vector", status: "PENDING" },
    { num: "08", name: "Slide Composition", engine: "22 Composition Families", status: "PENDING" },
    { num: "09", name: "Quality Audit", engine: "PresentX Quality Auditor", status: "PENDING" },
    { num: "10", name: "Deck Director", engine: "Pacing & Repetition Radar", status: "PENDING" },
    { num: "11", name: "Security & AST", engine: "Sanitization Firewall", status: "PENDING" },
    { num: "12", name: "OpenXML Packaging", engine: "JSZip Binary PPTX Compiler", status: "PENDING" },
    { num: "13", name: "Roundtrip Import", engine: "OpenXML Parser Verifier", status: "PENDING" },
    { num: "14", name: "Basket Archival", engine: "Sovereign Disk Vault", status: "PENDING" },
  ];

  // Fetch recent presentations
  useEffect(() => {
    fetch("/api/presentx/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.projects) {
          setRecentProjects(data.projects);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenIntentCard = (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim()) return;
    const builder = PresentXIntentBuilder.getInstance();
    const card = builder.buildIntentCard(activePrompt);
    setIntentCard(card);
    setSelectedDirection(card.visualStyle.value);
    setSelectedType(card.projectType.value);
    setSlideCount(card.slideCount.value);
    setShowIntentModal(true);
  };

  const handleExecuteBuild = async () => {
    const activePrompt = prompt.trim() || intentCard?.objective.value || "Executive Presentation";
    setShowIntentModal(false);
    setIsGenerating(true);
    setActiveStepIndex(0);

    // Step progression animation coupled with real fetch
    const stepInterval = setInterval(() => {
      setActiveStepIndex((prev) => (prev < PIPELINE_STEPS.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await fetch("/api/presentx/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawIdea: activePrompt,
          visualDirection: selectedDirection,
          presentationType: selectedType,
          slideCount,
        }),
      });

      clearInterval(stepInterval);
      const data = await res.json();
      if (data.success && data.project) {
        setActiveStepIndex(PIPELINE_STEPS.length - 1);
        setProject(data.project);
        setTimeout(() => {
          router.push(`/presentx/editor/${data.project.id}`);
        }, 600);
      } else {
        alert("Generation failed: " + (data.error || "Unknown error"));
        setIsGenerating(false);
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      alert("Generation failed: " + (err.message || String(err)));
      setIsGenerating(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-16">
        {/* ── Top Header Banner ────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[var(--ag-surface)] via-[var(--ag-elevated)] to-[var(--ag-surface)] border border-[var(--ag-border)] shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--ag-gold-alpha)] border border-[var(--ag-gold)]/30 text-xs font-mono text-[var(--ag-gold)] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              PRESENTX STUDIO • AUTONOMOUS CREATIVE WORKSTATION
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--ag-text)] tracking-tight">
              Tell PresentX <span className="text-[var(--ag-gold)]">what you want.</span>
            </h1>
            <p className="text-sm text-[var(--ag-text-sec)] max-w-2xl">
              Idea → Narrative Strategy → Trust Grounding → Slide Architecture → OpenXML PPTX. Professional presentations engineered by sovereign intelligence.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <Link
              href="/basket"
              className="px-4 py-2.5 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] hover:border-[var(--ag-gold)]/50 text-xs font-bold text-[var(--ag-text)] flex items-center gap-2 transition-all"
            >
              <FolderPlus className="w-4 h-4 text-[var(--ag-gold)]" />
              <span>Project Basket</span>
            </Link>
          </div>
        </div>

        {/* ── Primary Creation Area ─────────────────────────────────── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--ag-surface)] border border-[var(--ag-border)] shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--ag-text)] flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-[var(--ag-gold)]" />
              Describe your vision, topic, or document
            </h2>
            <span className="text-xs font-mono text-[var(--ag-muted)]">Hermes Autonomous Engine</span>
          </div>

          <div className="space-y-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="e.g. Create a professional 10-slide presentation explaining how AI is transforming creative agencies for CEOs and creative directors. Use verified facts, strong storytelling, and editable PPTX export..."
              disabled={isGenerating}
              className="w-full px-4 py-3.5 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] text-sm text-[var(--ag-text)] outline-none focus:border-[var(--ag-gold)] focus:ring-1 focus:ring-[var(--ag-gold)] transition-all font-mono resize-none"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[var(--ag-muted)]">Quick Starters:</span>
                {[
                  "AI Transformation in Creative Agencies",
                  "Series A Investor Pitch Deck",
                  "UX Friction & Conversion Case Study",
                  "VFX Neural Pipeline Architecture",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const text = `Create a 10-slide presentation on ${tag}.`;
                      setPrompt(text);
                      handleOpenIntentCard(text);
                    }}
                    className="px-3 py-1 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)] text-[var(--ag-text-sec)] hover:text-[var(--ag-gold)] hover:border-[var(--ag-gold)]/40 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleOpenIntentCard()}
                disabled={!prompt.trim() || isGenerating}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--ag-gold)] text-black font-bold text-sm hover:bg-[var(--ag-gold-bright)] disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[var(--ag-shadow-gold)] shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Deconstruct & Build Deck</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Curated Pro Templates ─────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--ag-text)]">Curated Story Templates</h2>
              <p className="text-xs text-[var(--ag-muted)]">Pre-structured narrative graphs and design directions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRO_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => {
                  setPrompt(tpl.prompt);
                  handleOpenIntentCard(tpl.prompt);
                }}
                className="group p-5 rounded-2xl bg-[var(--ag-surface)] border border-[var(--ag-border)] hover:border-[var(--ag-gold)]/50 hover:shadow-[var(--ag-shadow-gold)] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[var(--ag-gold-alpha)] text-[var(--ag-gold)] border border-[var(--ag-gold)]/20">
                      {tpl.badge}
                    </span>
                    <span className="text-xs font-mono text-[var(--ag-muted)]">{tpl.slideCount} Slides</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--ag-text)] group-hover:text-[var(--ag-gold)] transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-[var(--ag-text-sec)] line-clamp-2">
                    {tpl.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--ag-border)] flex items-center justify-between text-xs font-semibold text-[var(--ag-muted)] group-hover:text-[var(--ag-gold)]">
                  <span>{tpl.category}</span>
                  <span className="flex items-center gap-1">Review Intent <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Presentations ─────────────────────────────────── */}
        {recentProjects.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--ag-text)]">Recent Presentations</h2>
              <Link href="/basket" className="text-xs text-[var(--ag-gold)] hover:underline flex items-center gap-1">
                <span>View all in Project Basket</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentProjects.slice(0, 8).map((p) => (
                <Link
                  key={p.id}
                  href={`/presentx/editor/${p.id}`}
                  className="p-4 rounded-xl bg-[var(--ag-surface)] border border-[var(--ag-border)] hover:border-[var(--ag-gold)] transition-all space-y-3 block group"
                >
                  <div
                    className="w-full aspect-video rounded-lg p-3 flex flex-col justify-between border"
                    style={{
                      backgroundColor: p.designTokens?.backgroundColor || "#080808",
                      borderColor: `${p.designTokens?.primaryColor || "#D4AF37"}30`,
                    }}
                  >
                    <span
                      className="text-[9px] font-bold font-mono uppercase"
                      style={{ color: p.designTokens?.primaryColor || "#D4AF37" }}
                    >
                      {p.brief?.presentationType?.replace("_", " ") || "DECK"}
                    </span>
                    <div
                      className="text-xs font-bold truncate"
                      style={{ color: p.designTokens?.textColor || "#FFFFFF" }}
                    >
                      {p.title}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--ag-muted)]">
                    <span>{p.slides?.length || 0} Slides</span>
                    <span className="text-[var(--ag-success)]">Creative: {p.qualityAudit?.overallScore || 95}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Intent / Brief Card Modal (Phase 3) ────────────────────── */}
      {showIntentModal && intentCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--ag-border)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--ag-gold)]" />
                <h3 className="text-base font-bold text-[var(--ag-text)]">Intent & Brief Deconstruction</h3>
              </div>
              <button
                onClick={() => setShowIntentModal(false)}
                className="text-[var(--ag-muted)] hover:text-[var(--ag-text)] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-[var(--ag-text-sec)]">
                Hermes parsed your prompt into structured creative dimensions. Dimensions marked <span className="text-[var(--ag-gold)] font-mono">◇ INFERRED</span> can be adjusted below.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Project Type */}
                <div className="p-3 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[var(--ag-muted)] uppercase">Project Type</span>
                    <span className={intentCard.projectType.inferred ? "text-[var(--ag-gold)]" : "text-[var(--ag-success)]"}>
                      {intentCard.projectType.inferred ? "◇ INFERRED" : "✓ EXPLICIT"}
                    </span>
                  </div>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as PresentationType)}
                    className="w-full bg-transparent font-bold text-xs text-[var(--ag-text)] outline-none"
                  >
                    <option value="PITCH_DECK">Pitch Deck</option>
                    <option value="INVESTOR_DECK">Investor Deck</option>
                    <option value="REPORT">Executive Report</option>
                    <option value="PROPOSAL">Business Proposal</option>
                    <option value="CASE_STUDY">UX Case Study</option>
                    <option value="EDUCATIONAL">Educational Course</option>
                  </select>
                </div>

                {/* Target Audience */}
                <div className="p-3 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[var(--ag-muted)] uppercase">Target Audience</span>
                    <span className={intentCard.audience.inferred ? "text-[var(--ag-gold)]" : "text-[var(--ag-success)]"}>
                      {intentCard.audience.inferred ? "◇ INFERRED" : "✓ EXPLICIT"}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={intentCard.audience.value}
                    onChange={(e) => setIntentCard({ ...intentCard, audience: { ...intentCard.audience, value: e.target.value } })}
                    className="w-full bg-transparent font-bold text-xs text-[var(--ag-text)] outline-none"
                  />
                </div>

                {/* Slide Count */}
                <div className="p-3 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[var(--ag-muted)] uppercase">Slide Count</span>
                    <span className={intentCard.slideCount.inferred ? "text-[var(--ag-gold)]" : "text-[var(--ag-success)]"}>
                      {intentCard.slideCount.inferred ? "◇ INFERRED" : "✓ EXPLICIT"}
                    </span>
                  </div>
                  <select
                    value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                    className="w-full bg-transparent font-bold text-xs text-[var(--ag-text)] outline-none"
                  >
                    <option value={6}>6 Slides (Concise Executive)</option>
                    <option value={8}>8 Slides (Standard Presentation)</option>
                    <option value={10}>10 Slides (Comprehensive Story)</option>
                    <option value={12}>12 Slides (Deep Dive Pitch)</option>
                    <option value={15}>15 Slides (Full Masterclass)</option>
                  </select>
                </div>

                {/* Visual Direction */}
                <div className="p-3 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[var(--ag-muted)] uppercase">Visual Direction</span>
                    <span className={intentCard.visualStyle.inferred ? "text-[var(--ag-gold)]" : "text-[var(--ag-success)]"}>
                      {intentCard.visualStyle.inferred ? "◇ INFERRED" : "✓ EXPLICIT"}
                    </span>
                  </div>
                  <select
                    value={selectedDirection}
                    onChange={(e) => setSelectedDirection(e.target.value as VisualDirection)}
                    className="w-full bg-transparent font-bold text-xs text-[var(--ag-text)] outline-none"
                  >
                    {Object.keys(VISUAL_DIRECTIONS).map((k) => (
                      <option key={k} value={k}>
                        {VISUAL_DIRECTIONS[k as VisualDirection].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--ag-border)] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[var(--ag-muted)]">
                Export Target: <strong className="text-[var(--ag-gold)]">OpenXML Binary PPTX</strong>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowIntentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[var(--ag-muted)] hover:text-[var(--ag-text)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteBuild}
                  className="px-5 py-2.5 rounded-xl bg-[var(--ag-gold)] text-black font-bold text-xs hover:bg-[var(--ag-gold-bright)] flex items-center gap-2 shadow-[var(--ag-shadow-gold)]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Build Presentation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mission Viewer Execution Overlay (Phase 4) ─────────────── */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--ag-border)]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--ag-gold)] animate-pulse" />
                  <h3 className="text-sm font-bold text-[var(--ag-text)]">Mission Execution Viewer</h3>
                </div>
                <p className="text-xs font-mono text-[var(--ag-muted)] truncate max-w-md">
                  &ldquo;{prompt.slice(0, 50)}...&rdquo;
                </p>
              </div>
              <span className="text-xs font-mono text-[var(--ag-gold)]">
                Step {activeStepIndex + 1} / {PIPELINE_STEPS.length}
              </span>
            </div>

            {/* Pipeline Step List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {PIPELINE_STEPS.map((step, idx) => {
                const isDone = idx < activeStepIndex;
                const isCurrent = idx === activeStepIndex;
                return (
                  <div
                    key={step.num}
                    className={clsx(
                      "flex items-center justify-between p-2.5 rounded-xl text-xs font-mono transition-all",
                      isCurrent
                        ? "bg-[var(--ag-gold-alpha)] border border-[var(--ag-gold)] text-[var(--ag-gold)]"
                        : isDone
                        ? "bg-[var(--ag-elevated)] text-[var(--ag-text-sec)]"
                        : "opacity-40 text-[var(--ag-muted)]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{step.num}</span>
                      <span>{step.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="opacity-60">{step.engine}</span>
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 text-[var(--ag-success)]" />
                      ) : isCurrent ? (
                        <div className="w-3 h-3 border border-[var(--ag-gold)] border-t-transparent rounded-full animate-spin" />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center text-xs font-mono text-[var(--ag-muted)]">
              Sovereign Local-First Execution • V7 Trust Fabric Active
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
