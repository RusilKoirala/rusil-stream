import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth, createErrorResponse } from '@/lib/auth';
import { activateDeviceCode } from '@/lib/device-auth';

/**
 * POST /api/device-auth/activate
 * 
 * Activate a device code, linking the TV device to the authenticated user's account.
 * Requires Clerk authentication (user must be logged in on the web app).
 * 
 * Body: { code: "123456" }
 * Returns: { success: true } or error
 */
export async function POST(request: NextRequest) {
  // User must be logged in via Clerk
  const auth = await validateApiAuth();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'A 6-digit code is required' },
        { status: 400 }
      );
    }

    const result = await activateDeviceCode(code, auth.userId!);

    if (!result.success) {
      return NextResponse.json(
        { error: 'ACTIVATION_FAILED', message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error activating device code:', error);
    return createErrorResponse('INTERNAL_ERROR', 'Failed to activate device code', 500);
  }
}
