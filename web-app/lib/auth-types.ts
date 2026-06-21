/**
 * Authentication-related TypeScript types
 */

/**
 * Standard API error response format
 */
export interface APIError {
  error: string;          // Error type (e.g., "UNAUTHORIZED", "NOT_FOUND", "VALIDATION_ERROR")
  message: string;        // Human-readable error message
  details?: any;          // Optional additional error details
  timestamp: string;      // ISO 8601 timestamp
}

/**
 * Authentication context for API routes
 */
export interface AuthContext {
  userId: string;
  sessionId?: string;
}

/**
 * Protected API route handler type
 */
export type ProtectedAPIHandler<T = any> = (
  request: Request,
  context: { params: any; auth: AuthContext }
) => Promise<Response | T>;
