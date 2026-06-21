/**
 * POST /api/email/security
 * 
 * Send security notification email
 * Requirements: 33.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendSecurityNotification } from '@/lib/email/resend';
import { validateApiAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { error } = await validateApiAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { userId, email, event } = body;

    // Validate required fields
    if (!userId || !email || !event) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Missing required fields: userId, email, and event are required',
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

    // Validate event type (optional but recommended)
    const validEvents = [
      'password_changed',
      'email_changed',
      'new_device_login',
      'profile_created',
      'profile_deleted',
    ];

    if (!validEvents.includes(event)) {
      console.warn(`Unknown security event type: ${event}`);
    }

    // Send security notification email
    await sendSecurityNotification(email, event);

    return NextResponse.json(
      {
        success: true,
        message: 'Security notification email sent successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to send security notification email:', error);

    return NextResponse.json(
      {
        error: 'BAD_GATEWAY',
        message: 'Failed to send security notification email',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 502 }
    );
  }
}
