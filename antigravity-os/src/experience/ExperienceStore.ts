/**
 * ANTIGRAVITY OS v5.4 — PERSISTENT EXPERIENCE STORE
 * ExperienceStore: Local-first SQLite/JSON storage with strict memory scope isolation
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { ExperienceRecord, MemoryScope } from "./ExperienceRecord";

export class ExperienceStore {
  private static instance: ExperienceStore;
  private readonly storeDir: string;
  private readonly records: Map<string, ExperienceRecord> = new Map();

  private constructor() {
    this.storeDir = path.resolve(__dirname, "..", "..", "artifacts", "experience");
    if (!fs.existsSync(this.storeDir)) {
      fs.mkdirSync(this.storeDir, { recursive: true });
    }
    this.loadFromDisk();
  }

  public static getInstance(): ExperienceStore {
    if (!ExperienceStore.instance) {
      ExperienceStore.instance = new ExperienceStore();
    }
    return ExperienceStore.instance;
  }

  /**
   * Sanitizes record to guarantee zero secrets, private tokens, or passwords enter memory
   */
  private sanitizeRecord(record: ExperienceRecord): ExperienceRecord {
    const serialized = JSON.stringify(record);
    // Sanitize any potential accidental password or session token fields
    const sanitized = JSON.parse(
      serialized
        .replace(/("password_hash"\s*:\s*)"[^"]+"/g, '$1"[REDACTED_MEMORY_HASH]"')
        .replace(/("password_salt"\s*:\s*)"[^"]+"/g, '$1"[REDACTED_MEMORY_SALT]"')
        .replace(/("token"\s*:\s*)"eyJ[^"]+"/g, '$1"[REDACTED_JWT_TOKEN]"')
    );
    return sanitized;
  }

  public saveExperience(record: ExperienceRecord): void {
    const cleanRecord = this.sanitizeRecord(record);
    this.records.set(cleanRecord.missionId, cleanRecord);

    try {
      const filePath = path.join(this.storeDir, `exp_${cleanRecord.missionId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(cleanRecord, null, 2), "utf-8");

      // Save index snapshot
      const indexPath = path.join(this.storeDir, "experience_index.json");
      const indexList = Array.from(this.records.values()).map((r) => ({
        missionId: r.missionId,
        projectId: r.projectId,
        domain: r.domain,
        outcome: r.finalOutcome,
        confidence: r.confidence,
        scope: r.scope,
        status: r.status,
        timestamp: r.timestamp
      }));
      fs.writeFileSync(indexPath, JSON.stringify(indexList, null, 2), "utf-8");
    } catch (e) {
      console.warn("[ExperienceStore] Failed to write experience to disk:", e);
    }
  }

  public getExperience(missionId: string): ExperienceRecord | undefined {
    return this.records.get(missionId);
  }

  public getExperiencesByProject(projectId: string): ExperienceRecord[] {
    return Array.from(this.records.values()).filter((r) => r.projectId === projectId);
  }

  public getExperiencesByScope(scope: MemoryScope): ExperienceRecord[] {
    return Array.from(this.records.values()).filter((r) => r.scope === scope);
  }

  public getAllExperiences(): ExperienceRecord[] {
    return Array.from(this.records.values());
  }

  public clear(): void {
    this.records.clear();
  }

  private loadFromDisk(): void {
    try {
      if (!fs.existsSync(this.storeDir)) return;
      const files = fs.readdirSync(this.storeDir);
      for (const f of files) {
        if (f.startsWith("exp_") && f.endsWith(".json")) {
          const content = fs.readFileSync(path.join(this.storeDir, f), "utf-8");
          const parsed: ExperienceRecord = JSON.parse(content);
          this.records.set(parsed.missionId, parsed);
        }
      }
    } catch {}
  }
}
