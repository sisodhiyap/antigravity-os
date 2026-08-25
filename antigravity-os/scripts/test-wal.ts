import { prisma } from "../src/server/db";

async function main() {
  const before: any = await prisma.$queryRawUnsafe("PRAGMA journal_mode;");
  console.log("Journal Mode Before:", before);

  const setRes: any = await prisma.$queryRawUnsafe("PRAGMA journal_mode = WAL;");
  console.log("Set WAL Result:", setRes);

  const after: any = await prisma.$queryRawUnsafe("PRAGMA journal_mode;");
  console.log("Journal Mode After:", after);

  await prisma.$disconnect();
}

main().catch(console.error);
