import type { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from './client.js';
import { getSupabaseAdmin } from './admin.js';
import type { ApiResponse } from '../../types/api.types.js';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  user: SupabaseUser | null;
  session: Session | null;
}

/**
 * Sign up a new user via Supabase Auth
 */
export async function signUpWithEmail(
  credentials: AuthCredentials,
  metadata?: Record<string, unknown>
): Promise<ApiResponse<SignUpData>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      return {
        data: null,
        error: {
          code: error.code || 'SIGN_UP_FAILED',
          message: error.message,
          statusCode: error.status || 400,
        },
      };
    }

    return {
      data: {
        user: data.user,
        session: data.session,
      },
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected signup error';
    return {
      data: null,
      error: { code: 'INTERNAL_AUTH_ERROR', message, statusCode: 500 },
    };
  }
}

/**
 * Sign in existing user with email and password
 */
export async function signInWithEmail(
  credentials: AuthCredentials
): Promise<ApiResponse<SignUpData>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return {
        data: null,
        error: {
          code: error.code || 'SIGN_IN_FAILED',
          message: error.message,
          statusCode: error.status || 401,
        },
      };
    }

    return {
      data: {
        user: data.user,
        session: data.session,
      },
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected signin error';
    return {
      data: null,
      error: { code: 'INTERNAL_AUTH_ERROR', message, statusCode: 500 },
    };
  }
}

/**
 * Sign out current active session
 */
export async function signOut(): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return {
        data: null,
        error: { code: error.code || 'SIGN_OUT_FAILED', message: error.message, statusCode: 400 },
      };
    }
    return { data: { success: true }, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected signout error';
    return {
      data: null,
      error: { code: 'INTERNAL_AUTH_ERROR', message, statusCode: 500 },
    };
  }
}

/**
 * Verify access token (JWT) using Supabase Auth
 */
export async function verifyAccessToken(token: string): Promise<ApiResponse<SupabaseUser>> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.auth.getUser(token);

    if (error || !data.user) {
      return {
        data: null,
        error: {
          code: error?.code || 'INVALID_TOKEN',
          message: error?.message || 'Token verification failed',
          statusCode: 401,
        },
      };
    }

    return {
      data: data.user,
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected token verification error';
    return {
      data: null,
      error: { code: 'AUTH_VERIFY_ERROR', message, statusCode: 500 },
    };
  }
}
