import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.resolve(__dirname, "..", "prisma", "production.db")}`,
    },
  },
});

async function main() {
  console.log("🚀 STARTING DATABASE REALITY AUDIT...");

  // 1. Clear test data if existing
  const testEmail = "audit_user@omnicraft.ai";
  await prisma.projectMember.deleteMany({ where: { user: { email: testEmail } } });
  await prisma.generationJob.deleteMany({ where: { user: { email: testEmail } } });
  await prisma.asset.deleteMany({ where: { owner: { email: testEmail } } });
  await prisma.session.deleteMany({ where: { user: { email: testEmail } } });
  await prisma.user.deleteMany({ where: { email: testEmail } });

  // 2. Create User, Project, ProjectMember, Job, Asset
  console.log("📝 Creating audit entities...");
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      role: "OWNER",
    },
  });
  console.log(`✅ User created: ${user.id}`);

  const project = await prisma.project.create({
    data: {
      name: "Audit Project",
      description: "Database reality validation project",
    },
  });
  console.log(`✅ Project created: ${project.id}`);

  const member = await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId: user.id,
      role: "OWNER",
    },
  });
  console.log(`✅ ProjectMember created: ${member.id}`);

  const job = await prisma.generationJob.create({
    data: {
      jobId: `job_audit_${Date.now()}`,
      userId: user.id,
      projectId: project.id,
      capability: "IMAGE",
      provider: "mock-dall-e",
      model: "dall-e-3",
      status: "COMPLETED",
      executionMode: "LOCAL",
    },
  });
  console.log(`✅ GenerationJob created: ${job.jobId}`);

  const asset = await prisma.asset.create({
    data: {
      assetId: `asset_audit_${Date.now()}`,
      projectId: project.id,
      ownerId: user.id,
      type: "IMAGE",
      mimeType: "image/svg+xml",
      format: "SVG",
      sizeBytes: 1024,
      hashSha256: `hash_audit_${Date.now()}`,
      path: "/generated-assets/image/audit.svg",
      executionMode: "LOCAL",
    },
  });
  console.log(`✅ Asset created: ${asset.assetId}`);

  // 3. Test relations query
  console.log("🔍 Verifying database relations...");
  const projectWithRelations = await prisma.project.findUnique({
    where: { id: project.id },
    include: {
      members: { include: { user: true } },
      jobs: true,
      assets: true,
    },
  });

  if (!projectWithRelations) throw new Error("Relations verify failed: Project not found");
  if (projectWithRelations.members.length === 0) throw new Error("Relations verify failed: No members found");
  if (projectWithRelations.jobs.length === 0) throw new Error("Relations verify failed: No jobs found");
  if (projectWithRelations.assets.length === 0) throw new Error("Relations verify failed: No assets found");
  console.log("✅ Database relations verified successfully!");

  // 4. Test Transaction Rollback
  console.log("🔄 Testing transaction atomic rollback...");
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          email: "transaction_user@omnicraft.ai",
          role: "USER",
        },
      });
      // Force failure to trigger rollback
      throw new Error("Triggered rollback error");
    });
  } catch (err: any) {
    console.log(`ℹ️ Expected error caught: ${err.message}`);
  }

  const rolledBackUser = await prisma.user.findUnique({
    where: { email: "transaction_user@omnicraft.ai" },
  });
  if (rolledBackUser) {
    throw new Error("Transaction Rollback Failed: User record persisted despite rollback request");
  }
  console.log("✅ Transaction atomic rollback verified successfully!");

  // 5. Concurrent Writes
  console.log("⚡ Testing concurrent write performance...");
  const concurrentCount = 10;
  const promises = [];
  for (let i = 0; i < concurrentCount; i++) {
    promises.push(
      prisma.generationJob.create({
        data: {
          jobId: `job_concurrent_${i}_${Date.now()}`,
          userId: user.id,
          projectId: project.id,
          capability: "IMAGE",
          provider: "mock-dall-e",
          model: "dall-e-3",
          status: "COMPLETED",
          executionMode: "LOCAL",
        },
      })
    );
  }
  await Promise.all(promises);
  console.log(`✅ Successfully executed ${concurrentCount} concurrent writes with zero lock collisions!`);

  // Clean up
  await prisma.projectMember.deleteMany({ where: { user: { email: testEmail } } });
  await prisma.generationJob.deleteMany({ where: { user: { email: testEmail } } });
  await prisma.generationJob.deleteMany({ where: { jobId: { startsWith: "job_concurrent_" } } });
  await prisma.asset.deleteMany({ where: { owner: { email: testEmail } } });
  await prisma.user.deleteMany({ where: { email: testEmail } });
  console.log("🎉 DATABASE REALITY AUDIT COMPLETED SUCCESSFULLY!");
}

main().catch((err) => {
  console.error("❌ DATABASE REALITY AUDIT FAILED:", err);
  process.exit(1);
});
