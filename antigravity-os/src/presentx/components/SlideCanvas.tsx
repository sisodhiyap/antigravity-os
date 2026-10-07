"use client";

import React, { useState } from "react";
import { Slide, DesignTokens, SlideLayout } from "../types";
import { PresentXDesignSystem } from "../engine/PresentXDesignSystem";
import {
  Sparkles,
  BarChart3,
  GitMerge,
  Quote,
  LayoutGrid,
  Type,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Layers,
  Table as TableIcon,
  ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";

interface SlideCanvasProps {
  slide: Slide;
  tokens: DesignTokens;
  onUpdate: (updates: Partial<Slide>) => void;
  isEditable?: boolean;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({
  slide,
  tokens,
  onUpdate,
  isEditable = true,
}) => {
  const cardStyleClass =
    tokens.cardStyle === "GLASS"
      ? "bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl"
      : tokens.cardStyle === "OUTLINE"
      ? "bg-transparent border-2 border-[var(--ag-border)]"
      : "bg-[var(--ag-surface)] border border-[var(--ag-border)]";

  return (
    <div
      className="relative w-full max-w-[1180px] aspect-[16/9] mx-auto rounded-2xl p-6 sm:p-12 flex flex-col justify-between select-text transition-all duration-300 shadow-2xl overflow-hidden"
      style={{
        backgroundColor: tokens.backgroundColor,
        color: tokens.textColor,
        fontFamily: tokens.fontBody,
        border: `1px solid ${tokens.primaryColor}25`,
      }}
    >
      {/* ── Slide Header / Badge Row ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono"
            style={{
              backgroundColor: `${tokens.primaryColor}18`,
              color: tokens.primaryColor,
              border: `1px solid ${tokens.primaryColor}35`,
            }}
          >
            {slide.layout.replace("_", " ")}
          </span>
          {slide.audit?.truthBadge && (
            <span
              className={clsx(
                "flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md border",
                slide.audit.truthBadge === "VERIFIED"
                  ? "text-[var(--ag-success)] bg-[var(--ag-success-bg)] border-[var(--ag-success)]/20"
                  : slide.audit.truthBadge === "INFERRED"
                  ? "text-[var(--ag-gold)] bg-[var(--ag-gold)]/10 border-[var(--ag-gold)]/20"
                  : slide.audit.truthBadge === "CONTRADICTED"
                  ? "text-red-400 bg-red-900/20 border-red-500/30"
                  : "text-amber-400 bg-amber-900/20 border-amber-500/30"
              )}
            >
              <CheckCircle2 className="w-3 h-3" />
              {slide.audit.truthBadge === "VERIFIED"
                ? "✓ VERIFIED"
                : slide.audit.truthBadge === "INFERRED"
                ? "◇ INFERRED"
                : slide.audit.truthBadge === "CONTRADICTED"
                ? "⚠ CONTRADICTED"
                : "! UNVERIFIED"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {slide.caseStudyClassification && (
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-500/20">
              {slide.caseStudyClassification.replace("_", " ")}
            </span>
          )}
          <span className="text-xs font-mono opacity-50">Slide {slide.slideNumber}</span>
        </div>
      </div>

      {/* ── Main Dynamic Slide Body ──────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center min-h-0 py-2">
        {/* 1. HERO & EDITORIAL LAYOUT */}
        {(slide.layout === "HERO" || slide.layout === "EDITORIAL") && (
          <div className="space-y-4 text-center max-w-3xl mx-auto my-auto">
            {isEditable ? (
              <input
                type="text"
                value={slide.headline}
                onChange={(e) => onUpdate({ headline: e.target.value })}
                className="w-full bg-transparent text-center font-bold text-3xl sm:text-5xl outline-none focus:ring-1 focus:ring-[var(--ag-gold)] rounded-lg p-1"
                style={{ fontFamily: tokens.fontHeading, color: tokens.textColor }}
                placeholder="Enter slide title..."
              />
            ) : (
              <h1 className="font-bold text-3xl sm:text-5xl" style={{ fontFamily: tokens.fontHeading }}>
                {slide.headline}
              </h1>
            )}

            {isEditable ? (
              <textarea
                value={slide.subheadline || ""}
                onChange={(e) => onUpdate({ subheadline: e.target.value })}
                rows={2}
                className="w-full bg-transparent text-center text-lg sm:text-xl outline-none focus:ring-1 focus:ring-[var(--ag-gold)] rounded-lg p-1 resize-none"
                style={{ color: tokens.primaryColor }}
                placeholder="Enter presentation subtitle..."
              />
            ) : (
              <p className="text-lg sm:text-xl" style={{ color: tokens.primaryColor }}>
                {slide.subheadline}
              </p>
            )}

            <p className="text-sm sm:text-base opacity-75 max-w-xl mx-auto">{slide.bodyContent}</p>
          </div>
        )}

        {/* 2. METRICS GRID */}
        {slide.layout === "METRICS_GRID" && (
          <div className="space-y-4 my-auto">
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: tokens.fontHeading }}>
              {slide.headline}
            </h2>
            <p className="text-sm sm:text-base opacity-75">{slide.bodyContent}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
              {(slide.keyMetrics || []).map((metric, idx) => (
                <div key={idx} className={clsx("p-4 rounded-xl text-center", cardStyleClass)}>
                  <div
                    className="text-2xl sm:text-4xl font-extrabold font-mono"
                    style={{ color: tokens.primaryColor, fontFamily: tokens.fontHeading }}
                  >
                    {metric.value}
                  </div>
                  <div className="text-xs font-medium opacity-80 mt-1">{metric.label}</div>
                  {metric.change && (
                    <div className="text-[10px] text-[var(--ag-success)] font-mono font-bold mt-1">
                      {metric.change}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. CHART VIEW / DATA STORY / CHART RIGHT */}
        {(slide.layout === "CHART_VIEW" || slide.layout === "DATA_STORY" || slide.layout === "CHART_RIGHT") && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center my-auto">
            <div className="md:col-span-5 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: tokens.fontHeading }}>
                {slide.headline}
              </h2>
              {slide.subheadline && (
                <p className="text-sm font-medium" style={{ color: tokens.primaryColor }}>
                  {slide.subheadline}
                </p>
              )}
              <p className="text-sm opacity-80">{slide.bodyContent}</p>
              {slide.bulletPoints && (
                <ul className="space-y-1 text-xs opacity-75">
                  {slide.bulletPoints.map((b, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span style={{ color: tokens.primaryColor }}>•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="md:col-span-7">
              {slide.chart ? (
                <div
                  className="w-full h-48 sm:h-64 rounded-xl p-3 flex items-center justify-center"
                  dangerouslySetInnerHTML={{
                    __html: PresentXDesignSystem.renderChartSvg(slide.chart, tokens, 580, 220),
                  }}
                />
              ) : (
                <div className={clsx("p-6 rounded-xl text-center opacity-60", cardStyleClass)}>
                  <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <div className="text-xs">Data Visualization Canvas</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. PROCESS FLOW / TIMELINE / ROADMAP / SYSTEM DIAGRAM */}
        {(slide.layout === "PROCESS_FLOW" || slide.layout === "TIMELINE" || slide.layout === "ROADMAP" || slide.layout === "SYSTEM_DIAGRAM") && (
          <div className="space-y-3 my-auto">
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: tokens.fontHeading }}>
              {slide.headline}
            </h2>
            <p className="text-sm opacity-75">{slide.bodyContent}</p>
            {slide.diagram ? (
              <div
                className="w-full h-48 sm:h-60 rounded-xl p-2 flex items-center justify-center"
                dangerouslySetInnerHTML={{
                  __html: PresentXDesignSystem.renderDiagramSvg(slide.diagram, tokens, 750, 220),
                }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
                {(slide.bulletPoints || ["Phase 1: Discovery", "Phase 2: Architecture", "Phase 3: Deployment", "Phase 4: Optimization"]).map((step, idx) => (
                  <div key={idx} className={clsx("p-4 rounded-xl relative", cardStyleClass)}>
                    <div className="text-xs font-mono font-bold mb-1" style={{ color: tokens.primaryColor }}>
                      0{idx + 1}
                    </div>
                    <div className="text-xs font-medium">{step}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. QUOTE CALLOUT */}
        {(slide.layout === "QUOTE" || slide.layout === "QUOTE_CALLOUT") && (
          <div className="space-y-4 text-center max-w-2xl mx-auto my-auto">
            <Quote className="w-10 h-10 mx-auto opacity-30" style={{ color: tokens.primaryColor }} />
            <blockquote
              className="text-xl sm:text-2xl italic font-serif leading-relaxed"
              style={{ fontFamily: tokens.fontHeading }}
            >
              &ldquo;{slide.quote?.text || slide.bodyContent}&rdquo;
            </blockquote>
            {slide.quote?.author && (
              <div className="text-sm font-semibold font-mono" style={{ color: tokens.primaryColor }}>
                — {slide.quote.author} {slide.quote.role ? `(${slide.quote.role})` : ""}
              </div>
            )}
          </div>
        )}

        {/* 6. THREE COLUMN / COMPARISON / MATRIX / CASE STUDY */}
        {(slide.layout === "THREE_COLUMN" || slide.layout === "COMPARISON" || slide.layout === "MATRIX" || slide.layout === "CASE_STUDY") && (
          <div className="space-y-4 my-auto">
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: tokens.fontHeading }}>
              {slide.headline}
            </h2>
            <p className="text-sm opacity-75">{slide.bodyContent}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              {(slide.bulletPoints && slide.bulletPoints.length >= 3
                ? slide.bulletPoints.slice(0, 3)
                : ["Pillar A: Autonomous Execution", "Pillar B: Truth Grounding", "Pillar C: Compounding Yield"]
              ).map((point, idx) => (
                <div key={idx} className={clsx("p-4 rounded-xl space-y-2", cardStyleClass)}>
                  <div className="text-xs font-mono font-bold" style={{ color: tokens.primaryColor }}>
                    Pillar 0{idx + 1}
                  </div>
                  <div className="text-xs sm:text-sm font-medium">{point}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. TWO COLUMN / STANDARD CONTENT / CONCLUSION / CTA */}
        {slide.layout !== "HERO" &&
          slide.layout !== "EDITORIAL" &&
          slide.layout !== "METRICS_GRID" &&
          slide.layout !== "CHART_VIEW" &&
          slide.layout !== "DATA_STORY" &&
          slide.layout !== "CHART_RIGHT" &&
          slide.layout !== "PROCESS_FLOW" &&
          slide.layout !== "TIMELINE" &&
          slide.layout !== "ROADMAP" &&
          slide.layout !== "SYSTEM_DIAGRAM" &&
          slide.layout !== "QUOTE" &&
          slide.layout !== "QUOTE_CALLOUT" &&
          slide.layout !== "THREE_COLUMN" &&
          slide.layout !== "COMPARISON" &&
          slide.layout !== "MATRIX" &&
          slide.layout !== "CASE_STUDY" && (
            <div className="space-y-3 my-auto">
              {isEditable ? (
                <input
                  type="text"
                  value={slide.headline}
                  onChange={(e) => onUpdate({ headline: e.target.value })}
                  className="w-full bg-transparent font-bold text-2xl sm:text-3xl outline-none focus:ring-1 focus:ring-[var(--ag-gold)] rounded-lg p-1"
                  style={{ fontFamily: tokens.fontHeading, color: tokens.textColor }}
                />
              ) : (
                <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: tokens.fontHeading }}>
                  {slide.headline}
                </h2>
              )}

              {slide.subheadline && (
                <p className="text-sm sm:text-base font-medium" style={{ color: tokens.primaryColor }}>
                  {slide.subheadline}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className={slide.mediaUrl ? "md:col-span-7 space-y-3" : "md:col-span-12 space-y-3"}>
                  {isEditable ? (
                    <textarea
                      value={slide.bodyContent || ""}
                      onChange={(e) => onUpdate({ bodyContent: e.target.value })}
                      rows={3}
                      className="w-full bg-transparent text-sm sm:text-base opacity-85 outline-none focus:ring-1 focus:ring-[var(--ag-gold)] rounded-lg p-1 resize-none"
                    />
                  ) : (
                    <p className="text-sm sm:text-base opacity-85">{slide.bodyContent}</p>
                  )}

                  {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                    <ul className="space-y-1.5 text-xs sm:text-sm opacity-80">
                      {slide.bulletPoints.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-bold" style={{ color: tokens.primaryColor }}>
                            •
                          </span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {slide.mediaUrl && (
                  <div className="md:col-span-5 flex justify-center">
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 shadow-lg">
                      <img src={slide.mediaUrl} alt={slide.headline} className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>

      {/* ── Slide Footer Row ─────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] opacity-60 font-mono shrink-0">
        <span className="truncate max-w-[60%]">
          {slide.citations && slide.citations.length > 0
            ? `Citation: ${slide.citations[0]}`
            : "PresentX Studio • V7 Native"}
        </span>
        <span>Antigravity OS v7.0</span>
      </div>
    </div>
  );
};
