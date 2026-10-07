/**
 * ANTIGRAVITY OS — VISUAL DESIGN GRAPH
 * VisualDesignGraph: Internal graph representation of ingested UI screens and components
 */

export type VisualNodeType =
  | "SCREEN"
  | "SECTION"
  | "COMPONENT"
  | "ELEMENT"
  | "TEXT"
  | "IMAGE"
  | "ICON"
  | "INPUT"
  | "BUTTON"
  | "NAVIGATION"
  | "MODAL"
  | "CARD"
  | "TABLE"
  | "FORM"
  | "CHART";

export type VisualEdgeType =
  | "CONTAINS"
  | "USES"
  | "VARIANT_OF"
  | "NAVIGATES_TO"
  | "DEPENDS_ON"
  | "REPEATS"
  | "RESPONDS_TO";

export interface VisualNode {
  id: string;
  name: string;
  type: VisualNodeType;
  bounds: { x: number; y: number; width: number; height: number };
  styles: {
    backgroundColor?: string;
    color?: string;
    fontSize?: number;
    fontWeight?: string | number;
    borderRadius?: number;
    padding?: string;
    margin?: string;
    boxShadow?: string;
  };
  attributes: Record<string, any>;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "INFERRED";
}

export interface VisualEdge {
  fromNodeId: string;
  toNodeId: string;
  type: VisualEdgeType;
  metadata?: Record<string, any>;
}

export class VisualDesignGraph {
  public readonly nodes: Map<string, VisualNode> = new Map();
  public readonly edges: VisualEdge[] = [];

  public addNode(node: VisualNode): void {
    this.nodes.set(node.id, node);
  }

  public addEdge(fromNodeId: string, toNodeId: string, type: VisualEdgeType, metadata?: Record<string, any>): void {
    this.edges.push({ fromNodeId, toNodeId, type, metadata });
  }

  public getNode(id: string): VisualNode | undefined {
    return this.nodes.get(id);
  }

  public getNodesByType(type: VisualNodeType): VisualNode[] {
    return Array.from(this.nodes.values()).filter((n) => n.type === type);
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
