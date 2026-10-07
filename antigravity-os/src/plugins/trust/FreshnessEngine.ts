/**
 * ANTIGRAVITY OS v7.0 — FACT-BASED INTELLIGENCE + SECURITY FABRIC
 * FreshnessEngine.ts: Temporal fact validity, expiration policies, and staleness detection
 */

import { FreshnessClass, ClaimRecord } from "./TrustTypes";

export class FreshnessEngine {
  private static instance: FreshnessEngine;

  // Max duration (ms) before information is considered stale for each class
  private readonly expirationDurations: Record<FreshnessClass, number> = {
    REAL_TIME: 1000 * 60 * 5, // 5 minutes
    HOURLY: 1000 * 60 * 60, // 1 hour
    DAILY: 1000 * 60 * 60 * 24, // 24 hours
    WEEKLY: 1000 * 60 * 60 * 24 * 7, // 7 days
    MONTHLY: 1000 * 60 * 60 * 24 * 30, // 30 days
    YEARLY: 1000 * 60 * 60 * 24 * 365, // 365 days
    STABLE: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years (immutable/foundational)
    UNKNOWN: 1000 * 60 * 15 // 15 mins
  };

  public static getInstance(): FreshnessEngine {
    if (!FreshnessEngine.instance) {
      FreshnessEngine.instance = new FreshnessEngine();
    }
    return FreshnessEngine.instance;
  }

  /**
   * Evaluates whether a claim is fresh or has lapsed into STALE status
   */
  public evaluateFreshness(claim: ClaimRecord, currentTime: number = Date.now()): {
    isFresh: boolean;
    isStale: boolean;
    ageMs: number;
    maxAllowedMs: number;
    freshnessClass: FreshnessClass;
    recommendedAction: "MAINTAIN" | "REVERIFY_REQUIRED" | "DEMOTE_TO_STALE";
  } {
    const freshnessClass = claim.freshness.freshnessClass || "UNKNOWN";
    const maxAllowedMs = this.expirationDurations[freshnessClass] || this.expirationDurations.UNKNOWN;
    const ageMs = currentTime - claim.freshness.lastVerified;

    const isStale = ageMs > maxAllowedMs;
    const isFresh = !isStale;

    let recommendedAction: "MAINTAIN" | "REVERIFY_REQUIRED" | "DEMOTE_TO_STALE" = "MAINTAIN";
    if (isStale) {
      recommendedAction = "DEMOTE_TO_STALE";
    } else if (ageMs > maxAllowedMs * 0.8) {
      recommendedAction = "REVERIFY_REQUIRED";
    }

    return {
      isFresh,
      isStale,
      ageMs,
      maxAllowedMs,
      freshnessClass,
      recommendedAction
    };
  }

  /**
   * Applies staleness rules to a claim, updating status to STALE if expired
   */
  public applyFreshnessCheck(claim: ClaimRecord, currentTime: number = Date.now()): boolean {
    const evaluation = this.evaluateFreshness(claim, currentTime);
    if (evaluation.isStale && claim.status !== "STALE" && claim.status !== "CONTRADICTED") {
      claim.status = "STALE";
      claim.freshness.isStale = true;
      claim.provenanceTrail.push(
        `Marked STALE at ${new Date(currentTime).toISOString()} (Age: ${Math.round(evaluation.ageMs / 1000)}s > Max: ${Math.round(evaluation.maxAllowedMs / 1000)}s)`
      );
      return true; // Demoted
    }
    return false;
  }
}
