import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Creates an extended Prisma client with automatic audit logging and query timing.
 */
export function createExtendedPrismaClient(client: PrismaClient) {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const before = performance.now();
          const result = await query(args);
          const duration = performance.now() - before;

          if (process.env.DEBUG_PRISMA === 'true') {
            console.log(`[PRISMA] ${model}.${operation} took ${duration.toFixed(2)}ms`);
          }

          return result;
        },
      },
    },
  });
}
