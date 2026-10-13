import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { imageProvider, ImageGenerationRequest } from "@/lib/providers/image";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<ImageGenerationRequest>;

    if (!body.prompt || typeof body.prompt !== "string" || !body.prompt.trim()) {
      return apiError(new AppError("VALIDATION_ERROR", "Prompt is required and must not be empty.", 400));
    }

    if (body.prompt.length > 2000) {
      return apiError(new AppError("VALIDATION_ERROR", "Prompt exceeds maximum allowed length of 2000 characters.", 400));
    }

    const result = await imageProvider.generateImage({
      prompt: body.prompt.trim(),
      negativePrompt: body.negativePrompt,
      model: body.model,
      provider: body.provider,
      aspectRatio: body.aspectRatio || "1:1",
      width: body.width,
      height: body.height,
      seed: body.seed,
      allowFallback: body.allowFallback !== false,
    });

    if (!result.success) {
      return apiError(new AppError("PROVIDER_UNAVAILABLE", result.error || "Failed to generate image.", 502));
    }

    return apiSuccess(result);
  } catch (err: unknown) {
    return apiError(err);
  }
}
