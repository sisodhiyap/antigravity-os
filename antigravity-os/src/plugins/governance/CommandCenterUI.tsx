/**
 * ANTIGRAVITY OS v7.0 — FINAL PRODUCT RELEASE & LONG-TERM GOVERNANCE
 * CommandCenterUI.tsx: Production Operator Command Center React Dashboard Component
 */

"use client";

import React, { useState } from "react";
import { RuntimeHealthReport, RuntimeCapability, ModelRealityRecord, GovernanceIncident, OwnerApprovalRequest } from "./GovernanceTypes";

interface CommandCenterProps {
  healthReport: RuntimeHealthReport;
  capabilities: RuntimeCapability[];
  models: ModelRealityRecord[];
  incidents: GovernanceIncident[];
  approvals: OwnerApprovalRequest[];
}

export const OperatorCommandCenter: React.FC<CommandCenterProps> = ({
  healthReport,
  capabilities,
  models,
  incidents,
  approvals
}) => {
  const [activeTab, setActiveTab] = useState<"HEALTH" | "CAPABILITIES" | "MODELS" | "APPROVALS" | "INCIDENTS">("HEALTH");

  const criticalIncidents = incidents.filter((i) => i.severity === "CRITICAL" && i.stage !== "CLOSED");

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl font-mono text-sm">
      {/* Top Banner: System Release State & Emergency Stop Alert */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <h1 className="text-xl font-bold tracking-wider text-cyan-400">
              ANTIGRAVITY OS V7.0 // COMMAND CENTER
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Status: <span className="text-emerald-400 font-bold">V7-FROZEN-PRODUCTION</span> &bull; Version: 7.0.0
          </p>
        </div>

        {/* Global Telemetry Metrics */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 text-xs">
          <div>CPU: <span className="text-cyan-400 font-bold">{healthReport.metrics.cpuPercent}%</span></div>
          <div>RAM: <span className="text-slate-200 font-semibold">{Math.round(healthReport.metrics.ramUsedMb / 1024)}GB / {Math.round(healthReport.metrics.ramTotalMb / 1024)}GB</span></div>
          <div>VRAM: <span className="text-emerald-400 font-bold">{Math.round(healthReport.metrics.vramUsedMb / 1024)}GB / {Math.round(healthReport.metrics.vramTotalMb / 1024)}GB</span></div>
          <div>P99: <span className="text-cyan-300">{healthReport.metrics.p99LatencyMs}ms</span></div>
        </div>
      </div>

      {/* Critical Failure Visual Dominance Banner */}
      {criticalIncidents.length > 0 && (
        <div className="p-4 bg-rose-950/80 border border-rose-600 rounded-lg text-rose-200 flex items-center justify-between animate-pulse">
          <div className="font-bold flex items-center gap-2">
            <span className="text-lg">⚠</span>
            CRITICAL INCIDENT ACTIVE: {criticalIncidents[0].title}
          </div>
          <span className="px-2 py-1 bg-rose-900 text-xs rounded border border-rose-700">HALTED</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {(["HEALTH", "CAPABILITIES", "MODELS", "APPROVALS", "INCIDENTS"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-colors ${
              activeTab === tab ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/50" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 1: System Health Plane */}
      {activeTab === "HEALTH" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(healthReport.components).map(([name, ch]) => (
            <div key={name} className="p-4 bg-slate-900/70 border border-slate-800 rounded-lg flex flex-col justify-between">
              <div className="text-xs text-slate-400 font-bold uppercase">{name}</div>
              <div className="my-2 flex items-center justify-between">
                <span className={`text-sm font-black ${ch.status === "HEALTHY" ? "text-emerald-400" : (ch.status === "DEGRADED" ? "text-amber-400" : "text-rose-400")}`}>
                  {ch.status}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">{ch.evidence}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Runtime Capability Registry */}
      {activeTab === "CAPABILITIES" && (
        <div className="space-y-3">
          {capabilities.map((cap) => (
            <div key={cap.id} className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">{cap.name}</div>
                <div className="text-xs text-slate-400">{cap.category} &bull; Provider: {cap.provider} &bull; {cap.isLocal ? "Local" : "Cloud"}</div>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] rounded font-bold">
                  {cap.availability}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Model Reality Registry */}
      {activeTab === "MODELS" && (
        <div className="space-y-3">
          {models.map((mod) => (
            <div key={`${mod.provider}_${mod.model}`} className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">{mod.model}</div>
                <div className="text-xs text-slate-400">{mod.provider} &bull; {mod.isLocal ? "Local Engine" : "Cloud Endpoint"} &bull; Latency: {mod.latencyMs}ms</div>
              </div>
              <span className={`px-2 py-1 text-[11px] rounded font-bold ${mod.status === "EXECUTABLE" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-rose-950 text-rose-300 border border-rose-800"}`}>
                {mod.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Owner Approval Center */}
      {activeTab === "APPROVALS" && (
        <div className="space-y-3">
          {approvals.length === 0 ? (
            <div className="p-6 text-center text-slate-500 bg-slate-900/50 rounded-lg">No pending approval requests.</div>
          ) : (
            approvals.map((req) => (
              <div key={req.id} className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400">{req.request}</span>
                  <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 text-xs rounded font-bold">{req.risk} RISK</span>
                </div>
                <p className="text-xs text-slate-300">{req.proposedAction}</p>
                <div className="text-[11px] text-slate-500">Scope: {req.scope} &bull; Evidence: {req.evidence}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: Incident Management */}
      {activeTab === "INCIDENTS" && (
        <div className="space-y-3">
          {incidents.length === 0 ? (
            <div className="p-6 text-center text-slate-500 bg-slate-900/50 rounded-lg">Zero security incidents recorded.</div>
          ) : (
            incidents.map((inc) => (
              <div key={inc.id} className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-400">{inc.title}</span>
                  <span className="text-xs text-slate-400">{inc.category} &bull; {inc.stage}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{inc.mitigation}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
