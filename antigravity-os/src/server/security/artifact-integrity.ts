/**
 * ANTIGRAVITY ARTIFACT INTEGRITY & MANIFEST GOVERNANCE
 *
 * Computes deterministic SHA-256 hashes for all generated release artifacts,
 * detects tampering or version drift, and generates release manifests.
 */
import crypto from "crypto";

export interface ArtifactManifestEntry {
  artifactId: string;
  name: string;
  category: string;
  version: number;
  sha256: string;
  byteLength: number;
  producer: string;
  createdAt: string;
}

export interface ReleaseManifest {
  releaseId: string;
  projectId: string;
  workspaceId: string;
  environment: "staging" | "production";
  createdAt: string;
  manifestHash: string;
  artifacts: ArtifactManifestEntry[];
  totalArtifacts: number;
  integrityVerified: boolean;
}

export class ArtifactIntegrityEngine {
  private static instance: ArtifactIntegrityEngine;

  private constructor() {}

  public static getInstance(): ArtifactIntegrityEngine {
    if (!ArtifactIntegrityEngine.instance) {
      ArtifactIntegrityEngine.instance = new ArtifactIntegrityEngine();
    }
    return ArtifactIntegrityEngine.instance;
  }

  /**
   * Computes deterministic SHA-256 hash of arbitrary content (string, Buffer, or Object)
   */
  public computeHash(content: unknown): string {
    const serialized =
      typeof content === "string"
        ? content
        : Buffer.isBuffer(content)
        ? content.toString("utf-8")
        : JSON.stringify(content, Object.keys(content as any).sort());
    return crypto.createHash("sha256").update(serialized).digest("hex");
  }

  /**
   * Generates a release manifest from a collection of versioned artifacts
   */
  public generateReleaseManifest(
    releaseId: string,
    projectId: string,
    workspaceId: string,
    environment: "staging" | "production",
    artifacts: Array<{
      id: string;
      name: string;
      category: string;
      version: number;
      content: unknown;
      agentRole: string;
      createdAt: string;
    }>
  ): ReleaseManifest {
    const manifestEntries: ArtifactManifestEntry[] = artifacts.map((art) => {
      const serialized = typeof art.content === "string" ? art.content : JSON.stringify(art.content);
      const sha256 = this.computeHash(art.content);
      return {
        artifactId: art.id,
        name: art.name,
        category: art.category,
        version: art.version,
        sha256,
        byteLength: Buffer.byteLength(serialized, "utf-8"),
        producer: art.agentRole,
        createdAt: art.createdAt,
      };
    });

    const manifestPayload = JSON.stringify(
      manifestEntries.map((e) => `${e.artifactId}:${e.version}:${e.sha256}`)
    );
    const manifestHash = crypto.createHash("sha256").update(manifestPayload).digest("hex");

    return {
      releaseId,
      projectId,
      workspaceId,
      environment,
      createdAt: new Date().toISOString(),
      manifestHash,
      artifacts: manifestEntries,
      totalArtifacts: manifestEntries.length,
      integrityVerified: true,
    };
  }

  /**
   * Verifies an artifact against its expected hash in a manifest
   */
  public verifyArtifact(content: unknown, expectedSha256: string): boolean {
    const actualHash = this.computeHash(content);
    return actualHash === expectedSha256;
  }
}

export const artifactIntegrity = ArtifactIntegrityEngine.getInstance();
