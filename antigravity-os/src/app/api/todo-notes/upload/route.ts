import { NextRequest } from "next/server";
import { authenticateRequest } from "@/server/auth-helper";
import fs from "fs";
import path from "path";

/**
 * POST /api/todo-notes/upload
 * Handles file attachments for notes, saving them to local file storage.
 */
export async function POST(req: NextRequest) {
  try {
    await authenticateRequest(req);
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return Response.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const dir = path.join(process.cwd(), "public", "generated-assets");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Clean up filename to prevent path traversal or injection issues
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filename = `${Date.now()}_${safeName}`;
    const filePath = path.join(dir, filename);
    
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/generated-assets/${filename}`;
    return Response.json({ success: true, fileUrl });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
