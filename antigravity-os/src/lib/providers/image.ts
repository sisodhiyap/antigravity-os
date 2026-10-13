/**
 * ANTIGRAVITY OS — UNIFIED IMAGE GENERATION PROVIDER
 * Implements primary (Pollinations.ai), secondary (Hugging Face Inference),
 * and deterministic sandboxed fallback with content validation and error normalization.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getHuggingFaceToken } from "@/lib/server/huggingface-token";
import { uploadMediaToCloudinary } from "@/lib/server/cloudinary";

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  model?: string;
  provider?: "pollinations" | "huggingface" | "sandbox";
  width?: number;
  height?: number;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  seed?: number;
  allowFallback?: boolean;
}

export type ImageInferenceType =
  | "EXTERNAL_MODEL_INFERENCE"
  | "LOCAL_MODEL_INFERENCE"
  | "DETERMINISTIC_SANDBOX_FALLBACK";

export interface ImageGenerationResult {
  success: boolean;
  provider: string;
  model: string;
  isAiGenerated: boolean;
  inferenceType: ImageInferenceType;
  fallbackReason?: string;
  url: string;
  cloudinaryUrl?: string;
  localPath: string;
  mimeType: string;
  bytes: number;
  seed: number;
  prompt: string;
  aspectRatio: string;
  dimensions: { width: number; height: number };
  provenanceHash: string;
  createdAt: string;
  error?: string;
}

export class ImageProviderManager {
  private static instance: ImageProviderManager;
  private readonly storageDir: string;

  private constructor() {
    this.storageDir = path.resolve(process.cwd(), "public", "artifacts", "generated", "image");
    if (!fs.existsSync(this.storageDir)) {
      try {
        fs.mkdirSync(this.storageDir, { recursive: true });
      } catch {
        // Fallback to tmp in serverless
        this.storageDir = path.join(require("os").tmpdir(), "ag-generated-image");
        if (!fs.existsSync(this.storageDir)) {
          fs.mkdirSync(this.storageDir, { recursive: true });
        }
      }
    }
  }

  public static getInstance(): ImageProviderManager {
    if (!ImageProviderManager.instance) {
      ImageProviderManager.instance = new ImageProviderManager();
    }
    return ImageProviderManager.instance;
  }

  private resolveDimensions(aspectRatio = "1:1", customW?: number, customH?: number): { width: number; height: number } {
    if (customW && customH) {
      return { width: Math.min(Math.max(customW, 256), 1536), height: Math.min(Math.max(customH, 256), 1536) };
    }
    switch (aspectRatio) {
      case "16:9":
        return { width: 1024, height: 576 };
      case "9:16":
        return { width: 576, height: 1024 };
      case "4:3":
        return { width: 1024, height: 768 };
      case "3:4":
        return { width: 768, height: 1024 };
      case "1:1":
      default:
        return { width: 1024, height: 1024 };
    }
  }

  public async generateImage(req: ImageGenerationRequest): Promise<ImageGenerationResult> {
    const prompt = (req.prompt || "").trim();
    if (!prompt) {
      throw new Error("INVALID_REQUEST: Prompt cannot be empty or whitespace only");
    }
    if (prompt.length > 2000) {
      throw new Error("INVALID_REQUEST: Prompt exceeds maximum limit of 2000 characters");
    }

    const { width, height } = this.resolveDimensions(req.aspectRatio, req.width, req.height);
    const activeSeed = req.seed ?? Math.floor(Math.random() * 900000) + 100000;
    const requestedProvider = req.provider || process.env.IMAGE_PROVIDER || "pollinations";
    let fallbackReason: string | undefined;

    // 1. Try Pollinations (Fast, serverless, authentic generation)
    if (requestedProvider === "pollinations") {
      try {
        const result = await this.generateViaPollinations(prompt, width, height, activeSeed, req.aspectRatio || "1:1");
        return result;
      } catch (err: any) {
        if (req.allowFallback === false) {
          throw err;
        }
        fallbackReason = `Pollinations primary API unavailable (${err.message}); cascaded to secondary engine.`;
        console.warn(`Pollinations failed: ${err.message}. Cascading to secondary provider.`);
      }
    }

    // 2. Try Hugging Face Inference API
    const hfToken = getHuggingFaceToken();
    if (hfToken && (requestedProvider === "huggingface" || req.allowFallback !== false)) {
      try {
        const model = req.model || "black-forest-labs/FLUX.1-schnell";
        const result = await this.generateViaHuggingFace(prompt, model, activeSeed, width, height, req.aspectRatio || "1:1");
        return result;
      } catch (err: any) {
        if (req.allowFallback === false) {
          throw err;
        }
        fallbackReason = `Hugging Face inference unavailable (${err.message}); cascaded to deterministic local sandbox.`;
        console.warn(`Hugging Face inference failed: ${err.message}. Cascading to verified local sandbox.`);
      }
    }

    if (requestedProvider === "sandbox") {
      fallbackReason = "User explicitly requested deterministic local sandbox rasterizer.";
    }

    // 3. Deterministic Verified Sandbox Fallback (Generates decodable 8-byte PNG image)
    return this.generateDeterministicSandboxImage(
      prompt,
      width,
      height,
      activeSeed,
      req.aspectRatio || "1:1",
      fallbackReason
    );
  }

  private async generateViaPollinations(
    prompt: string,
    width: number,
    height: number,
    seed: number,
    aspectRatio: string
  ): Promise<ImageGenerationResult> {
    const orig = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = orig;

    if (!res.ok) {
      throw new Error(`PROVIDER_UNAVAILABLE: Pollinations returned HTTP ${res.status}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 500) {
      throw new Error("INVALID_OUTPUT: Generated buffer is too small to be a valid image");
    }

    const mimeType = res.headers.get("content-type") || "image/jpeg";
    const ext = mimeType.includes("png") ? "png" : "jpg";
    const filename = `img_${Date.now()}_${seed}.${ext}`;
    const filePath = path.join(this.storageDir, filename);

    fs.writeFileSync(filePath, buffer);

    const provenanceHash = crypto.createHash("sha256").update(buffer).digest("hex");

    let cloudinaryUrl: string | undefined;
    try {
      const uploadRes = await uploadMediaToCloudinary({
        buffer,
        resourceType: "image",
        folder: "antigravity-creative/images",
      });
      if (uploadRes.success && uploadRes.secureUrl) {
        cloudinaryUrl = uploadRes.secureUrl;
      }
    } catch {
      // Graceful fallback to local path
    }

    return {
      success: true,
      provider: "pollinations",
      model: "flux-realism",
      isAiGenerated: true,
      inferenceType: "EXTERNAL_MODEL_INFERENCE",
      url: cloudinaryUrl || `/artifacts/generated/image/${filename}`,
      cloudinaryUrl,
      localPath: filePath,
      mimeType,
      bytes: buffer.length,
      seed,
      prompt,
      aspectRatio,
      dimensions: { width, height },
      provenanceHash,
      createdAt: new Date().toISOString(),
    };
  }

  private async generateViaHuggingFace(
    prompt: string,
    model: string,
    seed: number,
    width: number,
    height: number,
    aspectRatio: string
  ): Promise<ImageGenerationResult> {
    const token = getHuggingFaceToken();
    if (!token) throw new Error("AUTHENTICATION_FAILED: No HF_TOKEN available");

    const orig = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { seed, width, height },
      }),
      signal: AbortSignal.timeout(25000),
    });

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = orig;

    if (!res.ok) {
      throw new Error(`PROVIDER_UNAVAILABLE: Hugging Face inference returned HTTP ${res.status}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 500) {
      throw new Error("INVALID_OUTPUT: Hugging Face image buffer too small");
    }

    const filename = `img_hf_${Date.now()}_${seed}.png`;
    const filePath = path.join(this.storageDir, filename);

    fs.writeFileSync(filePath, buffer);
    const provenanceHash = crypto.createHash("sha256").update(buffer).digest("hex");

    return {
      success: true,
      provider: "huggingface",
      model,
      isAiGenerated: true,
      inferenceType: "EXTERNAL_MODEL_INFERENCE",
      url: `/artifacts/generated/image/${filename}`,
      localPath: filePath,
      mimeType: "image/png",
      bytes: buffer.length,
      seed,
      prompt,
      aspectRatio,
      dimensions: { width, height },
      provenanceHash,
      createdAt: new Date().toISOString(),
    };
  }

  private generateDeterministicSandboxImage(
    prompt: string,
    width: number,
    height: number,
    seed: number,
    aspectRatio: string,
    fallbackReason?: string
  ): ImageGenerationResult {
    // Generate valid 8-byte PNG header and minimal valid IDAT payload
    // PNG signature: 137 80 78 71 13 10 26 10 (0x89504E470D0A1A0A)
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    // Construct valid IHDR chunk
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData.writeUInt8(8, 8); // 8-bit depth
    ihdrData.writeUInt8(2, 9); // Truecolor RGB
    ihdrData.writeUInt8(0, 10);
    ihdrData.writeUInt8(0, 11);
    ihdrData.writeUInt8(0, 12);

    const ihdrChunk = this.createPngChunk("IHDR", ihdrData);

    // Uncompressed raw scanlines with black & gold gradient
    const rawData: number[] = [];
    const r = (seed % 100) + 150;
    const g = (seed % 80) + 120;
    const b = 30;

    for (let y = 0; y < height; y++) {
      rawData.push(0); // Filter byte 0 (None)
      for (let x = 0; x < width; x++) {
        const factor = (x + y) / (width + height);
        rawData.push(Math.floor(r * factor));
        rawData.push(Math.floor(g * factor));
        rawData.push(Math.floor(b * (1 - factor)));
      }
    }

    const zlib = require("zlib");
    const compressed = zlib.deflateSync(Buffer.from(rawData));
    const idatChunk = this.createPngChunk("IDAT", compressed);
    const iendChunk = this.createPngChunk("IEND", Buffer.alloc(0));

    const fullPng = Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);

    const filename = `img_sandbox_${Date.now()}_${seed}.png`;
    const filePath = path.join(this.storageDir, filename);

    fs.writeFileSync(filePath, fullPng);
    const provenanceHash = crypto.createHash("sha256").update(fullPng).digest("hex");

    return {
      success: true,
      provider: "sandbox",
      model: "antigravity-vector-rasterizer",
      isAiGenerated: false,
      inferenceType: "DETERMINISTIC_SANDBOX_FALLBACK",
      fallbackReason: fallbackReason || "Deterministic local rasterizer sandbox active (non-neural fallback).",
      url: `/artifacts/generated/image/${filename}`,
      localPath: filePath,
      mimeType: "image/png",
      bytes: fullPng.length,
      seed,
      prompt,
      aspectRatio,
      dimensions: { width, height },
      provenanceHash,
      createdAt: new Date().toISOString(),
    };
  }

  private createPngChunk(type: string, data: Buffer): Buffer {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, "ascii");
    const crcTarget = Buffer.concat([typeBuf, data]);

    const crc = this.calculateCrc32(crcTarget);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  private calculateCrc32(buf: Buffer): number {
    let crc = 0 ^ -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ this.crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  private crcTable: number[] = (() => {
    const table: number[] = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c;
    }
    return table;
  })();
}

export const imageProvider = ImageProviderManager.getInstance();
