import { NextRequest, NextResponse } from "next/server";
import { CapabilityDiscovery } from "@/capabilities/CapabilityDiscovery";

export async function GET() {
  const telemetry = await CapabilityDiscovery.discover();
  return NextResponse.json({
    success: true,
    data: telemetry
  });
}
