/**
 * ANTIGRAVITY OS v5.5 — REALITY EVIDENCE STORE
 * RealityEvidenceStore: Persistent storage for independent reality evidence and certificates
 */

import fs from "fs";
import path from "path";
import { MasterRealityCertificate } from "./RealityCertificate";

export class RealityEvidenceStore {
  private static instance: RealityEvidenceStore;
  private readonly storeDir: string;
  private readonly certificates: Map<string, MasterRealityCertificate> = new Map();

  private constructor() {
    this.storeDir = path.resolve(__dirname, "..", "..", "artifacts", "v55");
    if (!fs.existsSync(this.storeDir)) {
      fs.mkdirSync(this.storeDir, { recursive: true });
    }
  }

  public static getInstance(): RealityEvidenceStore {
    if (!RealityEvidenceStore.instance) {
      RealityEvidenceStore.instance = new RealityEvidenceStore();
    }
    return RealityEvidenceStore.instance;
  }

  public saveCertificate(cert: MasterRealityCertificate): void {
    this.certificates.set(cert.certificateId, cert);
    try {
      const filePath = path.join(this.storeDir, `${cert.certificateId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(cert, null, 2), "utf-8");

      // Save master certificate file
      const masterPath = path.join(this.storeDir, "reality-certificate.json");
      fs.writeFileSync(masterPath, JSON.stringify(cert, null, 2), "utf-8");
    } catch (e) {
      console.warn("[RealityEvidenceStore] Failed to write certificate:", e);
    }
  }

  public getCertificate(certId: string): MasterRealityCertificate | undefined {
    return this.certificates.get(certId);
  }

  public getAllCertificates(): MasterRealityCertificate[] {
    return Array.from(this.certificates.values());
  }
}
