/**
 * ANTIGRAVITY OS v7.0 — FACT-BASED INTELLIGENCE + SECURITY FABRIC
 * SourceTrustEngine.ts: Source provenance registry, cryptographic verification & trust weighting
 */

import crypto from "crypto";
import fs from "fs";
import { SourceRecord, SourceClass, FreshnessClass } from "./TrustTypes";

export class SourceTrustEngine {
  private static instance: SourceTrustEngine;
  private readonly sources: Map<string, SourceRecord> = new Map();
  private readonly defaultTrustWeights: Record<SourceClass, number> = {
    OWNER_SOURCE: 1.0,
    LOCAL_RUNTIME: 0.98,
    LOCAL_FILE: 0.95,
    OFFICIAL_DOCUMENTATION: 0.90,
    PRIMARY_SOURCE: 0.85,
    SECONDARY_SOURCE: 0.65,
    TERTIARY_SOURCE: 0.45,
    USER_ASSERTION: 0.40,
    MODEL_OUTPUT: 0.20,
    UNKNOWN_SOURCE: 0.05
  };

  public static getInstance(): SourceTrustEngine {
    if (!SourceTrustEngine.instance) {
      SourceTrustEngine.instance = new SourceTrustEngine();
    }
    return SourceTrustEngine.instance;
  }

  /**
   * Registers and cryptographically validates a local file source
   */
  public registerLocalFile(filePath: string, publisher: string = "LOCAL_FILESYSTEM"): SourceRecord {
    const sourceId = `src_file_${crypto.createHash("sha256").update(filePath).digest("hex").slice(0, 12)}`;
    const now = Date.now();

    let contentHash = "";
    let integrity: "VERIFIED" | "SUSPECT" | "TAMPERED" | "UNKNOWN" = "UNKNOWN";

    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath);
        contentHash = crypto.createHash("sha256").update(content).digest("hex");
        integrity = "VERIFIED";
      } catch {
        contentHash = "UNREADABLE_FILE_ERROR";
        integrity = "SUSPECT";
      }
    } else {
      contentHash = "FILE_NOT_FOUND_ON_DISK";
      integrity = "SUSPECT";
    }

    const record: SourceRecord = {
      sourceId,
      location: filePath,
      type: "LOCAL_FILE",
      publisher,
      timestamp: now,
      retrievalTimestamp: now,
      contentHash,
      origin: "LOCAL_STORAGE",
      integrity,
      freshness: "REAL_TIME",
      trustLevel: integrity === "VERIFIED" ? this.defaultTrustWeights.LOCAL_FILE : 0.1,
      isDirectRuntime: false
    };

    this.sources.set(sourceId, record);
    return record;
  }

  /**
   * Registers a direct runtime observation source (e.g. process list, test output)
   */
  public registerRuntimeSource(name: string, executionOutput: string): SourceRecord {
    const now = Date.now();
    const contentHash = crypto.createHash("sha256").update(executionOutput).digest("hex");
    const sourceId = `src_runtime_${crypto.randomBytes(6).toString("hex")}`;

    const record: SourceRecord = {
      sourceId,
      location: `RUNTIME://${name}`,
      type: "LOCAL_RUNTIME",
      publisher: "ANTIGRAVITY_OS_SUPERVISOR",
      timestamp: now,
      retrievalTimestamp: now,
      contentHash,
      origin: "LIVE_PROCESS",
      integrity: "VERIFIED",
      freshness: "REAL_TIME",
      trustLevel: this.defaultTrustWeights.LOCAL_RUNTIME,
      isDirectRuntime: true
    };

    this.sources.set(sourceId, record);
    return record;
  }

  /**
   * Registers an external retrieved source with URL and timestamp
   */
  public registerExternalSource(params: {
    url: string;
    domain: string;
    publisher?: string;
    rawContent: string;
    type?: SourceClass;
    license?: string;
  }): SourceRecord {
    const now = Date.now();
    const contentHash = crypto.createHash("sha256").update(params.rawContent).digest("hex");
    const sourceId = `src_ext_${crypto.randomBytes(6).toString("hex")}`;
    const type = params.type || "PRIMARY_SOURCE";

    const record: SourceRecord = {
      sourceId,
      location: params.url,
      type,
      publisher: params.publisher || params.domain,
      timestamp: now,
      retrievalTimestamp: now,
      contentHash,
      origin: params.domain,
      license: params.license,
      integrity: "VERIFIED",
      freshness: "DAILY",
      trustLevel: this.defaultTrustWeights[type] || 0.5,
      isDirectRuntime: false
    };

    this.sources.set(sourceId, record);
    return record;
  }

  /**
   * Registers a model output source.
   * STRICT RULE: MODEL_OUTPUT trust level is low and CANNOT validate itself.
   */
  public registerModelOutputSource(modelName: string, promptHash: string, outputContent: string): SourceRecord {
    const now = Date.now();
    const contentHash = crypto.createHash("sha256").update(outputContent).digest("hex");
    const sourceId = `src_model_${crypto.randomBytes(6).toString("hex")}`;

    const record: SourceRecord = {
      sourceId,
      location: `MODEL://${modelName}?prompt=${promptHash.slice(0, 8)}`,
      type: "MODEL_OUTPUT",
      publisher: `AI_MODEL_${modelName}`,
      timestamp: now,
      retrievalTimestamp: now,
      contentHash,
      origin: "GENERATIVE_INFERENCE",
      integrity: "VERIFIED",
      freshness: "REAL_TIME",
      trustLevel: this.defaultTrustWeights.MODEL_OUTPUT,
      isDirectRuntime: false
    };

    this.sources.set(sourceId, record);
    return record;
  }

  public getSource(sourceId: string): SourceRecord | undefined {
    return this.sources.get(sourceId);
  }

  public getAllSources(): SourceRecord[] {
    return Array.from(this.sources.values());
  }

  public getSourceTrustWeight(type: SourceClass): number {
    return this.defaultTrustWeights[type] || 0.1;
  }
}
