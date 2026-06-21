'use client';

import { useAuth } from '@clerk/nextjs';

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

export function isClerkClientConfigured(): boolean {
  return (
    clerkPublishableKey.length > 0 &&
    !clerkPublishableKey.includes('your_publishable_key')
  );
}

type OptionalAuthState = {
  isLoaded: boolean;
  userId: string | null;
};

const unauthenticatedState: OptionalAuthState = {
  isLoaded: true,
  userId: null,
};

export function useOptionalAuth(): OptionalAuthState {
  if (!isClerkClientConfigured()) {
    return unauthenticatedState;
  }

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { isLoaded, userId } = useAuth();
    return { isLoaded, userId: userId ?? null };
  } catch {
    return unauthenticatedState;
  }
}
