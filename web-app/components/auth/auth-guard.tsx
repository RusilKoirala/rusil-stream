import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

/**
 * AuthGuard - Route protection component
 * 
 * Checks Clerk session status and redirects to sign-in if unauthenticated.
 * Pass through to children if authenticated.
 * 
 * Requirements: 1.8
 * 
 * @example
 * ```tsx
 * export default async function ProtectedPage() {
 *   return (
 *     <AuthGuard>
 *       <div>Protected content</div>
 *     </AuthGuard>
 *   );
 * }
 * ```
 */
export async function AuthGuard({ children }: { children: React.ReactNode }) {
  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch {
    userId = null;
  }

  if (!userId) {
    redirect('/sign-in');
  }

  return <>{children}</>;
}
