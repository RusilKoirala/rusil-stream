'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * SignInButton - Triggers Clerk sign-in flow
 * 
 * Styled with Netflix brand color and hover states using shadcn/ui Button.
 * 
 * Requirements: 1.5
 * 
 * @example
 * ```tsx
 * <SignInButton />
 * ```
 */
export function SignInButton() {
  return (
    <Link
      href="/sign-in"
      className={cn(
        buttonVariants({ variant: 'default' }),
        'bg-(--brand-color) text-white hover:bg-(--brand-color)/90'
      )}
    >
      Sign In
    </Link>
  );
}
