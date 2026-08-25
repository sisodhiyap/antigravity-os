import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { authenticateRequest } from "@/server/auth-helper";

/**
 * GET /api/todo-notes/notes
 * Retrieves all notes for the authenticated user.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const notes = await prisma.note.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ success: true, data: notes });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 401 });
  }
}

/**
 * POST /api/todo-notes/notes
 * Creates a new note for the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const { title, content, filePath } = await req.json();
    if (!title) {
      return Response.json({ success: false, error: "Title is required" }, { status: 400 });
    }
    const note = await prisma.note.create({
      data: {
        title,
        content: content || "",
        filePath: filePath || null,
        userId: user.id,
      },
    });
    return Response.json({ success: true, data: note });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 401 });
  }
}

/**
 * PUT /api/todo-notes/notes
 * Updates a note's title, content, or attachment file path.
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const { id, title, content, filePath } = await req.json();
    if (!id) {
      return Response.json({ success: false, error: "Note ID is required" }, { status: 400 });
    }
    // Verify owner
    const existing = await prisma.note.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return Response.json({ success: false, error: "Note not found" }, { status: 404 });
    }
    const updated = await prisma.note.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        content: content !== undefined ? content : existing.content,
        filePath: filePath !== undefined ? filePath : existing.filePath,
      },
    });
    return Response.json({ success: true, data: updated });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 401 });
  }
}

/**
 * DELETE /api/todo-notes/notes
 * Deletes a note.
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return Response.json({ success: false, error: "Note ID is required" }, { status: 400 });
    }
    // Verify owner
    const existing = await prisma.note.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return Response.json({ success: false, error: "Note not found" }, { status: 404 });
    }
    await prisma.note.delete({
      where: { id },
    });
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 401 });
  }
}
