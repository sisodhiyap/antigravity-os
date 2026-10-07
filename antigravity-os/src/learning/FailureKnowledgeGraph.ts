/**
 * ANTIGRAVITY OS v5.3 — FAILURE KNOWLEDGE GRAPH
 * FailureKnowledgeGraph: Graph mapping defects to root causes, patch patterns, and verified test verifiers
 */

export interface FailureRecord {
  id: string;
  category: "TYPE_MISMATCH" | "VALIDATION_ERROR" | "DATABASE_ERROR" | "UI_HYDRATION" | "ROUTING_ERROR" | "AUTH_EXCEPTION" | "PERSISTENCE_FAULT" | "AI_OFFLINE" | "MODEL_LAYER_CASCADE" | "PAYLOAD_PARSE_ERROR" | "TRAVERSAL";
  rootCause: string;
  detectionSignal: string;
  repairStrategy: string;
  patchPattern: string;
  verifiedTests: string[];
  successRate: number;
  timesEncountered: number;
}

export class FailureKnowledgeGraph {
  private static instance: FailureKnowledgeGraph;
  private readonly records: Map<string, FailureRecord> = new Map();

  private constructor() {
    this.seedDefaultKnowledge();
  }

  public static getInstance(): FailureKnowledgeGraph {
    if (!FailureKnowledgeGraph.instance) {
      FailureKnowledgeGraph.instance = new FailureKnowledgeGraph();
    }
    return FailureKnowledgeGraph.instance;
  }

  private seedDefaultKnowledge() {
    const defaultFailures: FailureRecord[] = [
      {
        id: "FKG_01",
        category: "TYPE_MISMATCH",
        rootCause: "Implicit any or unannotated parameter in route dispatcher",
        detectionSignal: "TypeScript TS7006 compile error",
        repairStrategy: "Add explicit interface type annotation (req: http.IncomingMessage, res: http.ServerResponse)",
        patchPattern: "explicit_type_annotation",
        verifiedTests: ["test_tsc_compilation"],
        successRate: 1.0,
        timesEncountered: 5
      },
      {
        id: "FKG_02",
        category: "PERSISTENCE_FAULT",
        rootCause: "Windows file-lock conflict during concurrent fs.renameSync",
        detectionSignal: "EPERM operation not permitted on .tmp file",
        repairStrategy: "Use direct atomic synchronous fs.writeFileSync with try/catch fallback",
        patchPattern: "direct_write_fallback",
        verifiedTests: ["test_db_persistence_crud"],
        successRate: 1.0,
        timesEncountered: 3
      },
      {
        id: "FKG_03",
        category: "TRAVERSAL",
        rootCause: "Unchecked relative path in file vault download or static file server",
        detectionSignal: "Double dot traversal (/../../etc/passwd, %2e%2e, backslash)",
        repairStrategy: "Enforce strict path.normalize safe root boundary check and block raw dot prefixes",
        patchPattern: "path_boundary_shield",
        verifiedTests: ["test_security_path_traversal"],
        successRate: 1.0,
        timesEncountered: 6
      }
    ];

    for (const f of defaultFailures) {
      this.records.set(f.id, f);
    }
  }

  public findStrategy(category: string, errorSnippet: string): FailureRecord | undefined {
    for (const record of this.records.values()) {
      if (record.category === category || errorSnippet.toLowerCase().includes(record.detectionSignal.toLowerCase())) {
        return record;
      }
    }
    return undefined;
  }

  public recordExperience(record: FailureRecord) {
    const existing = this.records.get(record.id);
    if (existing) {
      existing.timesEncountered += 1;
      existing.successRate = (existing.successRate * 0.8) + (record.successRate * 0.2);
    } else {
      this.records.set(record.id, record);
    }
  }

  public getAllRecords(): FailureRecord[] {
    return Array.from(this.records.values());
  }
}
