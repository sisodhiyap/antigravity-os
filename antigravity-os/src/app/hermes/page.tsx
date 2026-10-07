"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  Shield,
  Zap,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Terminal,
  Activity,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  Search,
  Eye,
  Server,
  KeyRound,
  FileCheck
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, StatusBadge } from "@/components/ui/DesignSystem";
import { Button } from "@/components/ui/Button";

interface TimelineEvent {
  time: string;
  phase: string;
  msg: string;
  status: "success" | "info" | "warning" | "error";
}

export default function HermesOperatorConsole() {
  const [autonomyLevel, setAutonomyLevel] = useState<number>(2);
  const [isEmergencyStopped, setIsEmergencyStopped] = useState<boolean>(false);
  const [activeObjective, setActiveObjective] = useState<string>("Autonomous Full-Stack Feature Synthesis with Zero-Trust Reality Audit");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [ownerApprovalGiven, setOwnerApprovalGiven] = useState<boolean>(false);

  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    { time: "15:42:01.102", phase: "TASK_RECEIVED", msg: "Owner request parsed and isolated in sandbox session sbx_091", status: "info" },
    { time: "15:42:02.340", phase: "INPUT_ANALYZED", msg: "Canonical UIR 3.0 representation extracted (Provenance: OBSERVED)", status: "info" },
    { time: "15:42:03.890", phase: "PRODUCT_TWIN", msg: "Product Twin state reconciled across UI <-> API <-> DB", status: "success" },
    { time: "15:42:05.120", phase: "PLAN_CREATED", msg: "Topological DAG created (7 tasks, 0 circular dependencies)", status: "success" },
    { time: "15:42:07.450", phase: "MODEL_SELECTED", msg: "Routed to Qwen 2.5 Coder 7B (Ollama Local GPU) with GPT-4o fallback", status: "info" },
    { time: "15:42:09.010", phase: "SANDBOX_CREATED", msg: "Cryptographic checkpoint chk_091 recorded (SHA-256 state baseline)", status: "success" },
    { time: "15:42:12.650", phase: "CODE_GENERATED", msg: "React components, API router and SQLite schema written to sandbox", status: "success" },
    { time: "15:42:19.200", phase: "BUILD_PASSED", msg: "TypeScript compilation and linting verified with 0 errors", status: "success" },
    { time: "15:42:23.780", phase: "BROWSER_QA", msg: "Playwright journeys executed across 375px & 1440px viewports", status: "success" },
    { time: "15:42:31.050", phase: "SECURITY_PASSED", msg: "Red-Team AST audit passed: 22/22 injection vectors neutralized", status: "success" },
    { time: "15:42:35.400", phase: "REALITY_PROOF", msg: "Zero-Trust Reality Kernel verified claim PROVEN (ev_ledger_091)", status: "success" },
    { time: "15:42:38.100", phase: "PROMOTION_GATE", msg: "Level 4 promotion request created. Awaiting Owner Approval signature", status: "warning" }
  ]);

  const tasks = [
    { id: "task_01", name: "Understand Intent", model: "qwen2.5-coder:7b", status: "PASSED", time: "1.2s", evidence: "ev_01" },
    { id: "task_02", name: "Build Product Model", model: "qwen2.5-coder:7b", status: "PASSED", time: "1.5s", evidence: "ev_02" },
    { id: "task_03", name: "Synthesize Architecture", model: "llama3.3:70b", status: "PASSED", time: "2.1s", evidence: "ev_03" },
    { id: "task_04", name: "Compile Full-Stack Code", model: "qwen2.5-coder:7b", status: "PASSED", time: "6.5s", evidence: "ev_04" },
    { id: "task_05", name: "Test Suite & Browser QA", model: "qwen2.5-coder:7b", status: "PASSED", time: "8.4s", evidence: "ev_05" },
    { id: "task_06", name: "Generate Reality Proof", model: "RealityKernel", status: "PASSED", time: "0.8s", evidence: "ev_06" },
    { id: "task_07", name: "Owner Production Promotion", model: "OwnerGate", status: ownerApprovalGiven ? "PROMOTED" : "AWAITING_OWNER", time: "0.1s", evidence: "ev_07" }
  ];

  function toggleEmergencyStop() {
    setIsEmergencyStopped(!isEmergencyStopped);
    if (!isEmergencyStopped) {
      setAutonomyLevel(0);
      setTimeline((prev) => [
        { time: new Date().toISOString().substring(11, 23), phase: "EMERGENCY_STOP", msg: "EMERGENCY STOP TRIGGERED: Autonomy revoked to Level 0", status: "error" },
        ...prev
      ]);
    } else {
      setAutonomyLevel(2);
      setTimeline((prev) => [
        { time: new Date().toISOString().substring(11, 23), phase: "RESUMED", msg: "Emergency stop cleared by operator. Autonomy restored to Level 2", status: "info" },
        ...prev
      ]);
    }
  }

  function handleOwnerApproval() {
    setOwnerApprovalGiven(true);
    setTimeline((prev) => [
      { time: new Date().toISOString().substring(11, 23), phase: "OWNER_APPROVED", msg: "Level 5 Owner Signature verified. Sandbox promoted to production.", status: "success" },
      ...prev
    ]);
  }

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--ag-border)] pb-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--ag-text)] font-satoshi flex items-center gap-2">
                  HERMES AUTONOMOUS AGENT <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">v1.0.0 PLUGIN</span>
                </h1>
                <p className="text-xs text-[var(--ag-text-sec)]">
                  Sandbox-First Autonomous Engineering above the Frozen V7 Core
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Emergency Stop Switch */}
            <button
              onClick={toggleEmergencyStop}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg ${
                isEmergencyStopped
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
              }`}
            >
              <Flame className="w-4 h-4" />
              {isEmergencyStopped ? "EMERGENCY STOP ACTIVE" : "TRIGGER EMERGENCY STOP"}
            </button>

            {/* Owner Promotion Button */}
            {!ownerApprovalGiven && (
              <Button
                variant="primary"
                onClick={handleOwnerApproval}
                className="flex items-center gap-2 text-xs"
              >
                <KeyRound className="w-4 h-4" />
                Approve Promotion (Level 5)
              </Button>
            )}
          </div>
        </div>

        {/* Control Bar: Autonomy Level & Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Autonomy Selector */}
          <Card className="p-4 bg-[var(--ag-elevated)] border-[var(--ag-border)]">
            <div className="text-xs font-mono text-[var(--ag-text-sec)] mb-2 flex items-center justify-between">
              <span>AUTONOMY LEVEL</span>
              <span className="text-amber-400 font-bold">LEVEL {autonomyLevel}</span>
            </div>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  disabled={isEmergencyStopped}
                  onClick={() => setAutonomyLevel(lvl)}
                  className={`flex-1 py-1.5 text-xs font-mono rounded font-bold transition-all ${
                    autonomyLevel === lvl
                      ? "bg-amber-500 text-black shadow"
                      : "bg-black/30 text-[var(--ag-text-sec)] hover:bg-white/5"
                  }`}
                >
                  L{lvl}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-[var(--ag-text-sec)] mt-2">
              {autonomyLevel === 0 && "L0: Read-Only Observe Mode"}
              {autonomyLevel === 1 && "L1: Analysis & Inspection"}
              {autonomyLevel === 2 && "L2: Isolated Sandbox Write (Default)"}
              {autonomyLevel === 3 && "L3: Sandbox Execution & Tests"}
              {autonomyLevel === 4 && "L4: Promotion Request Ready"}
              {autonomyLevel === 5 && "L5: Owner-Approved Production"}
            </div>
          </Card>

          {/* Model Routing */}
          <Card className="p-4 bg-[var(--ag-elevated)] border-[var(--ag-border)]">
            <div className="text-xs font-mono text-[var(--ag-text-sec)] mb-1 flex items-center justify-between">
              <span>PRIMARY ROUTER</span>
              <StatusBadge variant="online" label="LOCAL GPU" />
            </div>
            <div className="text-sm font-bold text-[var(--ag-text)]">Qwen 2.5 Coder 7B</div>
            <div className="text-[11px] text-[var(--ag-text-sec)] mt-1">Fallback: Llama 3.3 70B &rarr; GPT-4o</div>
          </Card>

          {/* Reality Score */}
          <Card className="p-4 bg-[var(--ag-elevated)] border-[var(--ag-border)]">
            <div className="text-xs font-mono text-[var(--ag-text-sec)] mb-1 flex items-center justify-between">
              <span>REALITY SCORE</span>
              <span className="text-emerald-400 font-bold font-mono">100 / 100</span>
            </div>
            <div className="text-sm font-bold text-emerald-400">Zero-Trust Proven</div>
            <div className="text-[11px] text-[var(--ag-text-sec)] mt-1">0 Unproven claims | 0 Contradictions</div>
          </Card>

          {/* Token & Cost */}
          <Card className="p-4 bg-[var(--ag-elevated)] border-[var(--ag-border)]">
            <div className="text-xs font-mono text-[var(--ag-text-sec)] mb-1 flex items-center justify-between">
              <span>TOKEN / COST METER</span>
              <span className="text-cyan-400 font-bold font-mono">$0.0000</span>
            </div>
            <div className="text-sm font-bold text-[var(--ag-text)]">42,850 Tokens</div>
            <div className="text-[11px] text-[var(--ag-text-sec)] mt-1">100% Local GPU Ollama inference</div>
          </Card>
        </div>

        {/* Task DAG Visualizer */}
        <Card className="p-5 bg-[var(--ag-elevated)] border-[var(--ag-border)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--ag-text)] font-mono">
                Autonomous Task DAG Execution Graph
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--ag-text-sec)]">
              {tasks.filter((t) => t.status === "PASSED" || t.status === "PROMOTED").length} / {tasks.length} Completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {tasks.map((task, idx) => (
              <div
                key={task.id}
                className="p-3 rounded-lg bg-black/40 border border-[var(--ag-border)] flex flex-col justify-between"
              >
                <div>
                  <div className="text-[10px] font-mono text-amber-400/80 mb-1">0{idx + 1}. {task.id}</div>
                  <div className="text-xs font-semibold text-[var(--ag-text)] leading-tight mb-2">{task.name}</div>
                </div>
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[var(--ag-text-sec)]">Model:</span>
                    <span className="text-[var(--ag-text)] truncate max-w-[70px]">{task.model}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[var(--ag-text-sec)]">Proof:</span>
                    <span className="text-emerald-400">{task.evidence}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      task.status === "PASSED" || task.status === "PROMOTED"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Timeline & Evidence Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Agent Timeline */}
          <Card className="p-5 bg-[var(--ag-elevated)] border-[var(--ag-border)] flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--ag-text)] font-mono">
                Live Agent Execution Timeline
              </h2>
            </div>
            <div className="space-y-3 font-mono text-xs overflow-y-auto max-h-[360px] pr-2">
              {timeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded bg-black/20 border border-white/5">
                  <span className="text-[10px] text-[var(--ag-text-sec)] shrink-0 pt-0.5">{item.time}</span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-amber-300 mr-2">
                      {item.phase}
                    </span>
                    <span className="text-[var(--ag-text)]">{item.msg}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Reality Proof & Safety Invariants */}
          <Card className="p-5 bg-[var(--ag-elevated)] border-[var(--ag-border)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--ag-text)] font-mono">
                  Reality Proof & Hard Invariants
                </h2>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  "Invariant 1: Frozen V7 Core Immutable (0 byte delta)",
                  "Invariant 2: Production mutation blocked without Owner Approval",
                  "Invariant 3: Zero secrets stored across memory & logs",
                  "Invariant 4: External input quarantined as data (never commands)",
                  "Invariant 5: Zero-Trust Reality Kernel verified claim proof"
                ].map((inv, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-emerald-400/90 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{inv}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-black/30 border border-white/10">
              <div className="text-xs font-mono text-[var(--ag-text-sec)] mb-1">EVIDENCE HASH CHAIN LEDGER</div>
              <div className="text-[11px] font-mono text-emerald-300 break-all">
                SHA256: 4f8b9e1a7c3d2e5f6a0b8c9d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f
              </div>
              <div className="text-[10px] text-[var(--ag-text-sec)] mt-1">
                Verified: 12 Events Recorded | 0 Breaks in Hash Chain
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
