import { PrismaClient, UserRole, UserStatus, OrgRole, ItemStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Default Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@example.com',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      profile: {
        create: {
          displayName: 'System Super Admin',
          bio: 'Root platform administrator',
          metadata: { initialized: true, team: 'Core Operations' },
        },
      },
    },
  });
  console.log(`✅ Admin user seeded: ${adminUser.email} (${adminUser.id})`);

  // 2. Create Default Workspace / Organization
  const defaultOrg = await prisma.organization.upsert({
    where: { slug: 'default-workspace' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      name: 'Default Workspace',
      slug: 'default-workspace',
      memberships: {
        create: {
          userId: adminUser.id,
          role: OrgRole.OWNER,
        },
      },
    },
  });
  console.log(`✅ Organization seeded: ${defaultOrg.name} (${defaultOrg.slug})`);

  // 3. Create Sample Starter Resource Item
  const sampleItem = await prisma.resourceItem.upsert({
    where: { slug: 'welcome-to-antigravity' },
    update: {},
    create: {
      title: 'Welcome to Antigravity Supabase & Prisma Backend',
      slug: 'welcome-to-antigravity',
      content: 'This is a sample resource item seeded into your PostgreSQL database.',
      status: ItemStatus.PUBLISHED,
      tags: ['starter', 'supabase', 'prisma', 'architecture'],
      authorId: adminUser.id,
      organizationId: defaultOrg.id,
      metadata: { priority: 'high', version: '1.0.0' },
    },
  });
  console.log(`✅ Resource item seeded: ${sampleItem.title}`);

  // 4. Create Initial Audit Log
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_DATABASE_SEEDED',
      entity: 'System',
      entityId: 'seed-001',
      actorId: adminUser.id,
      details: {
        timestamp: new Date().toISOString(),
        message: 'Initial baseline database seed executed successfully.',
      },
    },
  });
  console.log('✅ Initial audit log entry created.');

  console.log('🚀 Database seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
