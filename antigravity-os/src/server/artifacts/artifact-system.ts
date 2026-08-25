export type ArtifactCategory =
  | "REQUIREMENTS"
  | "PRODUCT"
  | "UX"
  | "ARCHITECTURE"
  | "IMPLEMENTATION"
  | "TESTING"
  | "SECURITY"
  | "DEPLOYMENT";

export type ArtifactStatus = "DRAFT" | "VALIDATED" | "SUPERSEDED" | "ARCHIVED";

export interface ArtifactRecord<T = any> {
  artifactId: string;
  name: string;
  category: ArtifactCategory;
  version: number;
  projectId: string;
  taskId: string;
  agentRole: string;
  status: ArtifactStatus;
  source: "USER" | "SYSTEM" | "AI" | "TOOL" | "TEST";
  confidence: number; // 0.0 to 1.0
  content: T;
  createdAt: string;
  updatedAt: string;
  previousVersionId?: string;
}

export class VersionedArtifactSystem {
  private static instance: VersionedArtifactSystem;
  private artifacts: Map<string, ArtifactRecord> = new Map();
  private artifactHistory: Map<string, ArtifactRecord[]> = new Map(); // keyed by name+projectId

  private constructor() {
    this.seedInitialArtifacts();
  }

  public static getInstance(): VersionedArtifactSystem {
    if (!VersionedArtifactSystem.instance) {
      VersionedArtifactSystem.instance = new VersionedArtifactSystem();
    }
    return VersionedArtifactSystem.instance;
  }

  /**
   * Creates or updates a versioned artifact without destructive overwriting
   */
  public saveArtifact<T = any>(params: {
    name: string;
    category: ArtifactCategory;
    projectId: string;
    taskId: string;
    agentRole: string;
    source?: "USER" | "SYSTEM" | "AI" | "TOOL" | "TEST";
    confidence?: number;
    content: T;
  }): ArtifactRecord<T> {
    const key = `${params.projectId}:${params.name}`;
    const history = this.artifactHistory.get(key) || [];
    const latestVersion = history.length > 0 ? history[history.length - 1]!.version : 0;
    const nextVersion = latestVersion + 1;

    const artifactId = `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_v${nextVersion}`;
    const now = new Date().toISOString();

    const record: ArtifactRecord<T> = {
      artifactId,
      name: params.name,
      category: params.category,
      version: nextVersion,
      projectId: params.projectId,
      taskId: params.taskId,
      agentRole: params.agentRole,
      status: "VALIDATED",
      source: params.source || "AI",
      confidence: params.confidence ?? 0.95,
      content: params.content,
      createdAt: now,
      updatedAt: now,
      previousVersionId: history.length > 0 ? history[history.length - 1]!.artifactId : undefined,
    };

    this.artifacts.set(artifactId, record);
    history.push(record);
    this.artifactHistory.set(key, history);

    return record;
  }

  public getArtifact(artifactId: string): ArtifactRecord | undefined {
    return this.artifacts.get(artifactId);
  }

  public getLatestByName(projectId: string, name: string): ArtifactRecord | undefined {
    const key = `${projectId}:${name}`;
    const history = this.artifactHistory.get(key);
    if (!history || history.length === 0) return undefined;
    return history[history.length - 1];
  }

  public listArtifacts(projectId?: string, category?: ArtifactCategory): ArtifactRecord[] {
    let list = Array.from(this.artifacts.values());
    if (projectId) list = list.filter((a) => a.projectId === projectId || a.projectId === "global");
    if (category) list = list.filter((a) => a.category === category);
    return list;
  }

  private seedInitialArtifacts() {
    this.saveArtifact({
      name: "architecture.json",
      category: "ARCHITECTURE",
      projectId: "global",
      taskId: "init_task",
      agentRole: "ARCHITECT",
      source: "SYSTEM",
      confidence: 1.0,
      content: {
        platform: "Antigravity OS v4.0",
        controlPlane: "Kernel + Policy Engine + Artifact System",
        stack: ["Next.js 15", "React 19", "Prisma ORM", "Supabase", "Ollama GPU"],
      },
    });
  }
}

export const artifactSystem = VersionedArtifactSystem.getInstance();
