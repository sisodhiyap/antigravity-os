/**
 * ANTIGRAVITY OS v7.0 — FACT-BASED INTELLIGENCE + SECURITY FABRIC
 * CapabilityRegistry.ts: Anti-hallucination system capability and AI model registry
 */

import { CapabilityRecord, ModelCapabilityRecord, ModelStatus } from "./TrustTypes";

export class CapabilityRegistry {
  private static instance: CapabilityRegistry;
  private readonly capabilities: Map<string, CapabilityRecord> = new Map();
  private readonly models: Map<string, ModelCapabilityRecord> = new Map();

  public static getInstance(): CapabilityRegistry {
    if (!CapabilityRegistry.instance) {
      CapabilityRegistry.instance = new CapabilityRegistry();
    }
    return CapabilityRegistry.instance;
  }

  public registerCapability(params: {
    capabilityId: string;
    name: string;
    implementation: string;
    installed: boolean;
    enabled: boolean;
    executable: boolean;
    tested: boolean;
    verified: boolean;
    limitations?: string[];
    evidence?: string[];
  }): CapabilityRecord {
    // ANTI-FAKE RULE: Cannot declare verified if not tested and executable
    const verified = params.verified && params.tested && params.executable && params.installed;

    const record: CapabilityRecord = {
      capabilityId: params.capabilityId,
      name: params.name,
      implementation: params.implementation,
      installed: params.installed,
      enabled: params.enabled,
      executable: params.executable,
      tested: params.tested,
      verified,
      limitations: params.limitations || [],
      evidence: params.evidence || [],
      lastVerified: Date.now()
    };

    this.capabilities.set(params.capabilityId, record);
    return record;
  }

  public registerModel(params: {
    modelId: string;
    name: string;
    provider: string;
    status: ModelStatus;
    capabilities: string[];
    testedModes?: string[];
    evidenceIds?: string[];
  }): ModelCapabilityRecord {
    const record: ModelCapabilityRecord = {
      modelId: params.modelId,
      name: params.name,
      provider: params.provider,
      status: params.status,
      capabilities: params.capabilities,
      testedModes: params.testedModes || [],
      evidenceIds: params.evidenceIds || [],
      lastVerified: Date.now()
    };

    this.models.set(params.modelId, record);
    return record;
  }

  public getCapability(id: string): CapabilityRecord | undefined {
    return this.capabilities.get(id);
  }

  public getAllCapabilities(): CapabilityRecord[] {
    return Array.from(this.capabilities.values());
  }

  public getModel(id: string): ModelCapabilityRecord | undefined {
    return this.models.get(id);
  }

  public getAllModels(): ModelCapabilityRecord[] {
    return Array.from(this.models.values());
  }

  public isCapabilityVerified(id: string): boolean {
    const cap = this.capabilities.get(id);
    return Boolean(cap && cap.verified);
  }
}
