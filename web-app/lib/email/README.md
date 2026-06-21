# Email Service (Resend)

This module provides email functionality using the Resend API with branded templates and automatic retry logic.

## Configuration

Set the following environment variables in your `.env.local` file:

```env
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## Features

- **Branded Email Templates**: All emails use a consistent dark theme matching the platform's visual identity
- **Retry Logic**: Automatic retry with exponential backoff (up to 3 attempts)
- **Error Handling**: Comprehensive error logging and handling
- **Customizable Branding**: Uses platform configuration for colors and app name

## Available Functions

### `sendWelcomeEmail(email: string, name: string): Promise<void>`

Sends a welcome email to new users after account creation.

**Parameters:**
- `email`: Recipient's email address
- `name`: User's display name

**Example:**
```typescript
import { sendWelcomeEmail } from '@/lib/email/resend';

await sendWelcomeEmail('user@example.com', 'John Doe');
```

### `sendInvitationEmail(email: string, inviterName: string): Promise<void>`

Sends an invitation email to invite others to join the platform.

**Parameters:**
- `email`: Recipient's email address
- `inviterName`: Name of the person sending the invitation

**Example:**
```typescript
import { sendInvitationEmail } from '@/lib/email/resend';

await sendInvitationEmail('friend@example.com', 'John Doe');
```

### `sendSecurityNotification(email: string, event: string): Promise<void>`

Sends a security notification email for account-related events.

**Parameters:**
- `email`: Recipient's email address
- `event`: Security event type (see supported events below)

**Supported Events:**
- `password_changed`: Password was changed
- `email_changed`: Email address was updated
- `new_device_login`: Login from a new device detected
- `profile_created`: New profile was created
- `profile_deleted`: Profile was deleted

**Example:**
```typescript
import { sendSecurityNotification } from '@/lib/email/resend';

await sendSecurityNotification('user@example.com', 'password_changed');
```

## Email Template

All emails use a consistent branded template with:
- Dark theme (#141414 background, #181818 content area)
- Platform logo and brand color
- Responsive design
- Footer with links to Privacy Policy, Terms of Service, and Unsubscribe

## Error Handling

The email service implements automatic retry logic:
- **Max Retries**: 3 attempts
- **Backoff Strategy**: Exponential (1s, 2s, 4s)
- **Error Logging**: All failures are logged with details

If all retry attempts fail, the function throws an error with details about the failure.

## Usage in API Routes

```typescript
// app/api/email/welcome/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();
    
    await sendWelcomeEmail(email, name);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 502 }
    );
  }
}
```

## Testing

To test email functionality in development:

1. Sign up for a free Resend account at https://resend.com
2. Get your API key from the dashboard
3. Add the API key to your `.env.local` file
4. Use the test API routes to send emails

## Requirements Validation

This implementation satisfies the following requirements:
- **33.1**: Resend integration for all email functionality
- **33.2**: Email service module with Resend API client
- **33.6**: Welcome email template
- **33.7**: Invitation email template
- **33.8**: Security notification email template
- **Error Handling**: Retry logic with up to 3 attempts and exponential backoff
