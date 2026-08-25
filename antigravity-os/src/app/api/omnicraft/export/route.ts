import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { authenticateRequest } from "@/server/auth-helper";

/**
 * GET /api/omnicraft/export?projectId=xxx&format=json|markdown
 * Exports all real project data from the database as a structured document.
 * NO fake data — only what's actually stored in the DB.
 */
export async function GET(req: NextRequest) {
  try {
    await authenticateRequest(req);

    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    const format = url.searchParams.get("format") || "json";

    if (!projectId) {
      return Response.json({ success: false, error: "projectId is required" }, { status: 400 });
    }

    // Fetch project with all relations
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        research: true,
        assets: {
          orderBy: { createdAt: "desc" },
        },
        jobs: {
          orderBy: { startedAt: "desc" },
          take: 100,
        },
        conversations: {
          include: {
            messages: { orderBy: { createdAt: "asc" } },
          },
        },
        designSystem: true,
      },
    });

    if (!project) {
      return Response.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    if (format === "markdown") {
      const md = buildMarkdown(project);
      return new Response(md, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${project.name.replace(/\s+/g, "_")}_case_study.md"`,
        },
      });
    }

    // JSON export — clean and structured
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportVersion: "1.0",
      note: "This export contains only real, persisted data from the OmniCraft database. No simulated or fake data is included.",
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        brief: project.brief,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      },
      research: project.research
        ? {
            id: project.research.id,
            question: project.research.question,
            findingsText: project.research.findingsText,
            strategyText: project.research.strategyText,
            createdAt: project.research.createdAt.toISOString(),
            updatedAt: project.research.updatedAt.toISOString(),
          }
        : null,
      designSystem: project.designSystem
        ? {
            id: project.designSystem.id,
            projectId: project.designSystem.projectId,
            createdAt: project.designSystem.createdAt.toISOString(),
          }
        : null,
      assets: project.assets.map((a) => ({
        assetId: a.assetId,
        type: a.type,
        path: a.path,
        mimeType: a.mimeType,
        sizeBytes: a.sizeBytes,
        hashSha256: a.hashSha256,
        executionMode: a.executionMode,
        format: a.format,
        createdAt: a.createdAt.toISOString(),
      })),
      generationJobs: project.jobs.map((j) => ({
        jobId: j.jobId,
        capability: j.capability,
        provider: j.provider,
        model: j.model,
        status: j.status,
        executionMode: j.executionMode,
        startedAt: j.startedAt.toISOString(),
        completedAt: j.completedAt?.toISOString() || null,
        errorMessage: j.errorMessage,
      })),
      conversations: project.conversations.map((c) => ({
        id: c.id,
        title: c.title,
        messageCount: c.messages.length,
        messages: c.messages.map((m) => ({
          role: m.role,
          content: m.content,
          provider: m.provider,
          model: m.model,
          latencyMs: m.latencyMs,
          createdAt: m.createdAt.toISOString(),
        })),
      })),
      summary: {
        totalAssets: project.assets.length,
        totalJobs: project.jobs.length,
        succeededJobs: project.jobs.filter((j) => j.status === "COMPLETED").length,
        failedJobs: project.jobs.filter((j) => j.status === "FAILED").length,
        totalMessages: project.conversations.reduce((acc, c) => acc + c.messages.length, 0),
      },
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${project.name.replace(/\s+/g, "_")}_export.json"`,
      },
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 401 });
  }
}

function buildMarkdown(project: any): string {
  const lines: string[] = [];
  const now = new Date().toISOString();

  lines.push(`# Case Study: ${project.name}`);
  lines.push(`\n> **Exported at**: ${now}`);
  lines.push(`> **Data Source**: OmniCraft Production Database (real data only)\n`);
  lines.push("---");

  // Problem
  lines.push("\n## 1. Project Overview\n");
  lines.push(`**Project Name**: ${project.name}`);
  lines.push(`**Description**: ${project.description || "Not provided"}`);
  lines.push(`**Created**: ${new Date(project.createdAt).toLocaleString()}`);
  if (project.brief) {
    lines.push(`\n**Creative Brief**:\n\n${project.brief}`);
  }

  // Research
  lines.push("\n---\n## 2. Research & Discovery\n");
  if (project.research?.findingsText) {
    lines.push(project.research.findingsText);
  } else {
    lines.push("*No research findings recorded yet.*");
  }

  // Strategy
  lines.push("\n---\n## 3. Strategy & Positioning\n");
  if (project.research?.strategyText) {
    lines.push(project.research.strategyText);
  } else {
    lines.push("*No strategy recorded yet.*");
  }

  // Assets
  lines.push("\n---\n## 4. Generated Media Assets\n");
  if (project.assets.length === 0) {
    lines.push("*No assets generated yet.*");
  } else {
    lines.push(`**Total Assets**: ${project.assets.length}\n`);
    const byType: Record<string, any[]> = {};
    for (const a of project.assets) {
      const arr = byType[a.type] || [];
      arr.push(a);
      byType[a.type] = arr;
    }
    for (const [type, items] of Object.entries(byType)) {
      lines.push(`\n### ${type} (${items.length})\n`);
      for (const a of items as any[]) {
        lines.push(`- **ID**: \`${a.assetId}\``);
        lines.push(`  - Path: ${a.path}`);
        lines.push(`  - Execution Mode: ${a.executionMode}`);
        lines.push(`  - SHA-256: \`${a.hashSha256}\``);
        lines.push(`  - Size: ${(a.sizeBytes / 1024).toFixed(1)} KB`);
      }
    }
  }

  // AI Usage
  lines.push("\n---\n## 5. AI Operations Summary\n");
  const succeededJobs = project.jobs.filter((j: any) => j.status === "COMPLETED").length;
  const failedJobs = project.jobs.filter((j: any) => j.status === "FAILED").length;
  const totalMessages = project.conversations.reduce((acc: number, c: any) => acc + c.messages.length, 0);
  lines.push(`- **Total Generation Jobs**: ${project.jobs.length}`);
  const succeededJobs2 = project.jobs.filter((j: any) => j.status === "COMPLETED").length;
  const failedJobs2 = project.jobs.filter((j: any) => j.status === "FAILED").length;
  lines.push(`  - Succeeded: ${succeededJobs2}`);
  lines.push(`  - Failed: ${failedJobs2}`);
  lines.push(`- **AI Conversations**: ${project.conversations.length}`);
  lines.push(`- **Total AI Messages**: ${totalMessages}`);

  // Disclaimer
  lines.push("\n---\n## Disclaimer\n");
  lines.push("Business outcome data (conversion rates, revenue impact) is not yet available and has NOT been fabricated.");
  lines.push("This document contains only verified, persisted data from the OmniCraft production database.");
  lines.push("\n*Generated by OmniCraft Creative Studio*");

  return lines.join("\n");
}
