import { auth } from '@clerk/nextjs/server';
import { LandingScreen } from '@/components/home';
import { ProfileGate } from '@/components/profiles';

export default async function Home() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  const secretKey = process.env.CLERK_SECRET_KEY || '';

  const hasClerkConfig =
    Boolean(publishableKey) &&
    Boolean(secretKey) &&
    !publishableKey.includes('your_publishable_key') &&
    !secretKey.includes('your_secret_key');

  let userId: string | null = null;

  if (hasClerkConfig) {
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch {
      userId = null;
    }
  }

  if (!userId) {
    return <LandingScreen />;
  }

  return <ProfileGate />;
}
