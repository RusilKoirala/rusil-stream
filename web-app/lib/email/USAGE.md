# Email Service Usage Guide

This guide shows how to use the Resend email service in your application.

## Quick Start

### 1. Import the email functions

```typescript
import {
  sendWelcomeEmail,
  sendInvitationEmail,
  sendSecurityNotification,
} from '@/lib/email';
```

### 2. Send emails in your API routes

```typescript
// Example: Send welcome email after user registration
import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();
    
    // Send welcome email
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

## Testing the Email Service

### Using the Test API Route

The platform includes a test API route at `/api/email-test` for testing email functionality.

#### Test Welcome Email

```bash
curl -X POST http://localhost:3000/api/email-test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "email": "test@example.com",
    "name": "Test User"
  }'
```

#### Test Invitation Email

```bash
curl -X POST http://localhost:3000/api/email-test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invitation",
    "email": "friend@example.com",
    "inviterName": "John Doe"
  }'
```

#### Test Security Notification

```bash
curl -X POST http://localhost:3000/api/email-test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "security",
    "email": "user@example.com",
    "event": "password_changed"
  }'
```

### Available Security Events

- `password_changed`: Password was changed
- `email_changed`: Email address was updated
- `new_device_login`: Login from a new device detected
- `profile_created`: New profile was created
- `profile_deleted`: Profile was deleted

## Integration Examples

### Welcome Email on User Registration

```typescript
// app/api/auth/register/route.ts
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  // ... user registration logic ...
  
  // Send welcome email (non-blocking)
  sendWelcomeEmail(user.email, user.name).catch(error => {
    console.error('Failed to send welcome email:', error);
    // Don't fail the registration if email fails
  });
  
  return NextResponse.json({ success: true });
}
```

### Security Notification on Password Change

```typescript
// app/api/auth/change-password/route.ts
import { sendSecurityNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  // ... password change logic ...
  
  // Send security notification
  await sendSecurityNotification(user.email, 'password_changed');
  
  return NextResponse.json({ success: true });
}
```

### Invitation Email

```typescript
// app/api/invitations/route.ts
import { sendInvitationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const { email, inviterName } = await request.json();
  
  // Send invitation
  await sendInvitationEmail(email, inviterName);
  
  return NextResponse.json({ success: true });
}
```

## Error Handling

The email service automatically retries failed sends up to 3 times with exponential backoff. If all retries fail, it throws an error.

### Recommended Error Handling Pattern

```typescript
try {
  await sendWelcomeEmail(email, name);
  console.log('Email sent successfully');
} catch (error) {
  console.error('Failed to send email after retries:', error);
  // Log to monitoring service
  // Optionally queue for later retry
  // Don't fail the main operation
}
```

### Non-Blocking Email Sends

For non-critical emails, use fire-and-forget pattern:

```typescript
// Send email without waiting
sendWelcomeEmail(email, name).catch(error => {
  console.error('Email failed:', error);
});

// Continue with main logic
return NextResponse.json({ success: true });
```

## Email Template Customization

The email templates use the platform's branding configuration from `lib/config.ts`:

- **App Name**: `NEXT_PUBLIC_APP_NAME` environment variable
- **Brand Color**: `NEXT_PUBLIC_BRAND_COLOR` environment variable
- **Base URL**: `AUTH0_BASE_URL` or `APP_BASE_URL` environment variable

To customize the templates, edit the functions in `lib/email/resend.ts`.

## Monitoring and Logging

All email operations are logged with:
- Recipient email
- Email type
- Attempt number
- Success/failure status
- Error details (if failed)

Check your application logs for email-related issues:

```bash
# Development
npm run dev

# Look for logs like:
# "Email send attempt 1 failed: ..."
# "Retrying in 1000ms..."
```

## Production Considerations

1. **API Key Security**: Never commit your Resend API key to version control
2. **Rate Limiting**: Resend has rate limits; implement queuing for bulk emails
3. **Monitoring**: Set up alerts for email delivery failures
4. **Unsubscribe**: Implement unsubscribe functionality for marketing emails
5. **Compliance**: Ensure emails comply with CAN-SPAM and GDPR requirements

## Troubleshooting

### Email not sending

1. Check that `RESEND_API_KEY` is set in `.env.local`
2. Verify the API key is valid in your Resend dashboard
3. Check application logs for error messages
4. Ensure `RESEND_FROM_EMAIL` is a verified domain in Resend

### Emails going to spam

1. Verify your domain in Resend
2. Set up SPF, DKIM, and DMARC records
3. Use a professional "from" email address
4. Avoid spam trigger words in subject lines

### Retry logic not working

1. Check that errors are being thrown correctly
2. Verify exponential backoff delays in logs
3. Ensure network connectivity to Resend API

## Support

For issues with the Resend service itself, contact Resend support:
- Documentation: https://resend.com/docs
- Support: https://resend.com/support
