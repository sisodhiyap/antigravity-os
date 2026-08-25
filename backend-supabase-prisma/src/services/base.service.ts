import type { ApiResponse, ApiError } from '../types/api.types.js';

/**
 * Base service wrapper executing asynchronous operations with standardized { data, error } handling.
 * Guarantees no uncaught rejections or undefined return values reach API boundaries.
 */
export async function safeExec<T>(
  operation: () => Promise<T>,
  fallbackErrorMessage = 'An unexpected database error occurred'
): Promise<ApiResponse<T>> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (err: unknown) {
    const error: ApiError = {
      code: 'DATABASE_OPERATION_ERROR',
      message: err instanceof Error ? err.message : fallbackErrorMessage,
      statusCode: 500,
    };

    // Extract Prisma or standard error codes if present
    if (typeof err === 'object' && err !== null) {
      if ('code' in err && typeof (err as { code: unknown }).code === 'string') {
        error.code = (err as { code: string }).code;
      }
      if ('meta' in err) {
        error.details = (err as { meta: Record<string, unknown> }).meta;
      }
    }

    return { data: null, error };
  }
}
