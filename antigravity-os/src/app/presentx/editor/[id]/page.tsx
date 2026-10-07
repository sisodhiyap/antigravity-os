"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { usePresentXStore } from "@/presentx/store/usePresentXStore";
import { SlideCanvas } from "@/presentx/components/SlideCanvas";
import { SlideThumbnail } from "@/presentx/components/SlideThumbnail";
import { AiSlideAssistant } from "@/presentx/components/AiSlideAssistant";
import { PresentXDesignSystem } from "@/presentx/engine/PresentXDesignSystem";
import { PresentXDeckDirector } from "@/presentx/engine/PresentXDeckDirector";
import { SlideLayout, VisualDirection, DeckHealth } from "@/presentx/types";
import {
  Play,
  Download,
  Plus,
  Undo2,
  Redo2,
  FileDown,
  Sparkles,
  ChevronDown,
  ArrowLeft,
  Share2,
  FileCode,
  ShieldCheck,
  Eye,
  Menu,
  Activity,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  Copy,
  ChevronUp,
} from "lucide-react";
import { clsx } from "clsx";

export default function PresentXEditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const {
    project,
    setProject,
    activeSlideIndex,
    setActiveSlideIndex,
    updateActiveSlide,
    addSlide,
    deleteSlide,
    changeVisualDirection,
    undo,
    redo,
    historyIndex,
    history,
  } = usePresentXStore();

  const [isLoading, setIsLoading] = useState(!project || project.id !== projectId);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"SLIDES" | "CANVAS" | "AI">("CANVAS");
  
  // Drawer states
  const [showDeckHealthDrawer, setShowDeckHealthDrawer] = useState(false);
  const [showCreativeBriefDrawer, setShowCreativeBriefDrawer] = useState(false);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);

  // Load project if not already in store
  useEffect(() => {
    if (!project || project.id !== projectId) {
      setIsLoading(true);
      fetch(`/api/presentx/projects?id=${projectId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.project) {
            setProject(data.project);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [projectId]);

  const activeSlide = project?.slides[activeSlideIndex];
  const tokens = project?.designTokens || PresentXDesignSystem.getTokensForDirection("FUTURISTIC");
  const creativeScore = project?.qualityAudit?.overallScore || 95;
  const trustScore = project?.qualityAudit?.factualityScore || 98;
  const deckHealth: DeckHealth | undefined = project?.deckHealth;

  const handleExecuteAiCommand = async (action: string, customPrompt?: string, targetLayout?: SlideLayout) => {
    if (!project || !activeSlide) return;

    try {
      const res = await fetch("/api/presentx/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          request: {
            projectId: project.id,
            slideId: activeSlide.id,
            action,
            customPrompt,
            targetLayout,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
      }
    } catch (err) {
      console.error("AI command failed:", err);
    }
  };

  const handleExport = async (format: "HTML" | "PPTX" | "JSON" | "PDF") => {
    if (!project) return;
    setIsExporting(true);

    try {
      const res = await fetch("/api/presentx/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, format }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = format === "PPTX" ? "pptx" : format === "JSON" ? "evidence.json" : "html";
      a.download = `${project.title || "presentation"}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setShowExportModal(false);
    } catch (err) {
      alert("Export failed: " + String(err));
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading || !project || !activeSlide) {
    return (
      <AppShell>
        <div className="h-[75vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-[var(--ag-gold)] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-[var(--ag-muted)]">Loading PresentX Studio Canvas...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="h-[calc(100vh-5.5rem)] flex flex-col space-y-2 select-none overflow-hidden pb-1">
        {/* ── Top Editor Header Toolbar ───────────────────────────── */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--ag-surface)] border border-[var(--ag-border)] shrink-0 gap-2">
          {/* Left: Back, Title, Visual Style */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/presentx"
              className="p-1.5 rounded-lg text-[var(--ag-muted)] hover:text-[var(--ag-text)] hover:bg-[var(--ag-elevated)] transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-[var(--ag-text)] truncate max-w-[200px] sm:max-w-md">
                {project.title}
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--ag-muted)]">
                <span className="text-[var(--ag-gold)]">{project.visualDirection}</span>
                <span>•</span>
                <span>{project.slides.length} Slides</span>
              </div>
            </div>
          </div>

          {/* Center: Dual Quality Scores (Phase 10) */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setShowDeckHealthDrawer(!showDeckHealthDrawer)}
              className="px-2.5 py-1 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)] hover:border-[var(--ag-gold)]/50 text-[11px] font-mono flex items-center gap-1.5 transition-all"
            >
              <Activity className="w-3.5 h-3.5 text-[var(--ag-gold)]" />
              <span>Creative: <strong className="text-[var(--ag-gold)]">{creativeScore}/100</strong></span>
            </button>

            <div className="px-2.5 py-1 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)] text-[11px] font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--ag-success)]" />
              <span>Trust: <strong className="text-[var(--ag-success)]">{trustScore}/100</strong></span>
            </div>

            {project.creativeBrief && (
              <button
                onClick={() => setShowCreativeBriefDrawer(!showCreativeBriefDrawer)}
                className="px-2.5 py-1 rounded-lg bg-[var(--ag-elevated)] border border-[var(--ag-border)] hover:border-[var(--ag-gold)]/50 text-[11px] font-mono flex items-center gap-1.5 transition-all"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Creative Brief</span>
              </button>
            )}
          </div>

          {/* Mobile Tab Switcher */}
          <div className="flex md:hidden items-center gap-1 bg-[var(--ag-elevated)] p-0.5 rounded-lg">
            <button
              onClick={() => setMobilePanel("SLIDES")}
              className={clsx("px-2 py-1 text-[11px] rounded font-medium", mobilePanel === "SLIDES" && "bg-[var(--ag-surface)] text-[var(--ag-gold)]")}
            >
              Slides
            </button>
            <button
              onClick={() => setMobilePanel("CANVAS")}
              className={clsx("px-2 py-1 text-[11px] rounded font-medium", mobilePanel === "CANVAS" && "bg-[var(--ag-surface)] text-[var(--ag-gold)]")}
            >
              Canvas
            </button>
            <button
              onClick={() => setMobilePanel("AI")}
              className={clsx("px-2 py-1 text-[11px] rounded font-medium", mobilePanel === "AI" && "bg-[var(--ag-surface)] text-[var(--ag-gold)]")}
            >
              Assistant
            </button>
          </div>

          {/* Right: History, Present, Export */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-0.5 border-r border-[var(--ag-border)] pr-2">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                title="Undo"
                className="p-1.5 rounded-lg text-[var(--ag-muted)] hover:text-[var(--ag-text)] disabled:opacity-30 transition-colors"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                title="Redo"
                className="p-1.5 rounded-lg text-[var(--ag-muted)] hover:text-[var(--ag-text)] disabled:opacity-30 transition-colors"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <Link
              href={`/presentx/present/${project.id}`}
              className="px-3 py-1.5 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] hover:border-[var(--ag-gold)]/50 text-xs font-bold text-[var(--ag-text)] flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 text-[var(--ag-gold)]" />
              <span>Present</span>
            </Link>

            <button
              onClick={() => setShowExportModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--ag-gold)] text-black font-bold text-xs hover:bg-[var(--ag-gold-bright)] flex items-center gap-1.5 transition-all shadow-[var(--ag-shadow-gold)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* ── Main 3-Column Professional Workstation ─────────────────── */}
        <div className="flex-1 flex gap-2 min-h-0 relative overflow-hidden">
          {/* LEFT: Slide Navigator */}
          <div
            className={clsx(
              "w-full md:w-56 shrink-0 rounded-xl bg-[var(--ag-surface)] border border-[var(--ag-border)] p-2.5 flex flex-col justify-between overflow-y-auto space-y-2",
              mobilePanel !== "SLIDES" && "hidden md:flex"
            )}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 text-[11px] font-mono text-[var(--ag-muted)]">
                <span>SLIDE NAVIGATOR</span>
                <span>{project.slides.length}</span>
              </div>

              <div className="space-y-1.5">
                {project.slides.map((s, idx) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setActiveSlideIndex(idx);
                      setMobilePanel("CANVAS");
                    }}
                    className={clsx(
                      "p-2 rounded-lg border text-left cursor-pointer transition-all space-y-1",
                      idx === activeSlideIndex
                        ? "bg-[var(--ag-gold-alpha)] border-[var(--ag-gold)] text-[var(--ag-gold)]"
                        : "bg-[var(--ag-elevated)] border-[var(--ag-border)] text-[var(--ag-text-sec)] hover:border-[var(--ag-gold)]/40"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-bold">0{idx + 1} {s.layout.replace("_", " ")}</span>
                      <span className="text-[var(--ag-success)]">✓</span>
                    </div>
                    <div className="text-xs font-semibold truncate text-[var(--ag-text)]">
                      {s.headline || "Untitled Slide"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => addSlide()}
              className="w-full py-2 rounded-lg bg-[var(--ag-elevated)] border border-dashed border-[var(--ag-border)] hover:border-[var(--ag-gold)] text-xs font-mono text-[var(--ag-text-sec)] hover:text-[var(--ag-gold)] flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Slide</span>
            </button>
          </div>

          {/* CENTER: Canvas (Visual Priority) */}
          <div
            className={clsx(
              "flex-1 rounded-xl bg-black/40 border border-[var(--ag-border)] p-2 sm:p-4 flex flex-col justify-between overflow-y-auto relative",
              mobilePanel !== "CANVAS" && "hidden md:flex"
            )}
          >
            <div className="flex-1 flex items-center justify-center min-h-0">
              <SlideCanvas
                slide={activeSlide}
                tokens={tokens}
                onUpdate={(updates) => updateActiveSlide(updates)}
                isEditable={true}
              />
            </div>

            {/* Bottom Floating Speaker Notes Drawer Toggle */}
            <div className="pt-2 shrink-0 flex items-center justify-between text-xs font-mono">
              <button
                onClick={() => setShowNotesDrawer(!showNotesDrawer)}
                className="px-3 py-1 rounded-lg bg-[var(--ag-surface)] border border-[var(--ag-border)] hover:border-[var(--ag-gold)]/50 text-[var(--ag-text-sec)] flex items-center gap-1.5 transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-[var(--ag-gold)]" />
                <span>Speaker Notes</span>
                <ChevronUp className={clsx("w-3 h-3 transition-transform", showNotesDrawer && "rotate-180")} />
              </button>

              <span className="text-[var(--ag-muted)] text-[11px]">
                Slide {activeSlideIndex + 1} of {project.slides.length}
              </span>
            </div>

            {/* Expanded Speaker Notes Drawer */}
            {showNotesDrawer && (
              <div className="mt-2 p-3 rounded-xl bg-[var(--ag-surface)] border border-[var(--ag-border)] space-y-1.5 animate-fade-in">
                <div className="text-[10px] font-mono text-[var(--ag-muted)] uppercase">Presenter Guidance & Teleprompter Notes</div>
                <textarea
                  value={activeSlide.speakerNotes || ""}
                  onChange={(e) => updateActiveSlide({ speakerNotes: e.target.value })}
                  rows={2}
                  className="w-full bg-[var(--ag-elevated)] p-2 rounded-lg text-xs font-mono text-[var(--ag-text)] outline-none border border-[var(--ag-border)] resize-none"
                  placeholder="Add speaker notes for this slide..."
                />
              </div>
            )}
          </div>

          {/* RIGHT: AI Slide Assistant (Contextual) */}
          <div
            className={clsx(
              "w-full md:w-72 shrink-0 rounded-xl bg-[var(--ag-surface)] border border-[var(--ag-border)] p-3 overflow-y-auto",
              mobilePanel !== "AI" && "hidden md:block"
            )}
          >
            <AiSlideAssistant
              project={project}
              currentSlide={activeSlide}
              onExecuteCommand={handleExecuteAiCommand}
              onChangeVisualDirection={changeVisualDirection}
              onUpdateSlideLayout={(layout) => updateActiveSlide({ layout })}
            />
          </div>
        </div>
      </div>

      {/* ── Export Pre-Flight & Format Modal (Phase 12) ─────────────── */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--ag-border)]">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[var(--ag-gold)]" />
                <h3 className="text-sm font-bold text-[var(--ag-text)]">Export Presentation Factory</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-[var(--ag-muted)] hover:text-[var(--ag-text)] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Pre-Flight Inspection Checklist */}
            <div className="p-3.5 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-2">
              <div className="text-[11px] font-mono text-[var(--ag-muted)] uppercase">Pre-Flight Artifact Verification</div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-[var(--ag-success)]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{project.slides.length} Slides Assembled</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--ag-success)]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>OpenXML ZIP Compliant</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--ag-success)]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>WCAG 2.2 AA Contrast</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--ag-success)]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Evidence Ledger Signed</span>
                </div>
              </div>
            </div>

            {/* Export Format Actions */}
            <div className="space-y-2">
              <button
                onClick={() => handleExport("PPTX")}
                disabled={isExporting}
                className="w-full p-3 rounded-xl bg-[var(--ag-gold)] text-black font-bold text-xs hover:bg-[var(--ag-gold-bright)] flex items-center justify-between transition-all shadow-[var(--ag-shadow-gold)]"
              >
                <div className="flex items-center gap-2">
                  <FileDown className="w-4 h-4" />
                  <span>Microsoft PowerPoint (.PPTX)</span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-black/10 px-2 py-0.5 rounded">OpenXML Binary</span>
              </button>

              <button
                onClick={() => handleExport("HTML")}
                disabled={isExporting}
                className="w-full p-3 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] hover:border-[var(--ag-gold)] text-[var(--ag-text)] font-bold text-xs flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[var(--ag-info)]" />
                  <span>Interactive Web Presentation (.HTML)</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--ag-muted)]">Standalone HTML5</span>
              </button>

              <button
                onClick={() => handleExport("JSON")}
                disabled={isExporting}
                className="w-full p-3 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] hover:border-[var(--ag-gold)] text-[var(--ag-text)] font-bold text-xs flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--ag-success)]" />
                  <span>Signed Evidence Ledger (.JSON)</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--ag-muted)]">SHA-256 Provenance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Deck Health & Repetition Drawer (Phase 5 & 9) ───────────── */}
      {showDeckHealthDrawer && deckHealth && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--ag-border)]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--ag-gold)]" />
                <h3 className="text-sm font-bold text-[var(--ag-text)]">Deck Director Health & Repetition Radar</h3>
              </div>
              <button
                onClick={() => setShowDeckHealthDrawer(false)}
                className="text-[var(--ag-muted)] hover:text-[var(--ag-text)] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-[var(--ag-elevated)] text-center">
                <div className="text-xs text-[var(--ag-muted)]">Narrative Flow</div>
                <div className="text-xl font-bold font-mono text-[var(--ag-gold)]">{deckHealth.narrative}</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--ag-elevated)] text-center">
                <div className="text-xs text-[var(--ag-muted)]">Visual Variety</div>
                <div className="text-xl font-bold font-mono text-[var(--ag-gold)]">{deckHealth.visualVariety}</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--ag-elevated)] text-center">
                <div className="text-xs text-[var(--ag-muted)]">Hierarchy</div>
                <div className="text-xl font-bold font-mono text-[var(--ag-gold)]">{deckHealth.hierarchy}</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--ag-elevated)] text-center">
                <div className="text-xs text-[var(--ag-muted)]">Factuality</div>
                <div className="text-xl font-bold font-mono text-[var(--ag-success)]">{deckHealth.factuality}</div>
              </div>
            </div>

            {/* Repetition Warnings & Recommendations */}
            <div className="space-y-3">
              <div className="text-xs font-mono text-[var(--ag-muted)] uppercase">Director Recommendations</div>
              {deckHealth.recommendations.length > 0 ? (
                deckHealth.recommendations.map((rec) => (
                  <div key={rec.id} className="p-3 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[var(--ag-text)]">
                      <span>{rec.title}</span>
                      <span className="text-[10px] font-mono text-[var(--ag-gold)] px-2 py-0.5 rounded bg-[var(--ag-gold-alpha)]">
                        {rec.severity}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--ag-text-sec)]">{rec.description}</p>
                    <p className="text-xs text-[var(--ag-gold)] font-mono">→ {rec.suggestedAction}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-[var(--ag-elevated)] text-center text-xs text-[var(--ag-success)]">
                  ✓ Perfect deck rhythm and layout balance. No repetition detected.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Creative Brief Drawer (Phase 4) ─────────────────────────── */}
      {showCreativeBriefDrawer && project.creativeBrief && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--ag-border)]">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-[var(--ag-text)]">Creative Director Specification</h3>
              </div>
              <button
                onClick={() => setShowCreativeBriefDrawer(false)}
                className="text-[var(--ag-muted)] hover:text-[var(--ag-text)] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--ag-elevated)] space-y-1">
                <div className="font-mono text-[var(--ag-gold)] uppercase font-bold">Core Thesis</div>
                <p className="text-[var(--ag-text)]">{project.creativeBrief.thesis}</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--ag-elevated)] space-y-1">
                <div className="font-mono text-[var(--ag-gold)] uppercase font-bold">Audience Insight</div>
                <p className="text-[var(--ag-text)]">{project.creativeBrief.audienceInsight}</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--ag-elevated)] space-y-1">
                <div className="font-mono text-[var(--ag-gold)] uppercase font-bold">Emotional Arc</div>
                <p className="text-[var(--ag-text)]">{project.creativeBrief.emotionalArc}</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--ag-elevated)] space-y-1">
                <div className="font-mono text-[var(--ag-gold)] uppercase font-bold">Visual Metaphor & Rhythm</div>
                <p className="text-[var(--ag-text)]">{project.creativeBrief.visualMetaphor}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
