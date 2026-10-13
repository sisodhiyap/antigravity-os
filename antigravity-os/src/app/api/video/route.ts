import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { videoProvider, VideoGenerationRequest } from "@/lib/providers/video";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<VideoGenerationRequest>;

    if (!body.prompt || typeof body.prompt !== "string" || !body.prompt.trim()) {
      return apiError(new AppError("VALIDATION_ERROR", "Prompt is required for video generation.", 400));
    }

    if (body.prompt.length > 2000) {
      return apiError(new AppError("VALIDATION_ERROR", "Prompt exceeds maximum allowed length of 2000 characters.", 400));
    }

    const job = await videoProvider.createJob({
      prompt: body.prompt.trim(),
      imageUrl: body.imageUrl,
      mode: body.mode || (body.imageUrl ? "IMAGE_TO_VIDEO" : "TEXT_TO_VIDEO"),
      aspectRatio: body.aspectRatio || "16:9",
      durationSeconds: body.durationSeconds || 5,
      fps: body.fps || 25,
      audioUrl: body.audioUrl,
    });

    return apiSuccess({
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      stageDescription: job.stageDescription,
      mode: job.mode,
      isSlideshowFallback: job.isSlideshowFallback,
      provider: job.provider,
      aspectRatio: job.aspectRatio,
      dimensions: job.dimensions,
      durationSeconds: job.durationSeconds,
      createdAt: job.createdAt,
    });
  } catch (err: unknown) {
    return apiError(err);
  }
}

export async function GET() {
  try {
    const jobs = await videoProvider.listJobs();
    return apiSuccess({
      count: jobs.length,
      jobs,
    });
  } catch (err: unknown) {
    return apiError(err);
  }
}
