/**
 * POST /api/email/welcome
 * 
 * Send welcome email to new users
 * Requirements: 33.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email/resend';
import { validateApiAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { error } = await validateApiAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { userId, email, name } = body;

    // Validate required fields
    if (!userId || !email || !name) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Missing required fields: userId, email, and name are required',
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

    // Send welcome email
    await sendWelcomeEmail(email, name);

    return NextResponse.json(
      {
        success: true,
        message: 'Welcome email sent successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to send welcome email:', error);

    return NextResponse.json(
      {
        error: 'BAD_GATEWAY',
        message: 'Failed to send welcome email',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 502 }
    );
  }
}
