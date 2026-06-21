# Email Service Testing Guide

This guide provides instructions for testing the Resend email service integration.

## Prerequisites

1. **Resend Account**: Sign up at https://resend.com
2. **API Key**: Get your API key from the Resend dashboard
3. **Environment Variables**: Set in `.env.local`:
   ```env
   RESEND_API_KEY=your_api_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

## Testing Methods

### Method 1: Using the Test API Route

The platform includes a dedicated test route at `/api/email-test`.

#### Start the Development Server

```bash
cd web-app
npm run dev
```

#### Test Welcome Email

```bash
curl -X POST http://localhost:3000/api/email-test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "email": "your-email@example.com",
    "name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Welcome email sent to your-email@example.com",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
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
    "email": "your-email@example.com",
    "event": "password_changed"
  }'
```

**Available Security Events:**
- `password_changed`
- `email_changed`
- `new_device_login`
- `profile_created`
- `profile_deleted`

### Method 2: Using Browser/Postman

1. Open your browser or Postman
2. Navigate to `http://localhost:3000/api/email-test`
3. Send a POST request with the appropriate JSON body

### Method 3: Direct Function Testing

Create a test script:

```typescript
// scripts/test-email.ts
import { sendWelcomeEmail } from '../lib/email';

async function test() {
  try {
    await sendWelcomeEmail('test@example.com', 'Test User');
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Email failed:', error);
  }
}

test();
```

Run with:
```bash
npx tsx scripts/test-email.ts
```

## Verification Checklist

After sending test emails, verify:

- [ ] Email received in inbox (check spam folder too)
- [ ] Subject line is correct
- [ ] Sender email matches `RESEND_FROM_EMAIL`
- [ ] Email content displays correctly
- [ ] Dark theme styling is applied
- [ ] Brand color is correct
- [ ] Platform name is correct
- [ ] Links work correctly
- [ ] Responsive design works on mobile
- [ ] No broken images or formatting issues

## Testing Retry Logic

To test the retry logic, you can temporarily use an invalid API key:

1. Set `RESEND_API_KEY=invalid_key` in `.env.local`
2. Send a test email
3. Check logs for retry attempts:
   ```
   Email send attempt 1 failed: ...
   Retrying in 1000ms...
   Email send attempt 2 failed: ...
   Retrying in 2000ms...
   Email send attempt 3 failed: ...
   Failed to send email after 3 attempts: ...
   ```
4. Restore the correct API key

## Testing Error Handling

### Test Invalid Email Type

```bash
curl -X POST http://localhost:3000/api/email-test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invalid",
    "email": "test@example.com"
  }'
```

**Expected Response:**
```json
{
  "error": "Invalid email type. Must be: welcome, invitation, or security"
}
```

### Test Missing Required Fields

```bash
curl -X POST http://localhost:3000/api/email-test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "email": "test@example.com"
  }'
```

**Expected Response:**
```json
{
  "error": "Missing required field: name"
}
```

## Performance Testing

### Test Retry Timing

Send an email and measure the time taken:

```bash
time curl -X POST http://localhost:3000/api/email-test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "email": "test@example.com",
    "name": "Test User"
  }'
```

**Expected:**
- Successful send: < 2 seconds
- With retries: 1s + 2s + 4s = ~7 seconds

### Test Concurrent Sends

Send multiple emails simultaneously:

```bash
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/email-test \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"welcome\",\"email\":\"test$i@example.com\",\"name\":\"User $i\"}" &
done
wait
```

## Integration Testing

### Test with User Registration Flow

1. Create a test registration endpoint
2. Call `sendWelcomeEmail` after successful registration
3. Verify email is sent
4. Verify registration succeeds even if email fails

### Test with Password Change Flow

1. Create a test password change endpoint
2. Call `sendSecurityNotification` after password change
3. Verify email is sent with correct event type

## Monitoring Test Results

### Check Application Logs

```bash
# Development
npm run dev

# Look for:
# - "Email send attempt X failed: ..."
# - "Retrying in Xms..."
# - Error messages
```

### Check Resend Dashboard

1. Log in to https://resend.com
2. Navigate to "Logs" section
3. Verify emails appear in the logs
4. Check delivery status
5. View any error messages

## Troubleshooting Test Failures

### Email Not Received

1. **Check spam folder**: Emails may be filtered
2. **Verify API key**: Ensure it's correct and active
3. **Check from email**: Must be verified in Resend
4. **Review logs**: Look for error messages
5. **Test with different email**: Try another address

### API Errors

1. **401 Unauthorized**: Invalid API key
2. **403 Forbidden**: Domain not verified
3. **429 Too Many Requests**: Rate limit exceeded
4. **500 Internal Server Error**: Resend service issue

### Template Issues

1. **Broken styling**: Check CSS in template
2. **Missing images**: Verify image URLs
3. **Incorrect colors**: Check config values
4. **Wrong links**: Verify base URL

## Test Coverage

The email service should be tested for:

- ✅ Successful email delivery
- ✅ Retry logic on failure
- ✅ Error handling and logging
- ✅ Template rendering
- ✅ Branding customization
- ✅ Input validation
- ✅ Concurrent sends
- ✅ Integration with other features

## Automated Testing

Consider adding automated tests:

```typescript
// __tests__/email.test.ts
import { sendWelcomeEmail } from '@/lib/email';

describe('Email Service', () => {
  it('should send welcome email', async () => {
    await expect(
      sendWelcomeEmail('test@example.com', 'Test User')
    ).resolves.not.toThrow();
  });

  it('should retry on failure', async () => {
    // Mock Resend to fail twice then succeed
    // Verify retry logic works
  });

  it('should throw after max retries', async () => {
    // Mock Resend to always fail
    // Verify error is thrown after 3 attempts
  });
});
```

## Production Testing

Before deploying to production:

1. Test with production API key
2. Verify domain is verified in Resend
3. Test all email types
4. Verify SPF/DKIM/DMARC records
5. Test unsubscribe links
6. Verify compliance with CAN-SPAM
7. Load test with expected volume

## Test Checklist

- [ ] Welcome email sends successfully
- [ ] Invitation email sends successfully
- [ ] Security notification sends successfully
- [ ] All security event types work
- [ ] Retry logic works correctly
- [ ] Error handling works correctly
- [ ] Email templates render correctly
- [ ] Branding is applied correctly
- [ ] Links work correctly
- [ ] Emails don't go to spam
- [ ] Performance is acceptable
- [ ] Concurrent sends work
- [ ] Integration with other features works
- [ ] Production configuration tested

## Next Steps

After testing:

1. Remove test API route in production (or protect it)
2. Set up monitoring and alerts
3. Configure email preferences
4. Implement unsubscribe functionality
5. Add email analytics
6. Document any issues found
