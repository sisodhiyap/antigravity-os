import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  ImageGenerationRequest,
  ImageGenerationResponse,
  AssetRecord,
  ProviderMetadata,
  ProvenanceMetadata,
} from "./types";
import { assetRegistry } from "./asset-registry";
import { providerRegistry } from "./provider-registry";

export class UnifiedImageService {
  private static instance: UnifiedImageService;

  private constructor() {}

  public static getInstance(): UnifiedImageService {
    if (!UnifiedImageService.instance) {
      UnifiedImageService.instance = new UnifiedImageService();
    }
    return this.instance;
  }

  public normalizePrompt(rawPrompt: string): { normalized: string; promptHash: string } {
    const cleaned = rawPrompt.trim().replace(/\s+/g, " ");
    const promptHash = crypto.createHash("sha256").update(cleaned).digest("hex");
    return { normalized: cleaned, promptHash };
  }

  public resolveDimensions(aspectRatio: string = "1:1"): { width: number; height: number } {
    switch (aspectRatio) {
      case "16:9":
        return { width: 1920, height: 1080 };
      case "9:16":
        return { width: 1080, height: 1920 };
      case "4:3":
        return { width: 1024, height: 768 };
      case "3:2":
        return { width: 1200, height: 800 };
      case "1:1":
      default:
        return { width: 1024, height: 1024 };
    }
  }

  private generateLocalSvgImage(
    prompt: string,
    width: number,
    height: number,
    style: string
  ): { svgContent: string; mimeType: string } {
    const seedColor = crypto.createHash("md5").update(prompt).digest("hex").slice(0, 6);
    const accentColor = crypto.createHash("md5").update(prompt + "_accent").digest("hex").slice(0, 6);

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#${seedColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#${accentColor};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grad)" />
  <g filter="url(#shadow)">
    <rect x="${Math.round(width * 0.1)}" y="${Math.round(height * 0.1)}" width="${Math.round(width * 0.8)}" height="${Math.round(height * 0.8)}" rx="24" fill="#0f172a" fill-opacity="0.85" stroke="#38bdf8" stroke-width="2"/>
    <text x="${Math.round(width * 0.5)}" y="${Math.round(height * 0.45)}" font-family="system-ui, sans-serif" font-size="${Math.round(width * 0.035)}" font-weight="bold" fill="#ffffff" text-anchor="middle">
      ${prompt.slice(0, 48)}
    </text>
    <text x="${Math.round(width * 0.5)}" y="${Math.round(height * 0.55)}" font-family="system-ui, sans-serif" font-size="${Math.round(width * 0.02)}" fill="#94a3b8" text-anchor="middle">
      STYLE: ${style} | RESOLUTION: ${width}x${height}
    </text>
    <text x="${Math.round(width * 0.5)}" y="${Math.round(height * 0.62)}" font-family="system-ui, sans-serif" font-size="${Math.round(width * 0.016)}" fill="#38bdf8" text-anchor="middle">
      Antigravity Unified Multimodal Engine
    </text>
  </g>
</svg>`;

    return { svgContent, mimeType: "image/svg+xml" };
  }

  public async generateImage(req: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const start = performance.now();
    const { normalized, promptHash } = this.normalizePrompt(req.prompt);
    const dimensions = req.width && req.height ? { width: req.width, height: req.height } : this.resolveDimensions(req.aspectRatio);
    const style = req.style || "UI_MOCKUP";

    const preferredProviderId = req.preferredProvider || "antigravity-native-image";
    let selectedProvider = providerRegistry.getProvider(preferredProviderId);

    // Fallback logic
    if (!selectedProvider || !providerRegistry.isAvailable(preferredProviderId)) {
      selectedProvider = providerRegistry.getProvider("antigravity-native-image")!;
    }

    const requestId = `req_img_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const storageDir = assetRegistry.getStorageDirectory("images");

    let finalFileContent: Buffer | string;
    let mimeType = "image/svg+xml";
    let extension = "svg";
    let actualMode = selectedProvider.executionMode;

    if (selectedProvider.providerId === "openai-image" && process.env.OPENAI_API_KEY) {
      try {
        console.log(`🌐 Routing image generation to OpenAI DALL-E 3: ${normalized}`);
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: normalized,
            n: 1,
            size: `${dimensions.width}x${dimensions.height}`,
            response_format: "b64_json",
          }),
        });

        const json = await response.json();
        if (json.data && json.data[0] && json.data[0].b64_json) {
          finalFileContent = Buffer.from(json.data[0].b64_json, "base64");
          mimeType = "image/png";
          extension = "png";
          actualMode = "LIVE";
        } else {
          throw new Error(json.error?.message || "Failed to generate image via DALL-E");
        }
      } catch (err: any) {
        console.warn(`⚠️ OpenAI DALL-E failed: ${err.message}. Falling back to local generator.`);
        selectedProvider = providerRegistry.getProvider("antigravity-native-image")!;
        const { svgContent } = this.generateLocalSvgImage(normalized, dimensions.width, dimensions.height, style);
        finalFileContent = svgContent;
        mimeType = "image/svg+xml";
        extension = "svg";
        actualMode = "FALLBACK";
      }
    } else if (selectedProvider.providerId === "puter-image" && process.env.PUTER_AUTH_TOKEN) {
      try {
        console.log(`🌐 Routing image generation to Puter.js: ${normalized}`);
        const { init } = require("@heyputer/puter.js/src/init.cjs");
        const puter = init(process.env.PUTER_AUTH_TOKEN);
        const image = await puter.ai.txt2img(normalized);

        // Convert puter image format to buffer
        if (image && typeof image === "string") {
          finalFileContent = Buffer.from(image.split(",")[1] || image, "base64");
          mimeType = "image/png";
          extension = "png";
          actualMode = "LIVE";
        } else {
          throw new Error("Puter returned invalid image response");
        }
      } catch (err: any) {
        console.warn(`⚠️ Puter.js generation failed: ${err.message}. Falling back to local generator.`);
        selectedProvider = providerRegistry.getProvider("antigravity-native-image")!;
        const { svgContent } = this.generateLocalSvgImage(normalized, dimensions.width, dimensions.height, style);
        finalFileContent = svgContent;
        mimeType = "image/svg+xml";
        extension = "svg";
        actualMode = "FALLBACK";
      }
    } else {
      // Local SVG generator
      const { svgContent } = this.generateLocalSvgImage(normalized, dimensions.width, dimensions.height, style);
      finalFileContent = svgContent;
      mimeType = "image/svg+xml";
      extension = "svg";
    }

    const filename = `img_${Date.now()}_${promptHash.slice(0, 8)}.${extension}`;
    const fullFilePath = path.join(storageDir, filename);
    const relativeWebPath = `/generated-assets/images/${filename}`;

    fs.writeFileSync(fullFilePath, finalFileContent);

    const stats = fs.statSync(fullFilePath);
    const hashSha256 = crypto.createHash("sha256").update(finalFileContent).digest("hex");
    const executionTimeMs = Math.round(performance.now() - start);

    const provenance: ProvenanceMetadata = {
      requestId,
      timestamp: new Date().toISOString(),
      initiatedBy: req.workspaceId || "SYSTEM",
      promptHash,
      sourceSeed: req.seed || 42,
      engineVersion: "Antigravity Multimodal v2.0",
      checksumSha256: hashSha256,
      executionTimeMs,
    };

    const altText = `AI-generated ${style.toLowerCase()} illustration representing ${normalized.slice(0, 80)}`;

    const assetRecord: AssetRecord = await assetRegistry.registerAsset({
      type: "IMAGE",
      path: relativeWebPath,
      mimeType,
      sizeBytes: stats.size,
      hashSha256,
      provider: selectedProvider.providerId,
      model: selectedProvider.models[0] || "vector-canvas-v2",
      executionMode: actualMode,
      projectId: req.workspaceId,
      promptHash,
      source: "AI_GENERATED",
      dimensions,
      status: "READY",
      altText,
      provenance,
    });

    const providerMetadata: ProviderMetadata = {
      provider: selectedProvider.providerId,
      model: selectedProvider.models[0] || "vector-canvas-v2",
      capability: "IMAGE_GENERATION",
      executionMode: actualMode,
      availability: true,
      authenticationState: selectedProvider.requiresAuth ? "AUTHENTICATED" : "NOT_REQUIRED",
      quotaState: "AVAILABLE",
      healthState: selectedProvider.healthState,
      estimatedCostUsd: selectedProvider.estimatedCostPerUnitUsd,
      actualCostUsd: selectedProvider.estimatedCostPerUnitUsd,
      latencyMs: executionTimeMs,
      requestId,
      timestamp: new Date().toISOString(),
      provenance,
    };

    return {
      asset: assetRecord,
      providerMetadata,
      thumbnailUrl: relativeWebPath,
      altText,
    };
  }
}

export const imageService = UnifiedImageService.getInstance();
