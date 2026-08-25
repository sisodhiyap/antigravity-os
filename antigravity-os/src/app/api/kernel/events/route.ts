import { NextRequest, NextResponse } from "next/server";
import { AntigravityKernel } from "@/kernel/kernel";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const kernel = AntigravityKernel.getInstance();
    if (kernel.lifecycle.getState() === "UNINITIALIZED") {
      await kernel.boot();
    }

    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream");

    if (stream === "true") {
      const encoder = new TextEncoder();

      const customReadable = new ReadableStream({
        start(controller) {
          const unsubscribe = kernel.events.on("*", (event) => {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          });

          return () => {
            unsubscribe();
          };
        },
      });

      return new Response(customReadable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    const topic = searchParams.get("topic") || undefined;
    const source = searchParams.get("source") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;

    const events = kernel.events.getHistory({ topic, source, limit });
    const stats = kernel.events.getStats();

    return NextResponse.json({ events, stats }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to retrieve events", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const kernel = AntigravityKernel.getInstance();
    const body = await req.json();
    const { topic, source, payload } = body;

    if (!topic || !source) {
      return NextResponse.json(
        { error: "Invalid payload. Provide 'topic' and 'source'." },
        { status: 400 }
      );
    }

    const event = await kernel.events.emit(topic, source, payload || {});
    return NextResponse.json({ message: "Event broadcasted successfully", event }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to broadcast event", details: error.message },
      { status: 500 }
    );
  }
}
