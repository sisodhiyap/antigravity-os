/**
 * ANTIGRAVITY OS v5.3 — EVIDENCE STORE
 * EvidenceStore: Cryptographic SHA-256 evidence hashing and persistent artifact indexing
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface EvidenceRecord {
  id: string;
  missionId: string;
  category: string;
  filename: string;
  sha256: string;
  sizeBytes: number;
  timestamp: string;
}

export class EvidenceStore {
  private static instance: EvidenceStore;
  private readonly evidenceDir: string;
  private readonly records: Map<string, EvidenceRecord> = new Map();

  private constructor() {
    this.evidenceDir = path.resolve(__dirname, "..", "..", "artifacts", "autonomy");
    if (!fs.existsSync(this.evidenceDir)) {
      fs.mkdirSync(this.evidenceDir, { recursive: true });
    }
  }

  public static getInstance(): EvidenceStore {
    if (!EvidenceStore.instance) {
      EvidenceStore.instance = new EvidenceStore();
    }
    return EvidenceStore.instance;
  }

  public storeEvidence(missionId: string, filename: string, content: string | object, category: string): EvidenceRecord {
    const serialized = typeof content === "string" ? content : JSON.stringify(content, null, 2);
    const hash = crypto.createHash("sha256").update(serialized).digest("hex");
    const filePath = path.join(this.evidenceDir, filename);

    fs.writeFileSync(filePath, serialized, "utf-8");

    const record: EvidenceRecord = {
      id: `evi_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      missionId,
      category,
      filename,
      sha256: hash,
      sizeBytes: Buffer.byteLength(serialized),
      timestamp: new Date().toISOString()
    };

    this.records.set(record.id, record);
    return record;
  }

  public getAllRecords(): EvidenceRecord[] {
    return Array.from(this.records.values());
  }
}
