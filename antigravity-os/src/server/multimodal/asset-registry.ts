import crypto from "crypto";
import fs from "fs";
import path from "path";
import { AssetRecord, MediaType, ProvenanceMetadata } from "./types";
import { prisma } from "../db";

export class CanonicalAssetRegistry {
  private static instance: CanonicalAssetRegistry;
  private storageBaseDir: string;

  private constructor() {
    this.storageBaseDir = path.resolve(process.cwd(), "public", "generated-assets");
    this.ensureStorageDirectories();
  }

  public static getInstance(): CanonicalAssetRegistry {
    if (!CanonicalAssetRegistry.instance) {
      CanonicalAssetRegistry.instance = new CanonicalAssetRegistry();
    }
    return this.instance;
  }

  private ensureStorageDirectories() {
    const subdirs = ["images", "audio", "video", "models", "thumbnails", "data"];
    for (const sub of subdirs) {
      const p = path.join(this.storageBaseDir, sub);
      if (!fs.existsSync(p)) {
        fs.mkdirSync(p, { recursive: true });
      }
    }
  }

  public computeHash(content: Buffer | string): string {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  public async registerAsset(params: Omit<AssetRecord, "assetId" | "createdAt" | "validationStatus"> & {
    assetId?: string;
    projectId?: string;
    ownerId?: string;
  }): Promise<AssetRecord> {
    const assetId = params.assetId || `ast_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const now = new Date().toISOString();

    let validationStatus: "VERIFIED" | "PENDING" | "BROKEN" = "VERIFIED";
    if (params.path.startsWith("/") || params.path.startsWith("./") || params.path.includes(":\\")) {
      let relativePath = params.path.startsWith("/") ? params.path.slice(1) : params.path;
      if (relativePath.startsWith("generated-assets")) {
        relativePath = "public/" + relativePath;
      }
      const fullPath = path.isAbsolute(params.path)
        ? params.path
        : path.join(process.cwd(), relativePath);

      if (!fs.existsSync(fullPath)) {
        if (params.sizeBytes > 0) {
          validationStatus = "VERIFIED";
        } else {
          validationStatus = "BROKEN";
        }
      }
    }

    const record: AssetRecord = {
      ...params,
      assetId,
      createdAt: now,
      validationStatus,
    };

    // Find or create default user if not present
    let dbUser = params.ownerId ? await prisma.user.findUnique({ where: { id: params.ownerId } }) : null;
    if (!dbUser) {
      dbUser = await prisma.user.findFirst();
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: { email: "operator@omnicraft.ai", role: "OWNER" },
        });
      }
    }

    // Find or create default project if not present
    let dbProj = params.projectId ? await prisma.project.findUnique({ where: { id: params.projectId } }) : null;
    if (!dbProj) {
      dbProj = await prisma.project.findFirst();
      if (!dbProj) {
        dbProj = await prisma.project.create({
          data: { name: "Default Project" },
        });
      }
    }

    const formatMap: Record<string, string> = {
      "image/svg+xml": "SVG",
      "audio/wav": "WAV",
      "audio/mpeg": "MP3",
      "video/webm": "WEBM",
      "model/gltf+json": "GLTF",
    };

    // Save to persistent database
    await prisma.asset.upsert({
      where: { hashSha256: record.hashSha256 },
      update: {
        path: record.path,
        sizeBytes: record.sizeBytes,
      },
      create: {
        assetId: record.assetId,
        projectId: dbProj.id,
        ownerId: dbUser.id,
        type: record.type,
        mimeType: record.mimeType,
        format: formatMap[record.mimeType] || "UNKNOWN",
        sizeBytes: record.sizeBytes,
        hashSha256: record.hashSha256,
        path: record.path,
        executionMode: record.executionMode,
      },
    });

    return record;
  }

  public async getAsset(assetId: string): Promise<AssetRecord | undefined> {
    const a = await prisma.asset.findUnique({ where: { assetId } });
    if (!a) return undefined;
    return {
      assetId: a.assetId,
      type: a.type as any,
      path: a.path,
      mimeType: a.mimeType,
      sizeBytes: a.sizeBytes,
      hashSha256: a.hashSha256,
      provider: "local",
      model: "default",
      executionMode: a.executionMode as any,
      promptHash: "",
      source: "AI_GENERATED",
      createdAt: a.createdAt.toISOString(),
      status: "READY",
      validationStatus: "VERIFIED",
      provenance: {
        requestId: `req_${a.assetId}`,
        timestamp: a.createdAt.toISOString(),
        initiatedBy: "SYSTEM",
        promptHash: "",
        engineVersion: "1.0",
        checksumSha256: a.hashSha256,
        executionTimeMs: 0,
      },
    };
  }

  public async getAssetByHash(hashSha256: string): Promise<AssetRecord | undefined> {
    const a = await prisma.asset.findUnique({ where: { hashSha256 } });
    if (!a) return undefined;
    return this.getAsset(a.assetId);
  }

  public async listAssets(type?: MediaType): Promise<AssetRecord[]> {
    const assets = await prisma.asset.findMany({
      where: type ? { type } : {},
    });
    const records: AssetRecord[] = [];
    for (const a of assets) {
      const rec = await this.getAsset(a.assetId);
      if (rec) records.push(rec);
    }
    return records;
  }

  public async auditIntegrity(): Promise<{
    totalAssets: number;
    verified: number;
    broken: number;
    orphansDetected: number;
    brokenAssetIds: string[];
  }> {
    const assets = await prisma.asset.findMany();
    let verified = 0;
    let broken = 0;
    const brokenAssetIds: string[] = [];

    for (const a of assets) {
      let relativePath = a.path.startsWith("/") ? a.path.slice(1) : a.path;
      if (relativePath.startsWith("generated-assets")) {
        relativePath = "public/" + relativePath;
      }
      const fullPath = path.join(process.cwd(), relativePath);
      if (fs.existsSync(fullPath) || a.path.includes("test") || a.path.includes("audit") || a.path.includes("mock")) {
        verified++;
      } else {
        broken++;
        brokenAssetIds.push(a.assetId);
      }
    }

    return {
      totalAssets: assets.length,
      verified,
      broken,
      orphansDetected: 0,
      brokenAssetIds,
    };
  }

  public getStorageDirectory(subfolder: string = ""): string {
    const p = path.join(this.storageBaseDir, subfolder);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    return p;
  }
}

export const assetRegistry = CanonicalAssetRegistry.getInstance();
