# Authentication Components

This directory contains all authentication-related components for the Netflix-style streaming platform. All components use **Clerk** as the authentication provider.

## Components

### AuthGuard

Server component that protects routes by checking Clerk session status.

**Usage:**
```tsx
import { AuthGuard } from '@/components/auth';

export default async function ProtectedPage() {
  return (
    <AuthGuard>
      <div>Protected content here</div>
    </AuthGuard>
  );
}
```

**Requirements:** 1.8

---

### SignInButton

Client component that triggers the Clerk sign-in flow with Netflix-styled button.

**Usage:**
```tsx
import { SignInButton } from '@/components/auth';

export default function LandingPage() {
  return (
    <div>
      <SignInButton />
    </div>
  );
}
```

**Requirements:** 1.5

---

### SignUpButton

Client component that triggers the Clerk sign-up flow with Netflix-styled button.

**Usage:**
```tsx
import { SignUpButton } from '@/components/auth';

export default function LandingPage() {
  return (
    <div>
      <SignUpButton />
    </div>
  );
}
```

**Requirements:** 1.5

---

### UserButton

Client component that displays the Clerk user menu with custom Netflix styling.

**Usage:**
```tsx
import { UserButton } from '@/components/auth';

export default function TopNav() {
  return (
    <nav>
      <UserButton />
    </nav>
  );
}
```

**Requirements:** 15.11, 15.12

---

### PasswordResetTrigger

Client component that triggers the Clerk password reset flow and displays status messages.

**Usage:**
```tsx
import { PasswordResetTrigger } from '@/components/auth';

export default function ForgotPasswordPage() {
  return (
    <div>
      <PasswordResetTrigger email="user@example.com" />
    </div>
  );
}
```

**Requirements:** 1.7

---

## Setup

### 1. Environment Variables

Ensure these Clerk environment variables are set in `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/profiles
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### 2. ClerkProvider

The `ClerkProvider` is already configured in `app/layout.tsx`:

```tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### 3. Middleware

Route protection middleware is configured in `middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/health(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

## Styling

All components use Netflix design system colors:

- **Brand Color:** `var(--brand-color)` (default: #E50914)
- **Background:** #141414
- **Cards:** #181818
- **Elevated:** #232323
- **Hover:** #2F2F2F

Buttons use shadcn/ui Button component with custom Netflix styling.

## Testing

To test authentication components:

1. Start the dev server: `npm run dev`
2. Navigate to a protected route (e.g., `/profiles`)
3. Should redirect to sign-in if not authenticated
4. Sign in through Clerk UI
5. Should redirect to `/profiles` after successful sign-in

## Related Documentation

- [AUTHENTICATION.md](../../AUTHENTICATION.md) - Full authentication setup guide
- [lib/auth.ts](../../lib/auth.ts) - Server-side authentication utilities
- [Clerk Documentation](https://clerk.com/docs) - Official Clerk docs

## Requirements Validation

These components satisfy the following requirements:

- ✅ **Requirement 1.1**: Platform integrates Auth_Provider (Clerk)
- ✅ **Requirement 1.2**: Web_App uses Auth_Provider SDK
- ✅ **Requirement 1.5**: Sign-in and sign-up buttons
- ✅ **Requirement 1.7**: Password reset flow
- ✅ **Requirement 1.8**: Route protection
- ✅ **Requirement 15.11**: Profile avatar in navigation
- ✅ **Requirement 15.12**: User menu dropdown
