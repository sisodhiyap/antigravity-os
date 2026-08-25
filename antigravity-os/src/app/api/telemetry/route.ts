import { NextResponse } from "next/server";
import { TelemetryService } from "@/services/TelemetryService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const telemetry = await TelemetryService.getFullTelemetry();
    return NextResponse.json(telemetry, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      },
    });
  } catch (error) {
    console.error("Telemetry Error:", error);
    return NextResponse.json(
      { error: "Failed to collect real-time system telemetry" },
      { status: 500 }
    );
  }
}
