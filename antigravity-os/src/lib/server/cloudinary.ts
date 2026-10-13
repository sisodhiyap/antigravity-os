import fs from "fs";
import path from "path";

export interface CloudinaryUploadOptions {
  buffer?: Buffer;
  base64?: string;
  filePath?: string;
  url?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
  folder?: string;
  filename?: string;
}

export interface CloudinaryUploadResult {
  success: boolean;
  secureUrl?: string;
  publicId?: string;
  format?: string;
  bytes?: number;
  error?: string;
}

export function getCloudinaryConfig() {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

  return {
    isConfigured: !!(cloudName && apiKey && apiSecret),
    cloudName,
    apiKey,
    apiSecret,
  };
}

export async function uploadMediaToCloudinary(
  options: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> {
  const config = getCloudinaryConfig();
  if (!config.isConfigured) {
    return {
      success: false,
      error: "Cloudinary is not configured in server environment.",
    };
  }

  try {
    const resourceType = options.resourceType || "auto";
    const folder = options.folder || "antigravity-creative";

    let fileData: string | Blob;

    if (options.base64) {
      fileData = options.base64.startsWith("data:")
        ? options.base64
        : `data:application/octet-stream;base64,${options.base64}`;
    } else if (options.buffer) {
      const mime =
        resourceType === "image"
          ? "image/png"
          : resourceType === "video"
          ? "video/mp4"
          : "audio/wav";
      const b64 = options.buffer.toString("base64");
      fileData = `data:${mime};base64,${b64}`;
    } else if (options.filePath) {
      const fileBuffer = await fs.promises.readFile(options.filePath);
      const ext = path.extname(options.filePath).toLowerCase();
      const mime =
        ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".webp"
          ? "image/webp"
          : ext === ".mp4"
          ? "video/mp4"
          : ext === ".webm"
          ? "video/webm"
          : ext === ".wav"
          ? "audio/wav"
          : "image/png";
      fileData = `data:${mime};base64,${fileBuffer.toString("base64")}`;
    } else if (options.url) {
      fileData = options.url;
    } else {
      return { success: false, error: "No media content provided for Cloudinary upload." };
    }

    const authHeader =
      "Basic " +
      Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64");

    const formData = new FormData();
    formData.append("file", fileData);
    formData.append("folder", folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`;

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        error: `Cloudinary upload failed with status ${res.status}: ${errText.slice(0, 150)}`,
      };
    }

    const data = (await res.json()) as {
      secure_url?: string;
      public_id?: string;
      format?: string;
      bytes?: number;
    };

    return {
      success: true,
      secureUrl: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      bytes: data.bytes,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Cloudinary upload exception: ${message}`,
    };
  }
}
