import { NextRequest } from "next/server";
import { db } from "@/server/db";
import { authenticateRequest, checkProjectMembership } from "@/server/auth-helper";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await authenticateRequest(req);

    const project = await db.getProject(id, user.email);
    if (!project) {
      return Response.json({ success: false, error: "Project not found" }, { status: 404 });
    }
    return Response.json({ success: true, data: project });
  } catch (error: any) {
    const status = error.message.includes("Authorization") ? 403 : 401;
    return Response.json({ success: false, error: error.message }, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await authenticateRequest(req);
    const body = await req.json();

    const project = await db.getProject(id, user.email);
    if (!project) {
      return Response.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    await checkProjectMembership(id, user.id, ["OWNER", "ADMIN"]);

    await db.updateProject(id, body, user.email);
    return Response.json({ success: true, data: await db.getProject(id, user.email) });
  } catch (error: any) {
    const status = error.message.includes("Authorization") ? 403 : 401;
    return Response.json({ success: false, error: error.message }, { status });
  }
}
