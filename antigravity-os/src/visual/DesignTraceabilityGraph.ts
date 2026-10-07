/**
 * ANTIGRAVITY OS — DESIGN-TO-CODE TRACEABILITY GRAPH
 * DesignTraceabilityGraph: Tracks 1-to-1 links from Figma nodes / image bounds -> components -> files -> tests
 */

export interface TraceabilityLink {
  designNodeId: string;
  designElementName: string;
  sourceFilePath: string;
  componentSymbolName: string;
  runtimeElementSelector: string;
  verificationTestName: string;
}

export class DesignTraceabilityGraph {
  private readonly links: TraceabilityLink[] = [];

  public addLink(link: TraceabilityLink): void {
    this.links.push(link);
  }

  public getLinkByDesignNode(nodeId: string): TraceabilityLink | undefined {
    return this.links.find((l) => l.designNodeId === nodeId);
  }

  public getLinkByComponent(symbolName: string): TraceabilityLink | undefined {
    return this.links.find((l) => l.componentSymbolName === symbolName);
  }

  public getAllLinks(): TraceabilityLink[] {
    return [...this.links];
  }
}
