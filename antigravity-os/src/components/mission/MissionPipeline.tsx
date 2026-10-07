"use client";

import React from "react";
import { clsx } from "clsx";
import { CheckCircle2, Circle, Clock, AlertCircle, ArrowRight } from "lucide-react";

export type PipelineStageStatus = "completed" | "active" | "pending" | "failed";

export interface PipelineStage {
  id: string;
  number: number;
  name: string;
  description: string;
  status: PipelineStageStatus;
}

export interface MissionPipelineProps {
  stages?: PipelineStage[];
  currentStageId?: string;
  className?: string;
}

export const MissionPipeline: React.FC<MissionPipelineProps> = ({
  stages,
  currentStageId = "stage-1",
  className,
}) => {
  const defaultStages: PipelineStage[] = [
    { id: "stage-1", number: 1, name: "UNDERSTAND", description: "Intent & Scope", status: "completed" },
    { id: "stage-2", number: 2, name: "BLUEPRINT", description: "Architecture & IA", status: "completed" },
    { id: "stage-3", number: 3, name: "DESIGN", description: "Design Tokens & UI", status: "active" },
    { id: "stage-4", number: 4, name: "ASSETS", description: "Visual & SVG Gen", status: "pending" },
    { id: "stage-5", number: 5, name: "CODE", description: "Next.js Synthesis", status: "pending" },
    { id: "stage-6", number: 6, name: "PREVIEW", description: "Live Sandbox", status: "pending" },
    { id: "stage-7", number: 7, name: "QA", description: "Multi-Viewport Crawl", status: "pending" },
    { id: "stage-8", number: 8, name: "DEPLOY", description: "Local Container", status: "pending" },
  ];

  const pipelineStages = stages || defaultStages;

  return (
    <div className={clsx("w-full space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ag-muted)]">
          Mission Pipeline Execution Nodes
        </span>
        <span className="text-[10px] font-mono text-[var(--ag-gold)]">
          Stage {pipelineStages.findIndex((s) => s.status === "active") + 1} of {pipelineStages.length} Active
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {pipelineStages.map((stage, idx) => {
          const isCompleted = stage.status === "completed";
          const isActive = stage.status === "active";
          const isFailed = stage.status === "failed";

          return (
            <div
              key={stage.id}
              className={clsx(
                "p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between relative",
                isActive && "bg-[var(--ag-gold-alpha)] border-[var(--ag-gold)] shadow-[var(--ag-shadow-gold)] -translate-y-0.5",
                isCompleted && "bg-[var(--ag-surface)] border-[var(--ag-success)]/30",
                !isActive && !isCompleted && !isFailed && "bg-[var(--ag-surface)] border-[var(--ag-border-subtle)] opacity-70",
                isFailed && "bg-[var(--ag-error-bg)] border-[var(--ag-error)] text-[var(--ag-error)]"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={clsx(
                    "text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center border",
                    isActive && "border-[var(--ag-gold)] bg-[var(--ag-gold)] text-[#0B0B0A]",
                    isCompleted && "border-[var(--ag-success)] bg-[var(--ag-success)]/20 text-[var(--ag-success)]",
                    !isActive && !isCompleted && "border-[var(--ag-border)] text-[var(--ag-muted)]"
                  )}
                >
                  {stage.number}
                </span>

                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ag-success)]" />}
                {isActive && <span className="w-2 h-2 rounded-full bg-[var(--ag-gold)] animate-ping" />}
                {!isCompleted && !isActive && <Circle className="w-3 h-3 text-[var(--ag-border)]" />}
              </div>

              <div>
                <div
                  className={clsx(
                    "text-xs font-bold font-satoshi tracking-tight",
                    isActive ? "text-[var(--ag-gold-bright)]" : isCompleted ? "text-[var(--ag-text)]" : "text-[var(--ag-text-sec)]"
                  )}
                >
                  {stage.name}
                </div>
                <div className="text-[10px] text-[var(--ag-muted)] truncate mt-0.5">
                  {stage.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
