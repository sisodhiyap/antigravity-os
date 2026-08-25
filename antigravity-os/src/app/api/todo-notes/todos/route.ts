import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { authenticateRequest } from "@/server/auth-helper";

/**
 * GET /api/todo-notes/todos
 * Retrieves all todos for the authenticated user.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const todos = await prisma.todo.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ success: true, data: todos });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 401 });
  }
}

/**
 * POST /api/todo-notes/todos
 * Creates a new todo for the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const { title } = await req.json();
    if (!title) {
      return Response.json({ success: false, error: "Title is required" }, { status: 400 });
    }
    const todo = await prisma.todo.create({
      data: {
        title,
        completed: false,
        userId: user.id,
      },
    });
    return Response.json({ success: true, data: todo });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 401 });
  }
}

/**
 * PUT /api/todo-notes/todos
 * Updates a todo's completed status.
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const { id, completed } = await req.json();
    if (!id) {
      return Response.json({ success: false, error: "Todo ID is required" }, { status: 400 });
    }
    // Verify owner
    const existing = await prisma.todo.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return Response.json({ success: false, error: "Todo not found" }, { status: 404 });
    }
    const updated = await prisma.todo.update({
      where: { id },
      data: { completed: completed ?? false },
    });
    return Response.json({ success: true, data: updated });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 401 });
  }
}

/**
 * DELETE /api/todo-notes/todos
 * Deletes a todo.
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return Response.json({ success: false, error: "Todo ID is required" }, { status: 400 });
    }
    // Verify owner
    const existing = await prisma.todo.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return Response.json({ success: false, error: "Todo not found" }, { status: 404 });
    }
    await prisma.todo.delete({
      where: { id },
    });
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 401 });
  }
}
