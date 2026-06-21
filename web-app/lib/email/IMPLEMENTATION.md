# Email Service Implementation

This document describes the implementation of the Resend email service integration for the streaming platform.

## Overview

The email service provides branded transactional emails with automatic retry logic and comprehensive error handling. It integrates with the Resend API to send welcome emails, invitation emails, and security notifications.

## Architecture

```
lib/email/
├── resend.ts           # Core email service with Resend integration
├── index.ts            # Public API exports
├── README.md           # Service documentation
├── USAGE.md            # Usage guide and examples
└── IMPLEMENTATION.md   # This file
```

## Implementation Details

### Core Components

#### 1. Resend Client Initialization

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
```

The Resend client is initialized once at module load time using the API key from environment variables.

#### 2. Retry Logic

The `sendEmailWithRetry` function implements exponential backoff retry logic:

- **Max Retries**: 3 attempts
- **Initial Delay**: 1000ms
- **Backoff Strategy**: Exponential (1s → 2s → 4s)
- **Error Logging**: Each attempt is logged with details

```typescript
async function sendEmailWithRetry(params: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<{ id: string }>
```

**Retry Flow:**
1. Attempt to send email
2. If successful, return email ID
3. If failed and retries remaining, wait with exponential backoff
4. Retry up to MAX_RETRIES times
5. If all retries fail, throw error with details

#### 3. Email Template System

The `getEmailTemplate` function wraps email content in a branded HTML template:

**Features:**
- Dark theme matching platform design (#141414 background)
- Responsive layout (max-width: 600px)
- Platform branding (logo, colors from config)
- Consistent typography and spacing
- Footer with legal links

**Template Structure:**
```html
<!DOCTYPE html>
<html>
  <head>
    <style>/* Dark theme styles */</style>
  </head>
  <body>
    <div class="container">
      <div class="header"><!-- Logo --></div>
      <div class="content"><!-- Email content --></div>
      <div class="footer"><!-- Legal links --></div>
    </div>
  </body>
</html>
```

#### 4. Email Functions

Three main email functions are exported:

**a) Welcome Email**
```typescript
sendWelcomeEmail(email: string, name: string): Promise<void>
```
- Sent after user registration
- Includes personalized greeting
- Call-to-action button to get started
- Requirements: 33.3, 33.6

**b) Invitation Email**
```typescript
sendInvitationEmail(email: string, inviterName: string): Promise<void>
```
- Sent when users invite others
- Includes inviter's name
- Call-to-action button to sign up
- Requirements: 33.4, 33.7

**c) Security Notification**
```typescript
sendSecurityNotification(email: string, event: string): Promise<void>
```
- Sent for security-related events
- Supports multiple event types
- Includes event details and timestamp
- Call-to-action button to review settings
- Requirements: 33.5, 33.8

### Error Handling Strategy

#### 1. Retry Logic
- Automatic retry with exponential backoff
- Logs each attempt with details
- Throws error only after all retries exhausted

#### 2. Error Logging
```typescript
console.error(`Email send attempt ${attempt} failed:`, {
  to,
  subject,
  error: lastError.message,
});
```

#### 3. Error Propagation
- Errors are thrown to caller after retries
- Caller decides whether to fail operation or continue
- Recommended: Log error but don't fail main operation

### Configuration

#### Environment Variables

Required:
- `RESEND_API_KEY`: Resend API key
- `RESEND_FROM_EMAIL`: Sender email address

Optional (used in templates):
- `NEXT_PUBLIC_APP_NAME`: Platform name (default: "Streaming Platform")
- `NEXT_PUBLIC_BRAND_COLOR`: Brand color (default: "#E50914")
- `AUTH0_BASE_URL`: Base URL for links (default: "http://localhost:3000")

#### Platform Configuration

The email service uses `lib/config.ts` for branding:
```typescript
import { config } from '../config';

const appName = config.appName;
const brandColor = config.brandColor;
```

## Testing

### Test API Route

A test route is provided at `/api/email-test`:

```bash
# Test welcome email
curl -X POST http://localhost:3000/api/email-test \
  -H "Content-Type: application/json" \
  -d '{"type":"welcome","email":"test@example.com","name":"Test User"}'

# Test invitation email
curl -X POST http://localhost:3000/api/email-test \
  -H "Content-Type: application/json" \
  -d '{"type":"invitation","email":"test@example.com","inviterName":"John"}'

# Test security notification
curl -X POST http://localhost:3000/api/email-test \
  -H "Content-Type: application/json" \
  -d '{"type":"security","email":"test@example.com","event":"password_changed"}'
```

### Manual Testing

1. Start the development server: `npm run dev`
2. Use the test API route to send emails
3. Check your email inbox for the test emails
4. Verify branding and formatting

### Integration Testing

The email service can be tested in integration with other features:
- User registration flow
- Password reset flow
- Profile management
- Account settings

## Requirements Validation

This implementation satisfies the following requirements from the specification:

### Requirement 33: Email Service Integration

- **33.1**: ✅ Resend integration for all email functionality
- **33.2**: ✅ Email service module with Resend API client
- **33.3**: ✅ Welcome email function
- **33.4**: ✅ Invitation email function
- **33.5**: ✅ Security notification function
- **33.6**: ✅ Branded welcome email template
- **33.7**: ✅ Branded invitation email template
- **33.8**: ✅ Branded security notification template

### Error Handling Requirements

- ✅ Retry logic with up to 3 attempts
- ✅ Exponential backoff (1s, 2s, 4s)
- ✅ Comprehensive error logging
- ✅ Error propagation to caller

### Design Requirements

- ✅ Dark theme matching platform (#141414, #181818)
- ✅ Platform branding (logo, colors)
- ✅ Responsive email layout
- ✅ Consistent typography
- ✅ Call-to-action buttons with brand color

## Performance Considerations

### 1. Non-Blocking Sends

For non-critical emails, use fire-and-forget pattern:
```typescript
sendWelcomeEmail(email, name).catch(error => {
  console.error('Email failed:', error);
});
```

### 2. Retry Delays

Exponential backoff prevents overwhelming the Resend API:
- Attempt 1: Immediate
- Attempt 2: 1s delay
- Attempt 3: 2s delay
- Attempt 4: 4s delay

### 3. Connection Pooling

The Resend SDK handles connection pooling internally.

## Security Considerations

### 1. API Key Protection

- Never commit API keys to version control
- Use environment variables
- Rotate keys periodically

### 2. Email Validation

- Validate email addresses before sending
- Sanitize user input in email content
- Use parameterized templates

### 3. Rate Limiting

- Resend has rate limits
- Implement queuing for bulk emails
- Monitor usage in Resend dashboard

## Monitoring and Observability

### Logging

All email operations are logged:
```typescript
console.error(`Email send attempt ${attempt} failed:`, {
  to,
  subject,
  error: lastError.message,
});
```

### Metrics to Track

- Email send success rate
- Retry attempts per email
- Average send time
- Failure reasons

### Alerts

Set up alerts for:
- High failure rate (>10%)
- API key expiration
- Rate limit approaching

## Future Enhancements

### 1. Email Queue

Implement a queue for bulk emails:
- Use Redis or database queue
- Process emails in background
- Retry failed emails

### 2. Email Templates

Add more email types:
- Password reset
- Email verification
- Subscription updates
- Content recommendations

### 3. Email Preferences

Allow users to manage email preferences:
- Opt-in/opt-out for different email types
- Frequency preferences
- Unsubscribe functionality

### 4. Email Analytics

Track email engagement:
- Open rates
- Click-through rates
- Bounce rates
- Unsubscribe rates

## Troubleshooting

### Common Issues

**1. Email not sending**
- Check RESEND_API_KEY is set
- Verify API key is valid
- Check application logs

**2. Emails going to spam**
- Verify domain in Resend
- Set up SPF/DKIM/DMARC
- Use professional from address

**3. Retry logic not working**
- Check error logging
- Verify network connectivity
- Ensure errors are thrown correctly

### Debug Mode

Enable debug logging:
```typescript
console.log('Sending email:', { to, subject });
```

## References

- [Resend Documentation](https://resend.com/docs)
- [Resend Node.js SDK](https://github.com/resendlabs/resend-node)
- [Email Best Practices](https://resend.com/docs/best-practices)
- [CAN-SPAM Compliance](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)

## Changelog

### Version 1.0.0 (Initial Implementation)

- ✅ Resend SDK integration
- ✅ Welcome email template
- ✅ Invitation email template
- ✅ Security notification template
- ✅ Retry logic with exponential backoff
- ✅ Branded email templates
- ✅ Error handling and logging
- ✅ Test API route
- ✅ Documentation
