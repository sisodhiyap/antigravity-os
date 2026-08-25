import { NextRequest, NextResponse } from "next/server";
import { AntigravityKernel } from "@/kernel/kernel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const kernel = AntigravityKernel.getInstance();
    if (kernel.lifecycle.getState() === "UNINITIALIZED") {
      await kernel.boot();
    }

    const services = kernel.services.getAllServices().map((s) => ({
      name: s.definition.name,
      version: s.definition.version,
      description: s.definition.description,
      status: s.status,
      dependencies: s.definition.dependencies,
      requiredPermissions: s.definition.requiredPermissions,
      autoStart: s.definition.autoStart,
      restartCount: s.restartCount,
      startedAt: s.startedAt,
      stoppedAt: s.stoppedAt,
      error: s.error,
      healthDetails: s.healthDetails,
    }));

    const startupOrder = kernel.services.getStartupOrder();

    return NextResponse.json({ services, startupOrder }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to list services", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const kernel = AntigravityKernel.getInstance();
    const body = await req.json();
    const { action, serviceName } = body;

    if (!serviceName || !["start", "stop", "restart"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid payload. Provide serviceName and action ('start' | 'stop' | 'restart')." },
        { status: 400 }
      );
    }

    if (action === "start") {
      await kernel.services.startService(serviceName);
    } else if (action === "stop") {
      await kernel.services.stopService(serviceName);
    } else if (action === "restart") {
      await kernel.services.restartService(serviceName);
    }

    const service = kernel.services.getService(serviceName);
    return NextResponse.json(
      { message: `Action '${action}' executed successfully for service '${serviceName}'`, service },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Service action failed", details: error.message },
      { status: 500 }
    );
  }
}
