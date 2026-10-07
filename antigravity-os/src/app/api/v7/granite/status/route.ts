import { NextRequest, NextResponse } from "next/server";
import {
  GraniteHardwareGovernor,
  GraniteModelRegistry,
  GranitePluginAdapter,
} from "@/plugins/granite";

export async function GET(req: NextRequest) {
  try {
    GranitePluginAdapter.registerGranitePlugin();
    const governor = GraniteHardwareGovernor.getInstance();
    const hardware = await governor.getHardwareProfile();
    const pressure = await governor.assessResourcePressure();

    const registry = GraniteModelRegistry.getInstance();
    const models = await registry.discoverLocalModels();
    const activeModel = registry.getActiveModel();

    return NextResponse.json({
      success: true,
      status: "READY",
      activeModel: activeModel.name,
      modelId: activeModel.modelId,
      backend: activeModel.backend,
      hardware,
      pressure,
      models,
      pluginStatus: "ACTIVE",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || String(err), status: "DEGRADED" },
      { status: 500 }
    );
  }
}
