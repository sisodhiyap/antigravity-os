import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("file:")) {
    return process.env.DATABASE_URL;
  }
  
  // Package production path on Windows/Mac/Linux
  const dataDir = process.env.ANTIGRAVITY_DATA_DIR || 
    (process.env.APPDATA ? path.join(process.env.APPDATA, "AntigravityOS", "data") : null);
    
  if (dataDir && (process.env.NODE_ENV === "production" || process.env.ANTIGRAVITY_DATA_DIR)) {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      return `file:${path.resolve(dataDir, "production.db")}`;
    } catch {
      // Fallback to local project directory
    }
  }

  const localDir = path.resolve(process.cwd(), "prisma");
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }
  return `file:${path.resolve(localDir, "production.db")}`;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: resolveDatabaseUrl(),
    },
  },
});

export interface Project {
  id: string;
  name: string;
  description: string;
  brief?: string;
  createdAt: string;
  researchText?: string;
  strategyText?: string;
}

export interface User {
  email: string;
  role: string;
}

export interface GenerationJob {
  jobId: string;
  projectId: string;
  capability: string;
  provider: string;
  model: string;
  status: "QUEUED" | "RUNNING" | "VALIDATING" | "COMPLETED" | "FAILED";
  startedAt: string;
  completedAt?: string;
  executionMode: string;
  assetId?: string;
}

export class ProductionDatabase {
  private static instance: ProductionDatabase;

  private constructor() {}

  public static getInstance(): ProductionDatabase {
    if (!this.instance) {
      this.instance = new ProductionDatabase();
    }
    return this.instance;
  }

  public async getUsers(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users.map((u) => ({ email: u.email, role: u.role }));
  }

  public async addUser(user: User): Promise<void> {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { role: user.role },
      create: { email: user.email, role: user.role },
    });
  }

  public async getProjects(email?: string): Promise<Project[]> {
    if (!email) {
      const projects = await prisma.project.findMany({
        include: { research: true },
      });
      return projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || "",
        brief: p.brief || undefined,
        createdAt: p.createdAt.toISOString(),
        researchText: p.research?.findingsText || undefined,
        strategyText: p.research?.strategyText || undefined,
      }));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return [];

    const memberships = await prisma.projectMember.findMany({
      where: { userId: user.id },
      include: { project: { include: { research: true } } },
    });

    return memberships.map((m) => ({
      id: m.project.id,
      name: m.project.name,
      description: m.project.description || "",
      brief: m.project.brief || undefined,
      createdAt: m.project.createdAt.toISOString(),
      researchText: m.project.research?.findingsText || undefined,
      strategyText: m.project.research?.strategyText || undefined,
    }));
  }

  public async getProject(id: string, email?: string): Promise<Project | undefined> {
    const p = await prisma.project.findUnique({
      where: { id },
      include: { research: true },
    });
    if (!p) return undefined;

    if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return undefined;

      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: id, userId: user.id },
        },
      });
      if (!member) {
        throw new Error("Authorization failed: Operator is not a member of this workspace");
      }
    }

    return {
      id: p.id,
      name: p.name,
      description: p.description || "",
      brief: p.brief || undefined,
      createdAt: p.createdAt.toISOString(),
      researchText: p.research?.findingsText || undefined,
      strategyText: p.research?.strategyText || undefined,
    };
  }

  public async createProject(name: string, description: string, email?: string, brief?: string): Promise<Project> {
    const targetEmail = email || "operator@omnicraft.ai";
    let defaultUser = await prisma.user.findUnique({ where: { email: targetEmail } });
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: { email: targetEmail, role: "OWNER" },
      });
    }

    const p = await prisma.project.create({
      data: {
        name,
        description,
        brief: brief || null,
      },
    });

    // Create project owner membership
    await prisma.projectMember.create({
      data: {
        projectId: p.id,
        userId: defaultUser.id,
        role: "OWNER",
      },
    });

    return {
      id: p.id,
      name: p.name,
      description: p.description || "",
      brief: p.brief || undefined,
      createdAt: p.createdAt.toISOString(),
    };
  }

  public async updateProject(id: string, updates: Partial<Omit<Project, "id">>, email?: string) {
    if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("Unauthorized");

      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: id, userId: user.id },
        },
      });
      if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
        throw new Error("Authorization failed: Insufficient permissions to modify project details");
      }
    }

    const data: any = {};
    if (updates.name !== undefined) data.name = updates.name;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.brief !== undefined) data.brief = updates.brief;

    if (updates.researchText !== undefined || updates.strategyText !== undefined) {
      const upsertData: any = {};
      if (updates.researchText !== undefined) upsertData.findingsText = updates.researchText;
      if (updates.strategyText !== undefined) upsertData.strategyText = updates.strategyText;

      await prisma.researchRecord.upsert({
        where: { projectId: id },
        update: upsertData,
        create: { projectId: id, ...upsertData },
      });
    }

    if (Object.keys(data).length > 0) {
      await prisma.project.update({
        where: { id },
        data,
      });
    }
  }

  public async getJobs(): Promise<GenerationJob[]> {
    const jobs = await prisma.generationJob.findMany();
    return jobs.map((j) => ({
      jobId: j.jobId,
      projectId: j.projectId,
      capability: j.capability,
      provider: j.provider,
      model: j.model,
      status: j.status as any,
      startedAt: j.startedAt.toISOString(),
      completedAt: j.completedAt?.toISOString(),
      executionMode: j.executionMode,
    }));
  }

  public async addJob(job: GenerationJob): Promise<void> {
    let defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: { email: "operator@omnicraft.ai", role: "OWNER" },
      });
    }

    let project = await prisma.project.findUnique({ where: { id: job.projectId } });
    if (!project) {
      project = await prisma.project.create({
        data: { id: job.projectId, name: `Workspace ${job.projectId}` },
      });
      // Ensure default user is linked as OWNER
      await prisma.projectMember.create({
        data: { projectId: project.id, userId: defaultUser.id, role: "OWNER" },
      });
    }

    await prisma.generationJob.create({
      data: {
        jobId: job.jobId,
        capability: job.capability,
        provider: job.provider,
        model: job.model,
        status: job.status,
        executionMode: job.executionMode,
        project: { connect: { id: project.id } },
        user: { connect: { id: defaultUser.id } },
      },
    });
  }

  public async updateJobStatus(jobId: string, status: GenerationJob["status"], assetId?: string): Promise<void> {
    const data: any = { status, completedAt: new Date() };
    await prisma.generationJob.update({
      where: { jobId },
      data,
    });
  }

  public async clearAll(): Promise<void> {
    await prisma.researchRecord.deleteMany();
    await prisma.projectMember.deleteMany();
    await prisma.generationJob.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  }
}

export const db = ProductionDatabase.getInstance();
export { prisma };
