import { NextRequest } from "next/server";
import { assetRegistry } from "@/server/multimodal/asset-registry";
import { authenticateRequest } from "@/server/auth-helper";
import { prisma } from "@/server/db";

export async function GET(req: NextRequest) {
  try {
    // Enforce server-side session authentication
    const user = await authenticateRequest(req);

    const url = new URL(req.url);
    const type = url.searchParams.get("type") as any;
    const projectId = url.searchParams.get("projectId");

    if (projectId) {
      // Fetch assets for a specific project from database
      const dbAssets = await prisma.asset.findMany({
        where: {
          projectId,
          ...(type ? { type } : {}),
        },
        orderBy: { createdAt: "desc" },
      });
      return Response.json({ success: true, data: dbAssets });
    }

    // Fetch all persistent assets from database
    const assets = await assetRegistry.listAssets(type);
    return Response.json({ success: true, data: assets });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 401 });
  }
}
