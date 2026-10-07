/**
 * ANTIGRAVITY OS v5.4 — EXPERIENCE VERSIONING & KNOWLEDGE GOVERNANCE
 * ExperienceVersioning: Tracks knowledge versions, supports freezing, and rollbacks on degradation
 */

export interface KnowledgeVersion {
  versionId: string;
  timestamp: string;
  totalExperiences: number;
  verifiedPatternsCount: number;
  isFrozen: boolean;
  notes: string;
}

export class ExperienceVersioning {
  private static instance: ExperienceVersioning;
  private readonly versions: Map<string, KnowledgeVersion> = new Map();
  private currentVersion: string = "v5.4.0";
  private isMemoryFrozen: boolean = false;

  private constructor() {
    this.createSnapshot("v5.4.0", "Baseline Antigravity OS v5.4 Knowledge Base", 10, 5);
  }

  public static getInstance(): ExperienceVersioning {
    if (!ExperienceVersioning.instance) {
      ExperienceVersioning.instance = new ExperienceVersioning();
    }
    return ExperienceVersioning.instance;
  }

  public createSnapshot(
    versionId: string,
    notes: string,
    totalExp: number,
    verifiedCount: number
  ): KnowledgeVersion {
    const version: KnowledgeVersion = {
      versionId,
      timestamp: new Date().toISOString(),
      totalExperiences: totalExp,
      verifiedPatternsCount: verifiedCount,
      isFrozen: this.isMemoryFrozen,
      notes
    };
    this.versions.set(versionId, version);
    this.currentVersion = versionId;
    return version;
  }

  public freezeKnowledge(): void {
    this.isMemoryFrozen = true;
  }

  public unfreezeKnowledge(): void {
    this.isMemoryFrozen = false;
  }

  public isFrozen(): boolean {
    return this.isMemoryFrozen;
  }

  public getCurrentVersion(): string {
    return this.currentVersion;
  }

  public rollbackToVersion(versionId: string): boolean {
    if (!this.versions.has(versionId)) return false;
    this.currentVersion = versionId;
    return true;
  }
}
