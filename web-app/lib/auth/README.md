# Authentication Setup

This directory contains authentication utilities using Clerk for Next.js App Router.

## Overview

The platform uses **Clerk** as the authentication provider, handling:
- User registration and login
- Social authentication (Google OAuth)
- Password reset flows
- Session management
- Token validation

## Configuration

### Environment Variables

Add these to your `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/profiles
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### Getting Clerk Credentials

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy the publishable key and secret key from the dashboard
4. Configure sign-in/sign-up URLs in Clerk dashboard

## Usage

### Protecting API Routes

Use `validateApiAuth()` in your API route handlers:

```typescript
import { validateApiAuth } from '@/lib/auth';

export async function GET(request: Request) {
  const { userId, error } = await validateApiAuth();
  
  if (error) {
    return error; // Returns 401 Unauthorized
  }
  
  // Your protected logic here
  // userId is guaranteed to be a string
}
```

### Getting User ID

```typescript
import { requireAuth, getAuthUserId } from '@/lib/auth';

// Throws error if not authenticated
const userId = await requireAuth();

// Returns null if not authenticated
const userId = await getAuthUserId();
```

### Checking Authentication Status

```typescript
import { isAuthenticated } from '@/lib/auth';

const authenticated = await isAuthenticated();
if (!authenticated) {
  // Handle unauthenticated state
}
```

### Getting Full User Object

```typescript
import { getAuthUser } from '@/lib/auth';

const user = await getAuthUser();
if (user) {
  console.log(user.emailAddresses[0].emailAddress);
  console.log(user.firstName, user.lastName);
}
```

## Middleware

The `middleware.ts` file at the root protects all routes except:
- `/` (landing page)
- `/sign-in` and `/sign-up`
- `/api/health/*` (health check endpoints)

All other routes require authentication.

## Error Handling

All authentication errors return a standardized format:

```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Use `createErrorResponse()` for consistent error responses:

```typescript
import { createErrorResponse } from '@/lib/auth';

return createErrorResponse('NOT_FOUND', 'Resource not found', 404);
```

## Alternative: Auth0

To use Auth0 instead of Clerk:

1. Install `@auth0/nextjs-auth0`
2. Update environment variables
3. Replace Clerk imports with Auth0 equivalents
4. Update middleware.ts to use Auth0 middleware

See `.env.example` for Auth0 configuration options.
