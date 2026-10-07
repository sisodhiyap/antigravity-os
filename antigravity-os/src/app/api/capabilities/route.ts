import { NextRequest, NextResponse } from "next/server";
import { CapabilityDiscovery } from "@/capabilities/CapabilityDiscovery";
import { authoritativeRegistry } from "@/capabilities/AuthoritativeRegistry";

export const dynamic = "force-dynamic";

export async function GET() {
  const telemetry = await CapabilityDiscovery.discover();
  const capabilities = await authoritativeRegistry.evaluateAllCapabilities();

  return NextResponse.json({
    success: true,
    data: {
      ...telemetry,
      telemetry,
      capabilities,
    },
    capabilities,
  });
}
