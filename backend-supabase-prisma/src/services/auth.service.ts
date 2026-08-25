import { signUpWithEmail, signInWithEmail, signOut, verifyAccessToken, type AuthCredentials } from '../lib/supabase/auth.js';
import { UserService } from './user.service.js';
import { prisma } from '../lib/prisma/client.js';
import type { ApiResponse } from '../types/api.types.js';
import type { UserWithProfile } from '../types/database.types.js';

export interface RegisterResult {
  user: UserWithProfile | null;
  sessionToken?: string;
}

export class AuthService {
  /**
   * Registers a user in both Supabase Auth and the Prisma PostgreSQL Database
   */
  static async register(
    credentials: AuthCredentials,
    metadata?: { displayName?: string; bio?: string; avatarUrl?: string }
  ): Promise<ApiResponse<RegisterResult>> {
    // 1. Create user in Supabase Auth
    const authRes = await signUpWithEmail(credentials, metadata);
    if (authRes.error || !authRes.data?.user) {
      return {
        data: null,
        error: authRes.error || { code: 'REGISTRATION_FAILED', message: 'Failed to create auth account' },
      };
    }

    const supabaseUser = authRes.data.user;

    // 2. Sync / Upsert user in Prisma DB
    const userRes = await UserService.create({
      id: supabaseUser.id,
      email: supabaseUser.email ?? credentials.email,
      displayName: metadata?.displayName,
      avatarUrl: metadata?.avatarUrl,
      bio: metadata?.bio,
    });

    if (userRes.error) {
      return {
        data: null,
        error: userRes.error,
      };
    }

    return {
      data: {
        user: userRes.data,
        sessionToken: authRes.data.session?.access_token,
      },
      error: null,
    };
  }

  /**
   * Signs in user via Supabase and updates lastSignInAt in Prisma
   */
  static async login(credentials: AuthCredentials): Promise<ApiResponse<{ user: UserWithProfile; accessToken: string }>> {
    const authRes = await signInWithEmail(credentials);
    if (authRes.error || !authRes.data?.session?.access_token || !authRes.data.user) {
      return {
        data: null,
        error: authRes.error || { code: 'INVALID_CREDENTIALS', message: 'Authentication failed' },
      };
    }

    const userId = authRes.data.user.id;

    // Update last sign in timestamp
    await prisma.user.updateMany({
      where: { id: userId },
      data: { lastSignInAt: new Date() },
    });

    const userRecord = await UserService.getById(userId);
    if (!userRecord.data) {
      return {
        data: null,
        error: { code: 'USER_NOT_FOUND', message: 'Database profile not found for user' },
      };
    }

    return {
      data: {
        user: userRecord.data,
        accessToken: authRes.data.session.access_token,
      },
      error: null,
    };
  }

  /**
   * Resolves the current authenticated user from a bearer JWT token
   */
  static async getCurrentUser(token: string): Promise<ApiResponse<UserWithProfile | null>> {
    const verifyRes = await verifyAccessToken(token);
    if (verifyRes.error || !verifyRes.data) {
      return {
        data: null,
        error: verifyRes.error || { code: 'UNAUTHORIZED', message: 'Invalid session token' },
      };
    }

    return UserService.getById(verifyRes.data.id);
  }

  /**
   * Logs out the user session
   */
  static async logout(): Promise<ApiResponse<{ success: boolean }>> {
    return signOut();
  }
}
