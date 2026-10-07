/**
 * ANTIGRAVITY OS v5.3 — PERSISTENT ENGINEERING MEMORY
 * EngineeringMemory: 5-tier isolated persistent memory architecture
 */

import fs from "fs";
import path from "path";

export interface OwnerPreference {
  autonomyLevel: number;
  localOnly: boolean;
  cloudFallbackAllowed: boolean;
  preferredTheme: string;
  enforceStrictTypes: boolean;
}

export interface ProjectMemoryEntry {
  projectId: string;
  projectName: string;
  architecture: string;
  schemas: Record<string, any>;
  apiEndpoints: string[];
  conventions: string[];
  lastUpdated: string;
}

export interface MissionMemoryEntry {
  missionId: string;
  prompt: string;
  graphId: string;
  nodeCount: number;
  failuresEncountered: number;
  repairsApplied: number;
  completedAt: string;
  realityScore: string;
}

export interface ReusablePattern {
  id: string;
  domain: string;
  title: string;
  pattern: string;
  successCount: number;
}

export class EngineeringMemory {
  private static instance: EngineeringMemory;
  private readonly memoryDir: string;
  
  public ownerMemory: OwnerPreference;
  public projectMemory: Map<string, ProjectMemoryEntry> = new Map();
  public missionMemory: Map<string, MissionMemoryEntry> = new Map();
  public engineeringMemory: Map<string, ReusablePattern> = new Map();
  public failureMemory: Map<string, { failureId: string; reason: string; antiPattern: string }> = new Map();

  private constructor() {
    this.memoryDir = path.resolve(__dirname, "..", "..", "artifacts", "memory");
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }

    this.ownerMemory = {
      autonomyLevel: 2, // Level 2 Supervised default
      localOnly: true,
      cloudFallbackAllowed: true,
      preferredTheme: "charcoal-gold",
      enforceStrictTypes: true
    };

    this.loadFromDisk();
  }

  public static getInstance(): EngineeringMemory {
    if (!EngineeringMemory.instance) {
      EngineeringMemory.instance = new EngineeringMemory();
    }
    return EngineeringMemory.instance;
  }

  public recordProject(entry: ProjectMemoryEntry) {
    this.projectMemory.set(entry.projectId, entry);
    this.saveToDisk();
  }

  public recordMission(entry: MissionMemoryEntry) {
    this.missionMemory.set(entry.missionId, entry);
    this.saveToDisk();
  }

  public recordPattern(pattern: ReusablePattern) {
    const existing = this.engineeringMemory.get(pattern.id);
    if (existing) {
      existing.successCount += 1;
    } else {
      this.engineeringMemory.set(pattern.id, pattern);
    }
    this.saveToDisk();
  }

  public recordFailureAntiPattern(id: string, reason: string, antiPattern: string) {
    this.failureMemory.set(id, { failureId: id, reason, antiPattern });
    this.saveToDisk();
  }

  public saveToDisk() {
    try {
      const state = {
        owner: this.ownerMemory,
        projects: Array.from(this.projectMemory.values()),
        missions: Array.from(this.missionMemory.values()),
        patterns: Array.from(this.engineeringMemory.values()),
        failures: Array.from(this.failureMemory.values())
      };
      fs.writeFileSync(path.join(this.memoryDir, "engineering_memory.json"), JSON.stringify(state, null, 2), "utf-8");
    } catch (e) {
      console.warn("[Memory] Could not persist memory to disk:", e);
    }
  }

  public loadFromDisk() {
    try {
      const filePath = path.join(this.memoryDir, "engineering_memory.json");
      if (fs.existsSync(filePath)) {
        const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        if (parsed.owner) this.ownerMemory = parsed.owner;
        if (parsed.projects) parsed.projects.forEach((p: any) => this.projectMemory.set(p.projectId, p));
        if (parsed.missions) parsed.missions.forEach((m: any) => this.missionMemory.set(m.missionId, m));
        if (parsed.patterns) parsed.patterns.forEach((pat: any) => this.engineeringMemory.set(pat.id, pat));
        if (parsed.failures) parsed.failures.forEach((f: any) => this.failureMemory.set(f.failureId, f));
      }
    } catch {}
  }
}
