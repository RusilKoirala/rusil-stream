import { auth, currentUser } from '@clerk/nextjs/server';
import { verifyToken } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import type { APIError } from './auth-types';
import { validateDeviceToken } from './device-auth';

/**
 * Authentication utility functions for protected API routes
 */

/**
 * Validates authentication token and returns userId
 * Throws error if user is not authenticated
 * 
 * @returns userId from Clerk
 * @throws Error if user is not authenticated
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  return userId;
}

/**
 * Gets the current authenticated user's ID
 * Returns null if user is not authenticated
 * 
 * @returns userId or null
 */
export async function getAuthUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Gets the full user object from Clerk
 * Returns null if user is not authenticated
 * 
 * @returns User object or null
 */
export async function getAuthUser() {
  return await currentUser();
}

/**
 * Validates authentication for API routes
 * Returns standardized error response if not authenticated
 * 
 * @returns Object with userId if authenticated, or error response
 */
export async function validateApiAuth(): Promise<
  | { userId: string; error: null }
  | { userId: null; error: Response }
> {
  try {
    const userId = await requireAuth();
    return { userId, error: null };
  } catch {
    // Support mobile/native clients that send Clerk bearer tokens.
    const bearerUserId = await getUserIdFromBearerToken();
    if (bearerUserId) {
      return { userId: bearerUserId, error: null };
    }

    // Support TV devices that send device tokens via x-device-token header.
    const deviceUserId = await getUserIdFromDeviceToken();
    if (deviceUserId) {
      return { userId: deviceUserId, error: null };
    }

    return {
      userId: null,
      error: createErrorResponse('UNAUTHORIZED', 'Authentication required', 401),
    };
  }
}

async function getUserIdFromBearerToken(): Promise<string | null> {
  const requestHeaders = await headers();
  const authorization = requestHeaders.get('authorization') || requestHeaders.get('Authorization');

  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  const token = authorization.slice(7).trim();
  if (!token) {
    return null;
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

async function getUserIdFromDeviceToken(): Promise<string | null> {
  const requestHeaders = await headers();
  const deviceToken = requestHeaders.get('x-device-token');

  if (!deviceToken) {
    return null;
  }

  try {
    return await validateDeviceToken(deviceToken);
  } catch {
    return null;
  }
}

/**
 * Extracts userId from request headers (for API routes)
 * This is a helper for routes that need to validate auth manually
 * 
 * @param request - Next.js request object
 * @returns userId or null
 */
export async function getUserIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  return await getAuthUserId();
}

/**
 * Checks if the current user is authenticated
 * 
 * @returns boolean indicating authentication status
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getAuthUserId();
  return userId !== null;
}

/**
 * Validates an internal API key passed via x-internal-api-key header.
 * In production, INTERNAL_API_KEY must be configured for protected internal routes.
 * In non-production, missing INTERNAL_API_KEY does not block requests.
 */
export function validateInternalApiKey(request: NextRequest): Response | null {
  const configuredKey = process.env.INTERNAL_API_KEY;
  const providedKey = request.headers.get('x-internal-api-key');

  if (!configuredKey) {
    if (process.env.NODE_ENV === 'production') {
      return createErrorResponse(
        'SERVER_MISCONFIGURED',
        'INTERNAL_API_KEY is required in production',
        500
      );
    }

    return null;
  }

  if (providedKey !== configuredKey) {
    return createErrorResponse('FORBIDDEN', 'Invalid internal API key', 403);
  }

  return null;
}

/**
 * Creates a standardized error response
 * 
 * @param error - Error type
 * @param message - Human-readable error message
 * @param status - HTTP status code
 * @param details - Optional additional error details
 * @returns Response object
 */
export function createErrorResponse(
  error: string,
  message: string,
  status: number,
  details?: any
): Response {
  const errorBody: APIError = {
    error,
    message,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  };

  return new Response(JSON.stringify(errorBody), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Creates a standardized success response
 * 
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @returns Response object
 */
export function createSuccessResponse<T>(data: T, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
