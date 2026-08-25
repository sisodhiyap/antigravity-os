import { NextRequest } from "next/server";
import { authenticateRequest } from "@/server/auth-helper";
import fs from "fs";
import path from "path";

/**
 * GET /api/factory/projects
 * Lists all generated website project blueprints stored in .antigravity/projects/
 */
export async function GET(req: NextRequest) {
  try {
    await authenticateRequest(req);
    const projectsDir = path.resolve(process.cwd(), ".antigravity", "projects");
    if (!fs.existsSync(projectsDir)) {
      return Response.json({ success: true, data: [] });
    }

    const folders = fs.readdirSync(projectsDir);
    const projects = [];

    for (const folder of folders) {
      const blueprintPath = path.join(projectsDir, folder, "project.json");
      if (fs.existsSync(blueprintPath)) {
        try {
          const content = fs.readFileSync(blueprintPath, "utf-8");
          projects.push(JSON.parse(content));
        } catch {
          // Skip malformed project files
        }
      }
    }

    return Response.json({ success: true, data: projects });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 401 });
  }
}
