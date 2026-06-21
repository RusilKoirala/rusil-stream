import { NextRequest, NextResponse } from 'next/server';
import { findByCode } from '@/lib/device-auth';

/**
 * GET /api/device-auth/status?code={code}
 * 
 * Poll for device code activation status.
 * Called by the TV app while waiting for the user to activate the code.
 * No auth required — the TV device doesn't have a token yet.
 * 
 * Returns:
 *   { status: "pending" }                          — waiting for activation
 *   { status: "activated", token: "dtk_..." }      — code was activated
 *   { status: "expired" }                          — code expired or not found
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'A 6-digit code is required' },
        { status: 400 }
      );
    }

    const doc = await findByCode(code);

    if (!doc || doc.status === 'expired') {
      return NextResponse.json({ status: 'expired' });
    }

    if (doc.status === 'pending') {
      return NextResponse.json({ status: 'pending' });
    }

    if (doc.status === 'activated') {
      return NextResponse.json({
        status: 'activated',
        token: doc.deviceToken,
      });
    }

    return NextResponse.json({ status: 'expired' });
  } catch (error) {
    console.error('Error checking device code status:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to check status' },
      { status: 500 }
    );
  }
}
