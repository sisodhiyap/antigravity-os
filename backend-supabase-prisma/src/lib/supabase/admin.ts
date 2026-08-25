import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let adminClientInstance: SupabaseClient | null = null;

/**
 * Elevated Supabase Admin Client (Service Role Key).
 * ⚠️ BACKEND-ONLY: This client completely bypasses Row Level Security (RLS).
 * Use strictly in secure backend routes, webhooks, background jobs, and worker scripts.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (adminClientInstance) {
    return adminClientInstance;
  }

  if (!supabaseServiceRoleKey && process.env.NODE_ENV === 'production') {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required to initialize the elevated admin client in production.'
    );
  }

  adminClientInstance = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseServiceRoleKey || 'placeholder-service-key',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return adminClientInstance;
}

export const supabaseAdmin = getSupabaseAdmin();
export default supabaseAdmin;
