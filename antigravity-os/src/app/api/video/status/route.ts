import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { videoProvider } from "@/lib/providers/video";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return apiError({
        code: "INVALID_REQUEST",
        message: "Missing required jobId query parameter.",
        statusCode: 400,
      });
    }

    const job = await videoProvider.getJob(jobId);

    if (!job) {
      return apiError({
        code: "JOB_NOT_FOUND",
        message: `Video job with ID ${jobId} not found.`,
        statusCode: 404,
      });
    }

    return apiSuccess(job);
  } catch (err: unknown) {
    return apiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return apiError({
        code: "INVALID_REQUEST",
        message: "Missing required jobId query parameter.",
        statusCode: 400,
      });
    }

    const cancelled = await videoProvider.cancelJob(jobId);

    return apiSuccess({
      jobId,
      cancelled,
    });
  } catch (err: unknown) {
    return apiError(err);
  }
}
