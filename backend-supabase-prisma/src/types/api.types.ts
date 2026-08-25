/**
 * Standard API Response Shape (adheres to api-integrator zero-any contract)
 */
export interface ApiResponse<T = unknown> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown> | null;
  statusCode?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export type Result<T, E = ApiError> = 
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: E };
