import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PresentationProject } from "@/presentx/types";
import { PresentXOrchestrator } from "@/presentx/engine/PresentXOrchestrator";

const STORAGE_DIR = path.resolve(process.cwd(), "workspaces", "presentx-vault");

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

export async function GET(req: NextRequest) {
  ensureStorageDir();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const filePath = path.join(STORAGE_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return NextResponse.json({ success: true, project: data });
    }
    return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
  }

  const files = fs.readdirSync(STORAGE_DIR).filter((f) => f.endsWith(".json"));
  const projects: PresentationProject[] = [];

  for (const file of files) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(STORAGE_DIR, file), "utf-8"));
      projects.push(content);
    } catch {
      // ignore corrupted file
    }
  }

  projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return NextResponse.json({ success: true, projects });
}

export async function POST(req: NextRequest) {
  ensureStorageDir();
  try {
    const project: PresentationProject = await req.json();
    if (!project.id || !project.title) {
      return NextResponse.json({ success: false, error: "Invalid project payload" }, { status: 400 });
    }

    const filePath = path.join(STORAGE_DIR, `${project.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(project, null, 2));

    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  ensureStorageDir();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing project id" }, { status: 400 });
  }

  const filePath = path.join(STORAGE_DIR, `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
}
