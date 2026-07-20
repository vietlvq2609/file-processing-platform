/**
 * Pagination metadata included in list responses.
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Standard envelope for single-resource API responses.
 * Shape: { data: T }
 */
export interface ApiResponse<T> {
  data: T;
}

/**
 * Standard envelope for collection API responses.
 * Shape: { data: T[], meta: PaginationMeta }
 */
export interface ApiListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * A single field-level validation error returned by the API on 422 responses.
 */
export interface ApiFieldError {
  field: string;
  message: string;
}

/**
 * The error object returned inside ApiErrorResponse.
 */
export interface ApiError {
  /** Machine-readable error code (e.g. "FILE_NOT_FOUND", "VALIDATION_ERROR"). */
  code: string;
  /** Human-readable error message. */
  message: string;
  /** Per-field validation errors, present only on 422 responses. */
  fields?: ApiFieldError[];
}

/**
 * Top-level shape of all error responses from the API.
 * Shape: { error: ApiError }
 */
export interface ApiErrorResponse {
  error: ApiError;
}
