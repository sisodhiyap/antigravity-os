import { NextRequest, NextResponse } from "next/server";
import { AntigravityKernel } from "@/kernel/kernel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const kernel = AntigravityKernel.getInstance();
    if (kernel.lifecycle.getState() === "UNINITIALIZED") {
      await kernel.boot();
    }

    const plugins = kernel.plugins.getAllPlugins();
    return NextResponse.json({ plugins }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to list plugins", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const kernel = AntigravityKernel.getInstance();
    const body = await req.json();
    const { pluginId, action } = body;

    if (!pluginId || !["load", "unload"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid payload. Provide pluginId and action ('load' | 'unload')." },
        { status: 400 }
      );
    }

    if (action === "load") {
      await kernel.plugins.loadPlugin(pluginId, kernel);
    } else if (action === "unload") {
      await kernel.plugins.unloadPlugin(pluginId);
    }

    return NextResponse.json(
      { message: `Plugin action '${action}' executed successfully on '${pluginId}'` },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Plugin action failed", details: error.message },
      { status: 500 }
    );
  }
}
