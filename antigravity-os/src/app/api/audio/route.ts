import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { audioProvider, AudioGenerationRequest } from "@/lib/providers/audio";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AudioGenerationRequest>;

    if (!body.prompt || typeof body.prompt !== "string" || !body.prompt.trim()) {
      return apiError(new AppError("VALIDATION_ERROR", "Audio prompt or text is required and cannot be empty.", 400));
    }

    if (body.prompt.length > 2500) {
      return apiError(new AppError("VALIDATION_ERROR", "Text exceeds maximum allowed length of 2500 characters.", 400));
    }

    const mode = body.mode === "MUSIC" ? "MUSIC" : "TTS";

    const result = await audioProvider.generateAudio({
      mode,
      prompt: body.prompt.trim(),
      voice: body.voice || "onyx",
      durationSeconds: body.durationSeconds || (mode === "MUSIC" ? 10 : undefined),
      genre: body.genre || "ambient",
      tempo: body.tempo || 120,
      allowFallback: body.allowFallback !== false,
    });

    if (!result.success) {
      return apiError(new AppError("PROVIDER_UNAVAILABLE", result.error || "Failed to generate audio.", 502));
    }

    return apiSuccess(result);
  } catch (err: unknown) {
    return apiError(err);
  }
}
