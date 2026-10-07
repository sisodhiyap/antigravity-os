/**
 * ANTIGRAVITY OS v7.0 — FACT-BASED INTELLIGENCE + SECURITY FABRIC
 * MemorySafetyEngine.ts: Creative content separation, Safe memory promotion & Knowledge item versioning
 */

import crypto from "crypto";
import { ClaimRecord, KnowledgeItem } from "./TrustTypes";

export class MemorySafetyEngine {
  private static instance: MemorySafetyEngine;
  private readonly knowledgeItems: Map<string, KnowledgeItem[]> = new Map(); // topic -> versions

  public static getInstance(): MemorySafetyEngine {
    if (!MemorySafetyEngine.instance) {
      MemorySafetyEngine.instance = new MemorySafetyEngine();
    }
    return MemorySafetyEngine.instance;
  }

  /**
   * Evaluates if a claim qualifies for permanent memory promotion.
   * STRICT RULE: Only VERIFIED or strongly SUPPORTED non-creative claims can be promoted.
   */
  public promoteToMemory(claim: ClaimRecord): {
    promoted: boolean;
    reason: string;
    item?: KnowledgeItem;
  } {
    // 1. Creative Content Separation Guard
    if (claim.type === "CREATIVE_GENERATED") {
      return {
        promoted: false,
        reason: "REJECTED: CREATIVE_GENERATED content is isolated and forbidden from entering factual memory base"
      };
    }

    // 2. Fact Status Guard: Must be VERIFIED or SUPPORTED with independent evidence
    if (claim.status !== "VERIFIED" && claim.status !== "SUPPORTED") {
      return {
        promoted: false,
        reason: `REJECTED: Claim status '${claim.status}' does not meet VERIFIED/SUPPORTED threshold for memory promotion`
      };
    }

    // 3. Stale Guard
    if (claim.freshness.isStale) {
      return {
        promoted: false,
        reason: "REJECTED: Stale claims cannot be promoted to long-term memory"
      };
    }

    // 4. Versioning and Promotion
    const topic = claim.riskCategory;
    const existingVersions = this.knowledgeItems.get(topic) || [];
    const newVersion = existingVersions.length + 1;
    const now = Date.now();

    // Mark previous current version as superseded
    existingVersions.forEach((v) => {
      if (v.status === "CURRENT") {
        v.status = "SUPERSEDED";
        v.supersededAt = now;
      }
    });

    const knowledgeId = `kn_${crypto.randomBytes(8).toString("hex")}`;
    const item: KnowledgeItem = {
      knowledgeId,
      version: newVersion,
      topic,
      content: claim.text,
      status: "CURRENT",
      sourceHash: crypto.createHash("sha256").update(claim.sourceIds.join(",")).digest("hex"),
      evidenceHash: crypto.createHash("sha256").update(claim.evidenceIds.join(",")).digest("hex"),
      createdAt: now,
      verifiedAt: now
    };

    existingVersions.push(item);
    this.knowledgeItems.set(topic, existingVersions);

    return {
      promoted: true,
      reason: `Successfully promoted verified claim to knowledge item v${newVersion}`,
      item
    };
  }

  public getAllKnowledgeItems(): KnowledgeItem[] {
    const all: KnowledgeItem[] = [];
    for (const versions of this.knowledgeItems.values()) {
      all.push(...versions);
    }
    return all;
  }

  public getTopicKnowledge(topic: string): KnowledgeItem[] {
    return this.knowledgeItems.get(topic) || [];
  }
}
