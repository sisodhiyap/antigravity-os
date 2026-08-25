import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var globalPrisma: PrismaClient | undefined;
}

/**
 * Instantiates or retrieves the singleton PrismaClient instance.
 * In development, attaches the client to globalThis to prevent hot-reloading 
 * from creating multiple DB connection pools and exhausting Supabase connection limits.
 */
export const prisma: PrismaClient =
  globalThis.globalPrisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.globalPrisma = prisma;
}

export default prisma;
