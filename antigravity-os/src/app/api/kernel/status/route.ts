import { NextResponse } from "next/server";
import { AntigravityKernel } from "@/kernel/kernel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const kernel = AntigravityKernel.getInstance();
    if (kernel.lifecycle.getState() === "UNINITIALIZED") {
      await kernel.boot();
    }

    const snapshot = kernel.getSnapshot();
    return NextResponse.json(snapshot, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Kernel status check failed", details: error.message },
      { status: 500 }
    );
  }
}
