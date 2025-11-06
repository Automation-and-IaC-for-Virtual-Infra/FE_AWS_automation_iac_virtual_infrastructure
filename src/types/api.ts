/**
 * Base API Response
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
  timestamp?: string
}

/**
 * API Error Details
 */
export interface ApiError {
  code?: string
  message: string
  details?: Record<string, any>
  stack?: string
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> extends ApiResponse<T> {
  items: T[]
  page: number
  page_size: number
  total: number
  pages: number
  unread_count?: number
}

/**
 * Success Response Helper
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Error Response Helper
 */
export function createErrorResponse(
  message: string,
  code?: string,
  details?: Record<string, any>
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  }
}
