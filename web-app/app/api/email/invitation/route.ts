/**
 * POST /api/email/invitation
 * 
 * Send invitation email to invite others to the platform
 * Requirements: 33.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendInvitationEmail } from '@/lib/email/resend';
import { validateApiAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { error } = await validateApiAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { email, inviterName } = body;

    // Validate required fields
    if (!email || !inviterName) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Missing required fields: email and inviterName are required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid email format',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Send invitation email
    await sendInvitationEmail(email, inviterName);

    return NextResponse.json(
      {
        success: true,
        message: 'Invitation email sent successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to send invitation email:', error);

    return NextResponse.json(
      {
        error: 'BAD_GATEWAY',
        message: 'Failed to send invitation email',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 502 }
    );
  }
}
