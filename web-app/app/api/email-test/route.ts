/**
 * Email Service Test Route
 * 
 * This route is for testing the Resend email service integration.
 * It can be used to verify that emails are being sent correctly.
 * 
 * Usage:
 * POST /api/email-test
 * Body: { "type": "welcome" | "invitation" | "security", "email": "test@example.com", ... }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  sendWelcomeEmail,
  sendInvitationEmail,
  sendSecurityNotification,
} from '@/lib/email';
import { validateInternalApiKey } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const internalKeyError = validateInternalApiKey(request);
  if (internalKeyError) return internalKeyError;

  try {
    const body = await request.json();
    const { type, email, name, inviterName, event } = body;

    if (!type || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: type and email' },
        { status: 400 }
      );
    }

    let result: string;

    switch (type) {
      case 'welcome':
        if (!name) {
          return NextResponse.json(
            { error: 'Missing required field: name' },
            { status: 400 }
          );
        }
        await sendWelcomeEmail(email, name);
        result = `Welcome email sent to ${email}`;
        break;

      case 'invitation':
        if (!inviterName) {
          return NextResponse.json(
            { error: 'Missing required field: inviterName' },
            { status: 400 }
          );
        }
        await sendInvitationEmail(email, inviterName);
        result = `Invitation email sent to ${email}`;
        break;

      case 'security':
        if (!event) {
          return NextResponse.json(
            { error: 'Missing required field: event' },
            { status: 400 }
          );
        }
        await sendSecurityNotification(email, event);
        result = `Security notification sent to ${email}`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type. Must be: welcome, invitation, or security' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Email test failed:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest) {
  const internalKeyError = validateInternalApiKey(request);
  if (internalKeyError) return internalKeyError;

  return NextResponse.json({
    message: 'Email Test API',
    usage: {
      method: 'POST',
      body: {
        welcome: {
          type: 'welcome',
          email: 'user@example.com',
          name: 'John Doe',
        },
        invitation: {
          type: 'invitation',
          email: 'friend@example.com',
          inviterName: 'John Doe',
        },
        security: {
          type: 'security',
          email: 'user@example.com',
          event: 'password_changed | email_changed | new_device_login | profile_created | profile_deleted',
        },
      },
    },
  });
}
