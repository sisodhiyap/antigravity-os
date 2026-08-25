// ==============================================================================
// UNIVERSAL SUPABASE & PRISMA BACKEND — PUBLIC EXPORTS
// ==============================================================================

// Configuration
export * from './config/env.js';

// Prisma Clients & Extensions
export { prisma, default as defaultPrisma } from './lib/prisma/client.js';
export { createExtendedPrismaClient } from './lib/prisma/extensions.js';

// Supabase Clients & Helpers
export { supabase } from './lib/supabase/client.js';
export { getSupabaseAdmin, supabaseAdmin } from './lib/supabase/admin.js';
export {
  signUpWithEmail,
  signInWithEmail,
  signOut,
  verifyAccessToken,
} from './lib/supabase/auth.js';
export { extractBearerToken, authenticateRequest } from './lib/supabase/middleware.js';

// Services
export { safeExec } from './services/base.service.js';
export { UserService } from './services/user.service.js';
export { AuthService } from './services/auth.service.js';
export { TaskService } from './services/task.service.js';

// Types
export * from './types/api.types.js';
export * from './types/database.types.js';
