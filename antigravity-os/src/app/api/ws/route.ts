import { TelemetryService } from "@/services/TelemetryService";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      const sendUpdate = async () => {
        try {
          const telemetry = await TelemetryService.getFullTelemetry();
          const data = `data: ${JSON.stringify(telemetry)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (_) {}
      };

      // Send immediate first frame
      await sendUpdate();

      const interval = setInterval(async () => {
        await sendUpdate();
      }, 1000);

      return () => clearInterval(interval);
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
