/**
 * ANTIGRAVITY OS v5.9 — CANONICAL UIR 2.0
 * Universal Intermediate Representation with strict fact provenance:
 * OBSERVED | INFERRED | ASSUMED | GENERATED | VERIFIED | UNKNOWN | CONTRADICTED
 */

export type ProvenanceLevel =
  | "OBSERVED"
  | "INFERRED"
  | "ASSUMED"
  | "GENERATED"
  | "VERIFIED"
  | "UNKNOWN"
  | "CONTRADICTED";

export interface ProvenanceFact {
  factId: string;
  statement: string;
  provenance: ProvenanceLevel;
  sourceReference: string;
  reasoning?: string;
  confidence: number; // 0 to 1
  evidence?: string[];
  alternatives?: string[];
}

export interface UIR2Document {
  uirId: string;
  source: {
    filenames: string[];
    mimes: string[];
    hashes: string[];
    metadata: Record<string, any>;
  };
  visual: {
    screens: Array<{
      id: string;
      name: string;
      bounds: { width: number; height: number };
      componentsCount: number;
    }>;
    typography: Record<string, any>;
    colors: Record<string, any>;
    spacing: Record<string, any>;
  };
  product: {
    entities: Array<{
      name: string;
      fields: Record<string, string>;
      provenance: ProvenanceLevel;
    }>;
    roles: string[];
    workflows: Array<{
      name: string;
      steps: string[];
      provenance: ProvenanceLevel;
    }>;
  };
  facts: ProvenanceFact[];
  timestamp: string;
}

export class UIR2Builder {
  public static createUIR2(uirId: string, filenames: string[]): UIR2Document {
    return {
      uirId,
      source: {
        filenames,
        mimes: filenames.map(() => "application/octet-stream"),
        hashes: filenames.map((f) => `sha256_${f.length}`),
        metadata: { totalInputs: filenames.length }
      },
      visual: {
        screens: [
          { id: "scr_01", name: "Dashboard", bounds: { width: 1440, height: 900 }, componentsCount: 8 },
          { id: "scr_02", name: "Entity Workspace", bounds: { width: 1440, height: 900 }, componentsCount: 12 }
        ],
        typography: { fontFamily: "Inter, sans-serif" },
        colors: { background: "#080a0f", accent: "#e6b800" },
        spacing: { base: 8, unit: "px" }
      },
      product: {
        entities: [
          { name: "Project", fields: { id: "string", title: "string", budget: "number" }, provenance: "OBSERVED" },
          { name: "Task", fields: { id: "string", projectId: "string", status: "string" }, provenance: "OBSERVED" },
          { name: "BillingRecord", fields: { id: "string", amount: "number" }, provenance: "INFERRED" }
        ],
        roles: ["ADMIN", "MANAGER", "COLLABORATOR", "CLIENT_REVIEWER"],
        workflows: [
          { name: "Deliverable Review & Approval", steps: ["Submit", "Review", "Sign-Off"], provenance: "OBSERVED" }
        ]
      },
      facts: [
        {
          factId: "fact_01",
          statement: "Login screen requires email and password",
          provenance: "OBSERVED",
          sourceReference: "auth_screen.png",
          confidence: 1.0
        },
        {
          factId: "fact_02",
          statement: "Multi-tenant organization boundary exists",
          provenance: "INFERRED",
          sourceReference: "dashboard_header.figma",
          reasoning: "Organization dropdown visible in top navigation",
          confidence: 0.88
        },
        {
          factId: "fact_03",
          statement: "OAuth SSO provider is not visible in visual mock",
          provenance: "UNKNOWN",
          sourceReference: "auth_screen.png",
          confidence: 0.0
        }
      ],
      timestamp: new Date().toISOString()
    };
  }
}
