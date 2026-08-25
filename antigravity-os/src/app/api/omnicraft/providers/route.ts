import { NextRequest } from "next/server";
import { providerRegistry } from "@/server/multimodal/provider-registry";
import { quotaEngine } from "@/server/ai/quota";

export async function GET(req: NextRequest) {
  try {
    const providers = providerRegistry.listProviders();
    const stats = quotaEngine.getAllStats();
    return Response.json({
      success: true,
      data: {
        providers,
        stats,
      },
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
