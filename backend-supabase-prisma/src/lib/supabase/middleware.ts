import type { ApiResponse } from '../../types/api.types.js';
import { verifyAccessToken } from './auth.js';
import type { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * Extracts Bearer token from an Authorization header
 */
export function extractBearerToken(authHeader?: string | null): string | null {
  if (!authHeader) return null;
  const parts = authHeader.trim().split(' ');
  if (parts.length === 2 && parts[0]?.toLowerCase() === 'bearer') {
    return parts[1] || null;
  }
  return null;
}

/**
 * Validates request authentication headers and returns the authenticated Supabase user
 */
export async function authenticateRequest(
  authHeader?: string | null
): Promise<ApiResponse<SupabaseUser>> {
  const token = extractBearerToken(authHeader);
  if (!token) {
    return {
      data: null,
      error: {
        code: 'MISSING_AUTHORIZATION_HEADER',
        message: 'Missing or malformed Authorization header. Expected Bearer <token>.',
        statusCode: 401,
      },
    };
  }

  return verifyAccessToken(token);
}
