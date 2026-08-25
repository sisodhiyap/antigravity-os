import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { authenticateRequest } from "@/server/auth-helper";

/**
 * GET /api/todo-notes/export
 * Exports all user todos and notes as a unified Markdown document.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);

    const todos = await prisma.todo.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const notes = await prisma.note.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    let md = `# 📓 ANTIGRAVITY OS — TODO & NOTES EXPORT\n\n`;
    md += `- **Export Date**: ${new Date().toISOString()}\n`;
    md += `- **User Email**: ${user.email}\n\n`;
    md += `## 📋 Task List (Todos)\n\n`;

    if (todos.length === 0) {
      md += `*No tasks found.*\n`;
    } else {
      todos.forEach((todo) => {
        const check = todo.completed ? "[x]" : "[ ]";
        md += `- ${check} ${todo.title}\n`;
      });
    }

    md += `\n## 📝 Personal Notes\n\n`;

    if (notes.length === 0) {
      md += `*No notes found.*\n`;
    } else {
      notes.forEach((note) => {
        md += `### 📄 ${note.title}\n`;
        md += `- **Created At**: ${note.createdAt.toISOString()}\n`;
        if (note.filePath) {
          md += `- **Attachment**: [File Link](${note.filePath})\n`;
        }
        md += `\n${note.content}\n\n---\n\n`;
      });
    }

    return new Response(md, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="todo_notes_export.md"`,
      },
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 401 });
  }
}
