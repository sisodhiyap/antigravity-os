/**
 * ANTIGRAVITY OS v5.9 — PRODUCT GRAPH
 * ProductGraph: Universal knowledge and execution graph with 18 node types and 16 edge types
 */

export type ProductNodeType =
  | "PRODUCT"
  | "SCREEN"
  | "COMPONENT"
  | "USER"
  | "ROLE"
  | "ENTITY"
  | "DATABASE"
  | "API"
  | "WORKFLOW"
  | "ACTION"
  | "STATE"
  | "REQUIREMENT"
  | "DESIGN_TOKEN"
  | "ASSET"
  | "INTEGRATION"
  | "TEST"
  | "SECURITY_RULE"
  | "EVIDENCE"
  | "UNKNOWN";

export type ProductEdgeType =
  | "CONTAINS"
  | "USES"
  | "NAVIGATES_TO"
  | "DEPENDS_ON"
  | "CREATES"
  | "READS"
  | "UPDATES"
  | "DELETES"
  | "AUTHORIZES"
  | "TRIGGERS"
  | "VALIDATES"
  | "IMPLEMENTS"
  | "TESTS"
  | "DERIVED_FROM"
  | "VERIFIED_BY"
  | "CONTRADICTS"
  | "UNKNOWN_RELATION";

export interface ProductNode {
  id: string;
  name: string;
  type: ProductNodeType;
  metadata?: Record<string, any>;
}

export interface ProductEdge {
  fromNodeId: string;
  toNodeId: string;
  type: ProductEdgeType;
  metadata?: Record<string, any>;
}

export class ProductGraph {
  public readonly nodes: Map<string, ProductNode> = new Map();
  public readonly edges: ProductEdge[] = [];

  public addNode(node: ProductNode): void {
    this.nodes.set(node.id, node);
  }

  public addEdge(fromNodeId: string, toNodeId: string, type: ProductEdgeType, metadata?: Record<string, any>): void {
    this.edges.push({ fromNodeId, toNodeId, type, metadata });
  }

  public toJSON() {
    return {
      nodesCount: this.nodes.size,
      edgesCount: this.edges.length,
      nodes: Array.from(this.nodes.values()),
      edges: this.edges
    };
  }
}
