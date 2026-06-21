'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * SignUpButton - Triggers Clerk sign-up flow
 * 
 * Styled with Netflix brand color and hover states using shadcn/ui Button.
 * 
 * Requirements: 1.5
 * 
 * @example
 * ```tsx
 * <SignUpButton />
 * ```
 */
export function SignUpButton() {
  return (
    <Link
      href="/sign-up"
      className={cn(
        buttonVariants({ variant: 'default' }),
        'bg-(--brand-color) text-white hover:bg-(--brand-color)/90'
      )}
    >
      Sign Up
    </Link>
  );
}
