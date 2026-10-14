import { NextRequest, NextResponse } from "next/server";
import { aiRouter } from "@/server/ai/router";
import { mcpRegistry } from "@/server/tools/mcp-registry";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const providerHealth = await aiRouter.checkAllProviders();
    const installedServers = mcpRegistry.getAllServers();

    return NextResponse.json({
      success: true,
      data: {
        privacyOptions: [
          {
            id: "LOCAL_ONLY",
            label: "Local Only",
            description: "Strict sovereign boundary: no data ever leaves this machine. Requires local Ollama or AirLLM.",
          },
          {
            id: "LOCAL_PREFERRED",
            label: "Local Preferred",
            description: "Prioritizes local GPU inference; gracefully uses approved cloud models if local models are offline.",
          },
          {
            id: "CLOUD_PERMITTED",
            label: "Cloud Permitted",
            description: "Routes dynamically across all 8 configured providers for maximum speed and capability.",
          },
          {
            id: "ASK_EVERY_TIME",
            label: "Ask Every Time",
            description: "Requires explicit operator confirmation before transmitting any payload to remote cloud providers.",
          },
        ],
        providers: providerHealth,
        tools: installedServers.map((s: any) => ({
          serverName: s.name,
          category: s.category,
          toolsCount: s.toolsCount,
          status: s.status,
          capabilities: s.capabilities,
        })),
        quickCommands: [
          { id: "cmd_summary", label: "Summarize active projects", prompt: "Summarize my active workspace projects and brief requirements." },
          { id: "cmd_tests", label: "Find failing tests", prompt: "Inspect recent test execution results and report any failing suites." },
          { id: "cmd_patch", label: "Propose patch for errors", prompt: "Inspect any logged system errors and propose a safe, verified patch." },
          { id: "cmd_regression", label: "Run approved regression", prompt: "Execute the approved hermes unit test suite." },
          { id: "cmd_provider", label: "Explain AI router attribution", prompt: "Explain which AI provider handled this task and whether local GPU inference occurred." },
          { id: "cmd_health", label: "Inspect system health", prompt: "Perform a read-only health check across all registered AI providers and MCP tools." },
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch capabilities" },
      { status: 500 }
    );
  }
}
