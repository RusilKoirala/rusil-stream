import { NextResponse } from 'next/server';
import { createDeviceCode } from '@/lib/device-auth';

/**
 * POST /api/device-auth/generate
 * 
 * Generate a new device code for TV device authentication.
 * No auth required — the TV device isn't authenticated yet.
 * 
 * Returns: { code, expiresIn }
 */
export async function POST() {
  try {
    const result = await createDeviceCode();

    return NextResponse.json({
      code: result.code,
      expiresIn: result.expiresIn,
    }, { status: 200 });
  } catch (error) {
    console.error('Error generating device code:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Failed to generate device code',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
