"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PresentationProject } from "@/presentx/types";
import { SlideCanvas } from "@/presentx/components/SlideCanvas";
import { PresentXDesignSystem } from "@/presentx/engine/PresentXDesignSystem";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Clock,
  FileText,
  MousePointer,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";

export default function PresentXPresentModePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<PresentationProject | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch(`/api/presentx/projects?id=${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.project) {
          setProject(data.project);
        }
      })
      .catch(() => {});
  }, [projectId]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!project) return;
      if (e.key === "ArrowRight" || e.key === "Space") {
        setCurrentIndex((i) => Math.min(i + 1, project.slides.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Escape") {
        router.push(`/presentx/editor/${projectId}`);
      } else if (e.key === "n" || e.key === "N") {
        setShowNotes((prev) => !prev);
      } else if (e.key === "l" || e.key === "L") {
        setIsLaserActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project, projectId, router]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isLaserActive) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!project) {
    return (
      <div className="h-screen w-screen bg-[#080808] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-[var(--ag-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeSlide = project.slides[currentIndex];
  const tokens = project.designTokens || PresentXDesignSystem.getTokensForDirection("FUTURISTIC");
  const total = project.slides.length;

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative h-screen w-screen bg-[#060608] text-white flex flex-col justify-between overflow-hidden select-none"
    >
      {/* ── Virtual Laser Pointer Dot ────────────────────────────── */}
      {isLaserActive && (
        <div
          className="fixed w-5 h-5 rounded-full bg-red-500 shadow-[0_0_15px_#ff0000] pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{ left: mousePos.x, top: mousePos.y }}
        />
      )}

      {/* ── Top Presenter Status Bar ─────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 z-40">
        <div className="flex items-center gap-3">
          <Link
            href={`/presentx/editor/${projectId}`}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm font-bold truncate max-w-sm">{project.title}</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-white/80 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
            <Clock className="w-3.5 h-3.5 text-[var(--ag-gold)]" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <button
            onClick={() => setIsLaserActive(!isLaserActive)}
            className={clsx(
              "px-2.5 py-1 rounded-full border text-xs flex items-center gap-1.5 transition-colors",
              isLaserActive ? "bg-red-500/20 border-red-500 text-red-400" : "bg-white/5 border-white/10 text-white/70"
            )}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Laser (L)</span>
          </button>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className={clsx(
              "px-2.5 py-1 rounded-full border text-xs flex items-center gap-1.5 transition-colors",
              showNotes ? "bg-[var(--ag-gold-alpha)] border-[var(--ag-gold)] text-[var(--ag-gold)]" : "bg-white/5 border-white/10 text-white/70"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes (N)</span>
          </button>
        </div>
      </div>

      {/* ── Slide Canvas Container ───────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 min-h-0 relative">
        {activeSlide && (
          <SlideCanvas
            slide={activeSlide}
            tokens={tokens}
            onUpdate={() => {}}
            isEditable={false}
          />
        )}
      </div>

      {/* ── Speaker Notes Teleprompter Overlay ───────────────────── */}
      {showNotes && activeSlide && (
        <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 w-[90%] max-w-2xl p-4 rounded-2xl bg-black/90 backdrop-blur-xl border border-[var(--ag-gold)]/40 shadow-2xl z-40 text-xs sm:text-sm text-white/90 space-y-1 animate-slide-up">
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--ag-gold)] font-bold">
            <span>SPEAKER TELEPROMPTER • SLIDE {currentIndex + 1}</span>
            <button onClick={() => setShowNotes(false)} className="text-white/60 hover:text-white">✕</button>
          </div>
          <p className="leading-relaxed">{activeSlide.speakerNotes || "No presenter notes for this slide."}</p>
        </div>
      )}

      {/* ── Bottom Floating Controls ─────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/60 backdrop-blur-md border-t border-white/10 z-40">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          disabled={currentIndex === 0}
          className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>

        <span className="text-xs font-mono text-white/80 font-bold">
          {currentIndex + 1} / {total}
        </span>

        <button
          onClick={() => setCurrentIndex((i) => Math.min(i + 1, total - 1))}
          disabled={currentIndex === total - 1}
          className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold flex items-center gap-1 transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
