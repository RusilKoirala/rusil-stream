import { validateApiAuth, createSuccessResponse, getAuthUser } from '@/lib/auth';

/**
 * GET /api/auth/me
 * Returns the current authenticated user's information
 * 
 * This is an example protected API route demonstrating authentication
 */
export async function GET() {
  // Validate authentication
  const { userId, error } = await validateApiAuth();
  
  if (error) {
    return error;
  }
  
  // Get full user object from Clerk
  const user = await getAuthUser();
  
  if (!user) {
    return createSuccessResponse({
      userId,
      email: null,
      name: null,
    });
  }
  
  // Return user information
  return createSuccessResponse({
    userId,
    email: user.emailAddresses[0]?.emailAddress || null,
    name: user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.firstName || user.lastName || null,
    imageUrl: user.imageUrl || null,
  });
}
