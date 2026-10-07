/**
 * ANTIGRAVITY OS v7.0 — FACT-BASED INTELLIGENCE + SECURITY FABRIC
 * TrustUIComponents.tsx: React components for Operator Console Trust Center & Claim Inspector
 */

"use client";

import React, { useState } from "react";
import { ClaimRecord, SourceRecord, EvidenceRecord, FactStatus, TrustScore } from "./TrustTypes";

interface TrustCenterProps {
  claims: ClaimRecord[];
  sources: SourceRecord[];
  evidence: EvidenceRecord[];
  contradictions: string[];
  trustScore: TrustScore;
}

export const TrustCenter: React.FC<TrustCenterProps> = ({
  claims,
  sources,
  evidence,
  contradictions,
  trustScore
}) => {
  const [selectedClaim, setSelectedClaim] = useState<ClaimRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<FactStatus | "ALL">("ALL");

  const filteredClaims = filterStatus === "ALL" ? claims : claims.filter((c) => c.status === filterStatus);

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl font-mono text-sm">
      {/* Top Header & Trust Score Gauge */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-wider text-cyan-400 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
            TRUST CENTER // FACT-BASED SECURITY FABRIC
          </h2>
          <p className="text-xs text-slate-400">Zero-Hallucination &bull; Empirical Provenance &bull; Cryptographic Evidence</p>
        </div>

        <div className="flex items-center gap-6 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-semibold">TRUST SCORE</div>
            <div className={`text-2xl font-black ${trustScore.score >= 80 ? "text-emerald-400" : (trustScore.score >= 50 ? "text-amber-400" : "text-rose-400")}`}>
              {trustScore.score.toFixed(1)} <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>
          <div className="text-xs border-l border-slate-700 pl-4 space-y-1 text-slate-400">
            <div>Evidence: <span className="text-slate-200">{trustScore.evidenceScore.toFixed(0)}%</span></div>
            <div>Freshness: <span className="text-slate-200">{trustScore.freshnessScore.toFixed(0)}%</span></div>
            <div>Contradictions: <span className={contradictions.length > 0 ? "text-rose-400 font-bold" : "text-emerald-400"}>{contradictions.length}</span></div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", "VERIFIED", "OBSERVED", "SUPPORTED", "INFERRED", "GENERATED", "UNKNOWN", "CONTRADICTED", "STALE"] as const).map((status) => {
          const count = status === "ALL" ? claims.length : claims.filter((c) => c.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterStatus === status ? "bg-cyan-600 text-white" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span>{status}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-[10px]">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Claims List & Claim Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Claims List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredClaims.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/50 rounded-lg border border-slate-800 text-slate-500">
              No claims registered matching filter [{filterStatus}]
            </div>
          ) : (
            filteredClaims.map((claim) => (
              <div
                key={claim.claimId}
                onClick={() => setSelectedClaim(claim)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedClaim?.claimId === claim.claimId
                    ? "bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-950/50"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                    claim.status === "VERIFIED" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" :
                    claim.status === "OBSERVED" ? "bg-cyan-950 text-cyan-300 border border-cyan-800" :
                    claim.status === "SUPPORTED" ? "bg-blue-950 text-blue-300 border border-blue-800" :
                    claim.status === "CONTRADICTED" ? "bg-rose-950 text-rose-300 border border-rose-800" :
                    claim.status === "STALE" ? "bg-amber-950 text-amber-300 border border-amber-800" :
                    "bg-slate-800 text-slate-400"
                  }`}>
                    {claim.status} &bull; {claim.evidenceLevel}
                  </span>
                  <span className="text-[10px] text-slate-500">Hash: {claim.hash.slice(0, 10)}...</span>
                </div>
                <p className="text-slate-200 font-medium">{claim.text}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Confidence: {(claim.confidence * 100).toFixed(0)}%</span>
                  <span>{claim.evidenceIds.length} Evidence &bull; {claim.sourceIds.length} Sources</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right 1 Col: Claim Inspector */}
        <div className="bg-slate-900 p-5 rounded-lg border border-slate-800 flex flex-col h-full">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-800 pb-2">
            CLAIM INSPECTOR &bull; AUDIT TRAIL
          </h3>

          {selectedClaim ? (
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 text-xs">
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Claim Statement</div>
                <div className="text-slate-200 font-semibold mt-1">{selectedClaim.text}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded border border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-500">STATUS</div>
                  <div className="font-bold text-cyan-400">{selectedClaim.status}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">EVIDENCE LEVEL</div>
                  <div className="font-bold text-slate-200">{selectedClaim.evidenceLevel}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">CATEGORY</div>
                  <div className="font-semibold text-slate-300">{selectedClaim.riskCategory}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">FRESHNESS</div>
                  <div className="font-semibold text-slate-300">{selectedClaim.freshness.freshnessClass}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Cryptographic Provenance</div>
                <div className="bg-slate-950 p-2 rounded text-[10px] space-y-1 border border-slate-800 text-slate-400">
                  {selectedClaim.provenanceTrail.map((p, idx) => (
                    <div key={idx} className="leading-relaxed">&bull; {p}</div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                  Evidence IDs ({selectedClaim.evidenceIds.length})
                </div>
                <div className="space-y-1">
                  {selectedClaim.evidenceIds.map((evId) => (
                    <div key={evId} className="bg-slate-950 px-2 py-1 rounded text-[10px] text-emerald-400 border border-slate-800">
                      {evId}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-slate-600 text-xs">
              Select a claim to inspect its full evidence trail, cryptographic provenance, and verification hash.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
