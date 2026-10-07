/**
 * ANTIGRAVITY OS — UNIVERSAL INTERMEDIATE REPRESENTATION (UIR)
 * UniversalIntermediateRepresentation: Universal AST representing multi-format documents, designs, data, and code
 */

export type UIRNodeType =
  | "DOCUMENT"
  | "PAGE"
  | "SCREEN"
  | "SECTION"
  | "TEXT"
  | "IMAGE"
  | "VECTOR"
  | "TABLE"
  | "CHART"
  | "FORM"
  | "BUTTON"
  | "INPUT"
  | "CARD"
  | "COMPONENT"
  | "STYLE"
  | "TOKEN"
  | "ENTITY"
  | "FIELD"
  | "RELATIONSHIP"
  | "WORKFLOW"
  | "ACTION"
  | "NAVIGATION"
  | "USER"
  | "ROLE"
  | "PERMISSION"
  | "ASSET"
  | "METADATA";

export interface UIRElement {
  id: string;
  type: UIRNodeType;
  name: string;
  sourceFile: string;
  sourceParser: string;
  coordinates?: { page?: number; x: number; y: number; width: number; height: number };
  content?: string;
  properties: Record<string, any>;
  children?: UIRElement[];
  confidence: "EXACT" | "HIGH_CONFIDENCE" | "INFERRED" | "UNCERTAIN";
}

export interface UIRDocument {
  uirId: string;
  sourceManifest: {
    filenames: string[];
    detectedFormats: string[];
    totalSourcesCount: number;
  };
  rootElements: UIRElement[];
  entities: Array<{
    name: string;
    fields: Record<string, string>;
    sourceReference: string;
  }>;
  designTokens: Record<string, any>;
  workflows: Array<{
    name: string;
    steps: string[];
    sourceReference: string;
  }>;
  metadata: Record<string, any>;
  timestamp: string;
}

export class UIRBuilder {
  public static createEmptyUIR(uirId: string): UIRDocument {
    return {
      uirId,
      sourceManifest: { filenames: [], detectedFormats: [], totalSourcesCount: 0 },
      rootElements: [],
      entities: [],
      designTokens: {},
      workflows: [],
      metadata: {},
      timestamp: new Date().toISOString()
    };
  }
}
