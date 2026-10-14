import { NextRequest, NextResponse } from "next/server";
import { fabricGpuScheduler } from "@/server/fabric/gpu-scheduler";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cancelled = fabricGpuScheduler.cancelJob(id);

    if (!cancelled) {
      return NextResponse.json(
        { success: false, error: `Job ${id} could not be cancelled or was not found in active/queued state.` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Job ${id} successfully cancelled.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
