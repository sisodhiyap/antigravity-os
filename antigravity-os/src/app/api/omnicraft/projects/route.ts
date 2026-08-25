import { NextRequest } from "next/server";
import { db } from "@/server/db";
import { authenticateRequest } from "@/server/auth-helper";

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const projects = await db.getProjects(user.email);
    return Response.json({ success: true, data: projects });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const body = await req.json();
    const { name, description, brief } = body;
    if (!name) {
      return Response.json({ success: false, error: "Project name is required" }, { status: 400 });
    }

    const project = await db.createProject(name, description || "", user.email, brief);
    return Response.json({ success: true, data: project });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 401 });
  }
}
