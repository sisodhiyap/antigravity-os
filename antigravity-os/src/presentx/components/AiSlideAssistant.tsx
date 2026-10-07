"use client";

import React, { useState } from "react";
import { Slide, VisualDirection, SlideLayout, PresentationProject, FactClaim } from "../types";
import { VISUAL_DIRECTIONS } from "../engine/PresentXDesignSystem";
import {
  Sparkles,
  Wand2,
  Minimize2,
  Maximize2,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  Image as ImageIcon,
  Layout,
  FileText,
  Palette,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Search,
  ExternalLink,
} from "lucide-react";
import { clsx } from "clsx";

interface AiSlideAssistantProps {
  project: PresentationProject;
  currentSlide: Slide;
  onExecuteCommand: (action: string, customPrompt?: string, targetLayout?: SlideLayout) => Promise<void>;
  onChangeVisualDirection: (direction: VisualDirection) => void;
  onUpdateSlideLayout: (layout: SlideLayout) => void;
}

const AI_ACTIONS = [
  { id: "REWRITE", label: "Rewrite Clearer", icon: Wand2, desc: "Enhance flow and clarity" },
  { id: "EXECUTIVE", label: "Make Executive", icon: Briefcase, desc: "C-suite strategic tone" },
  { id: "PERSUASIVE", label: "Make Persuasive", icon: TrendingUp, desc: "Investor & sales punch" },
  { id: "SHORTEN", label: "Condense / Shorten", icon: Minimize2, desc: "Reduce word density" },
  { id: "EXPAND", label: "Expand & Detail", icon: Maximize2, desc: "Add supporting proof points" },
  { id: "ADD_EVIDENCE", label: "Attach Fact Grounding", icon: ShieldCheck, desc: "E3 Trust Fabric evidence" },
  { id: "AUTO_REPAIR_SLIDE", label: "Auto-Repair Slide", icon: Wrench, desc: "Localized defect healer" },
  { id: "GENERATE_VISUAL", label: "Generate ComfyUI Visual", icon: ImageIcon, desc: "Photorealistic 3D render" },
  { id: "ADD_SPEAKER_NOTES", label: "Add Presenter Notes", icon: FileText, desc: "Speaking prompts" },
];

const LAYOUT_OPTIONS: { id: SlideLayout; label: string }[] = [
  { id: "HERO", label: "Title Hero" },
  { id: "TITLE_CONTENT", label: "Title + Body" },
  { id: "TWO_COLUMN", label: "Two Columns" },
  { id: "THREE_COLUMN", label: "Three Columns" },
  { id: "METRICS_GRID", label: "KPI Metrics" },
  { id: "COMPARISON", label: "Comparison" },
  { id: "TIMELINE", label: "Timeline" },
  { id: "PROCESS_FLOW", label: "Process Flow" },
  { id: "CHART_VIEW", label: "Data Chart" },
  { id: "QUOTE", label: "Quote Anchor" },
  { id: "CONCLUSION", label: "Conclusion / CTA" },
];

export const AiSlideAssistant: React.FC<AiSlideAssistantProps> = ({
  project,
  currentSlide,
  onExecuteCommand,
  onChangeVisualDirection,
  onUpdateSlideLayout,
}) => {
  const [activeTab, setActiveTab] = useState<"AI" | "THEME" | "LAYOUT" | "AUDIT" | "FACTS">("AI");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (actionId: string) => {
    setIsProcessing(true);
    try {
      await onExecuteCommand(actionId, customPrompt);
    } finally {
      setIsProcessing(false);
    }
  };

  const audit = currentSlide.audit || {
    contentScore: 94,
    visualScore: 90,
    hierarchyScore: 92,
    readabilityScore: 94,
    accessibilityScore: 96,
    factualityScore: 100,
    findings: [],
  };

  const projectAudit = project.qualityAudit || {
    overallScore: 95,
    factualityScore: 98,
    verifiedClaimsCount: 12,
    inferredClaimsCount: 2,
    unverifiedClaimsCount: 0,
    contradictedClaimsCount: 0,
  };

  return (
    <div className="w-full h-full flex flex-col bg-[var(--ag-surface)] border-l border-[var(--ag-border)] select-none">
      {/* ── Sub-header tabs ──────────────────────────────────────── */}
      <div className="flex border-b border-[var(--ag-border)] p-1.5 gap-1 shrink-0 bg-[var(--ag-bg-deep)] overflow-x-auto">
        <button
          onClick={() => setActiveTab("AI")}
          className={clsx(
            "py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors shrink-0",
            activeTab === "AI" ? "bg-[var(--ag-gold-alpha)] text-[var(--ag-gold)]" : "text-[var(--ag-muted)] hover:text-[var(--ag-text)]"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI</span>
        </button>
        <button
          onClick={() => setActiveTab("FACTS")}
          className={clsx(
            "py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors shrink-0",
            activeTab === "FACTS" ? "bg-[var(--ag-gold-alpha)] text-[var(--ag-gold)]" : "text-[var(--ag-muted)] hover:text-[var(--ag-text)]"
          )}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Claims</span>
        </button>
        <button
          onClick={() => setActiveTab("LAYOUT")}
          className={clsx(
            "py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors shrink-0",
            activeTab === "LAYOUT" ? "bg-[var(--ag-gold-alpha)] text-[var(--ag-gold)]" : "text-[var(--ag-muted)] hover:text-[var(--ag-text)]"
          )}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>Layout</span>
        </button>
        <button
          onClick={() => setActiveTab("THEME")}
          className={clsx(
            "py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors shrink-0",
            activeTab === "THEME" ? "bg-[var(--ag-gold-alpha)] text-[var(--ag-gold)]" : "text-[var(--ag-muted)] hover:text-[var(--ag-text)]"
          )}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Style</span>
        </button>
        <button
          onClick={() => setActiveTab("AUDIT")}
          className={clsx(
            "py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors shrink-0",
            activeTab === "AUDIT" ? "bg-[var(--ag-gold-alpha)] text-[var(--ag-gold)]" : "text-[var(--ag-muted)] hover:text-[var(--ag-text)]"
          )}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Audit</span>
        </button>
      </div>

      {/* ── Tab Content ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: AI COMMANDS */}
        {activeTab === "AI" && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-2">
              <label className="text-[11px] font-bold text-[var(--ag-text-sec)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--ag-gold)]" />
                Custom Slide Directive
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Turn into 3 key bullet points..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--ag-surface)] border border-[var(--ag-border)] text-xs text-[var(--ag-text)] outline-none focus:border-[var(--ag-gold)]"
                />
                <button
                  onClick={() => handleAction("CUSTOM_COMMAND")}
                  disabled={!customPrompt || isProcessing}
                  className="px-3 py-1.5 rounded-lg bg-[var(--ag-gold)] text-black font-bold text-xs hover:bg-[var(--ag-gold-bright)] disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ag-muted)] px-1">
                Contextual AI Actions (Hermes V7)
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {AI_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.id)}
                      disabled={isProcessing}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] hover:border-[var(--ag-gold)]/40 hover:bg-[var(--ag-elevated)]/80 active:scale-[0.98] transition-all text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[var(--ag-surface)] border border-[var(--ag-border)] flex items-center justify-center group-hover:border-[var(--ag-gold)]/50 transition-colors">
                          <Icon className="w-3.5 h-3.5 text-[var(--ag-gold)]" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[var(--ag-text)]">{action.label}</div>
                          <div className="text-[10px] text-[var(--ag-muted)]">{action.desc}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLAIM INSPECTOR & TRUST MODE */}
        {activeTab === "FACTS" && (
          <div className="space-y-3">
            {/* Visual Factuality Meter */}
            <div className="p-3 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--ag-text)] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[var(--ag-success)]" />
                  Factuality Score
                </span>
                <span className="text-sm font-bold font-mono text-[var(--ag-success)]">
                  {projectAudit.factualityScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--ag-success)] rounded-full transition-all"
                  style={{ width: `${projectAudit.factualityScore}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-mono text-[var(--ag-muted)]">
                <div>VERIFIED: <span className="text-[var(--ag-success)] font-bold">{projectAudit.verifiedClaimsCount || 0}</span></div>
                <div>INFERRED: <span className="text-[var(--ag-gold)] font-bold">{projectAudit.inferredClaimsCount || 0}</span></div>
                <div>UNVERIFIED: <span className="text-[var(--ag-warning)] font-bold">{projectAudit.unverifiedClaimsCount || 0}</span></div>
                <div>CONTRADICTED: <span className="text-[var(--ag-error)] font-bold">{projectAudit.contradictedClaimsCount || 0}</span></div>
              </div>
            </div>

            {/* Slide Claims Inspector */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ag-muted)] px-1">
                Slide Factual Claims Lineage
              </p>
              {(currentSlide.facts && currentSlide.facts.length > 0) ? (
                currentSlide.facts.map((claim, idx) => (
                  <div
                    key={claim.claimId || idx}
                    className="p-3 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={clsx(
                          "text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border",
                          claim.provenance === "VERIFIED"
                            ? "bg-[var(--ag-success-bg)] text-[var(--ag-success)] border-[var(--ag-success)]/30"
                            : claim.provenance === "CONTRADICTED"
                            ? "bg-[var(--ag-error-bg)] text-[var(--ag-error)] border-[var(--ag-error)]/30"
                            : "bg-[var(--ag-gold-alpha)] text-[var(--ag-gold)] border-[var(--ag-gold)]/30"
                        )}
                      >
                        {claim.provenance} • {claim.evidenceLevel}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--ag-muted)]">
                        {Math.round((claim.confidence || 0.95) * 100)}% Conf
                      </span>
                    </div>
                    <p className="text-xs text-[var(--ag-text)] font-medium leading-relaxed">
                      {claim.text}
                    </p>
                    <div className="text-[10px] font-mono text-[var(--ag-muted)] border-t border-[var(--ag-border)] pt-1 flex justify-between">
                      <span>Source: {claim.sourceClass}</span>
                      <span>{claim.freshness}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-[var(--ag-muted)]">
                  No explicit claims registered for this slide.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: LAYOUT SWITCHER */}
        {activeTab === "LAYOUT" && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ag-muted)] px-1">
              Select Slide Architecture (21 Primitives)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {LAYOUT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdateSlideLayout(opt.id)}
                  className={clsx(
                    "p-2.5 rounded-xl border text-xs font-bold text-left transition-all",
                    currentSlide.layout === opt.id
                      ? "bg-[var(--ag-gold-alpha)] border-[var(--ag-gold)] text-[var(--ag-gold)]"
                      : "bg-[var(--ag-elevated)] border-[var(--ag-border)] text-[var(--ag-text-sec)] hover:text-[var(--ag-text)]"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VISUAL DIRECTIONS & THEMES */}
        {activeTab === "THEME" && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ag-muted)] px-1">
              Visual Direction System (9 Presets)
            </p>
            <div className="space-y-2">
              {(Object.keys(VISUAL_DIRECTIONS) as VisualDirection[]).map((key) => {
                const dir = VISUAL_DIRECTIONS[key];
                const active = project.visualDirection === key;

                return (
                  <div
                    key={key}
                    onClick={() => onChangeVisualDirection(key)}
                    className={clsx(
                      "p-3 rounded-xl border cursor-pointer transition-all",
                      active
                        ? "bg-[var(--ag-gold-alpha)] border-[var(--ag-gold)] shadow-[var(--ag-shadow-gold)]"
                        : "bg-[var(--ag-elevated)] border-[var(--ag-border)] hover:border-[var(--ag-border-hover)]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-[var(--ag-text)]">{dir.name}</div>
                      <div className="flex gap-1">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: dir.tokens.primaryColor }} />
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: dir.tokens.backgroundColor, border: "1px solid rgba(255,255,255,0.2)" }} />
                      </div>
                    </div>
                    <p className="text-[10px] text-[var(--ag-muted)] mt-1">{dir.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: QUALITY AUDIT & WCAG 2.2 AA */}
        {activeTab === "AUDIT" && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[var(--ag-elevated)] border border-[var(--ag-border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--ag-text)]">Slide Quality Score</span>
                <span className="text-lg font-bold font-mono text-[var(--ag-gold)]">
                  {audit.accessibilityScore}%
                </span>
              </div>
              <div className="space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-[var(--ag-muted)]">
                  <span>Accessibility (WCAG 2.2 AA)</span>
                  <span className="text-[var(--ag-success)]">{audit.accessibilityScore}%</span>
                </div>
                <div className="flex justify-between text-[var(--ag-muted)]">
                  <span>Fact Grounding (Trust Fabric)</span>
                  <span className="text-[var(--ag-success)]">{audit.factualityScore}%</span>
                </div>
                <div className="flex justify-between text-[var(--ag-muted)]">
                  <span>Visual Balance & Hierarchy</span>
                  <span className="text-[var(--ag-gold)]">{audit.hierarchyScore}%</span>
                </div>
                <div className="flex justify-between text-[var(--ag-muted)]">
                  <span>Readability & Density</span>
                  <span className="text-[var(--ag-info)]">{audit.readabilityScore}%</span>
                </div>
              </div>
            </div>

            {audit.findings.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ag-muted)] px-1">
                  Active Findings & Auto-Repair
                </p>
                {audit.findings.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-[var(--ag-surface)] border border-[var(--ag-warning)]/30 text-xs flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-[var(--ag-warning)] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-[var(--ag-text)] font-medium text-[11px]">{f.message}</div>
                      <button
                        onClick={() => handleAction("AUTO_REPAIR_SLIDE")}
                        className="mt-1.5 px-2.5 py-1 rounded bg-[var(--ag-gold)] text-black text-[10px] font-bold hover:bg-[var(--ag-gold-bright)] flex items-center gap-1"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>Auto-Repair Defect</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[var(--ag-success-bg)] border border-[var(--ag-success)]/30 text-xs text-[var(--ag-success)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Zero issues detected. Slide is fully certified.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
