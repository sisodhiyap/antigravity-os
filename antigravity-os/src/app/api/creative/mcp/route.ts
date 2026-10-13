import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { huggingFaceMcp } from "@/server/tools/huggingface-mcp";
import { getHuggingFaceStatus } from "@/lib/server/huggingface-token";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tokenStatus = await getHuggingFaceStatus();
    const tools = await huggingFaceMcp.listTools();

    return apiSuccess({
      mcpServer: "huggingface",
      endpoint: "https://huggingface.co/mcp",
      connected: tools.length > 0,
      tokenConfigured: tokenStatus.configured,
      tokenSource: "Desktop/antikeys or env",
      accountInfo: { user: tokenStatus.username || "Prashant3101", type: tokenStatus.accountType || "user" },
      toolCount: tools.length,
      tools: tools.map((t) => ({
        name: t.name,
        description: t.description,
      })),
    });
  } catch (err: unknown) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { toolName: string; query: string };

    if (!body.toolName || !body.query) {
      return apiError({
        code: "INVALID_REQUEST",
        message: "toolName and query are required.",
        statusCode: 400,
      });
    }

    let result: unknown;
    if (body.toolName === "hf_search_models") {
      result = await huggingFaceMcp.searchModels(body.query);
    } else if (body.toolName === "hf_search_datasets") {
      result = await huggingFaceMcp.searchDatasets(body.query);
    } else if (body.toolName === "hf_search_spaces") {
      result = await huggingFaceMcp.searchSpaces(body.query);
    } else if (body.toolName === "hf_docs_search") {
      result = await huggingFaceMcp.searchDocs(body.query);
    } else if (body.toolName === "hf_get_model_info") {
      result = await huggingFaceMcp.getModelInfo(body.query);
    } else {
      return apiError({
        code: "UNSUPPORTED_TOOL",
        message: `Tool ${body.toolName} is not recognized or permitted.`,
        statusCode: 400,
      });
    }

    return apiSuccess({
      toolName: body.toolName,
      query: body.query,
      result,
    });
  } catch (err: unknown) {
    return apiError(err);
  }
}
