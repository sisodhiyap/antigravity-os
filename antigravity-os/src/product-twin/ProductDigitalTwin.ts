/**
 * ANTIGRAVITY OS v6.1 — PRODUCT DIGITAL TWIN
 * ProductDigitalTwin: Complete living digital representation of the product, architecture, data, and telemetry
 */

export type TwinProvenance =
  | "OBSERVED"
  | "INFERRED"
  | "ASSUMED"
  | "GENERATED"
  | "VERIFIED"
  | "UNKNOWN"
  | "CONTRADICTED";

export interface TwinNode {
  id: string;
  type:
    | "PRODUCT"
    | "SCREEN"
    | "COMPONENT"
    | "DESIGN_TOKEN"
    | "USER_ROLE"
    | "ENTITY"
    | "DATABASE_TABLE"
    | "API_ENDPOINT"
    | "WORKFLOW"
    | "ACTION"
    | "STATE"
    | "INTEGRATION"
    | "DEPENDENCY"
    | "TEST"
    | "SECURITY_POLICY"
    | "PERFORMANCE_BASELINE"
    | "UX_BASELINE"
    | "ACCESSIBILITY_REQ";
  name: string;
  provenance: TwinProvenance;
  confidence: number;
  evidenceRefs: string[];
  attributes: Record<string, any>;
  version: number;
  updatedAt: string;
}

export interface TwinEdge {
  fromNodeId: string;
  toNodeId: string;
  relation: string;
  provenance: TwinProvenance;
}

export class ProductDigitalTwin {
  public readonly nodes: Map<string, TwinNode> = new Map();
  public readonly edges: TwinEdge[] = [];
  public version: number = 1;

  public addNode(node: TwinNode): void {
    this.nodes.set(node.id, node);
  }

  public addEdge(fromNodeId: string, toNodeId: string, relation: string, provenance: TwinProvenance = "OBSERVED"): void {
    this.edges.push({ fromNodeId, toNodeId, relation, provenance });
  }

  public getNode(id: string): TwinNode | undefined {
    return this.nodes.get(id);
  }

  public toJSON() {
    return {
      version: this.version,
      nodesCount: this.nodes.size,
      edgesCount: this.edges.length,
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
      timestamp: new Date().toISOString()
    };
  }
}
