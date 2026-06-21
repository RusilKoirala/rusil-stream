/**
 * Resend Email Service
 * 
 * This module provides email functionality using the Resend API.
 * It includes retry logic and branded email templates.
 */

import { Resend } from 'resend';
import { config } from '../config';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@streamingplatform.com';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // Initial delay, will use exponential backoff

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Send email with retry logic
 */
async function sendEmailWithRetry(params: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<{ id: string }> {
  const { to, subject, html, from = FROM_EMAIL } = params;
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await resend.emails.send({
        from,
        to,
        subject,
        html,
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return { id: result.data?.id || 'unknown' };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      console.error(`Email send attempt ${attempt} failed:`, {
        to,
        subject,
        error: lastError.message,
      });
      
      // If this wasn't the last attempt, wait before retrying
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  
  // All retries failed
  throw new Error(`Failed to send email after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}

/**
 * Get branded email template wrapper
 */
function getEmailTemplate(content: string): string {
  const brandColor = config.brandColor;
  const appName = config.appName;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #141414;
      color: #ffffff;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: ${brandColor};
      text-decoration: none;
    }
    .content {
      background-color: #181818;
      border-radius: 8px;
      padding: 40px;
      margin-bottom: 30px;
    }
    h1 {
      font-size: 28px;
      font-weight: bold;
      margin: 0 0 20px 0;
      color: #ffffff;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 16px 0;
      color: #B3B3B3;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: ${brandColor};
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #737373;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .footer a {
      color: #B3B3B3;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">${appName}</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
      <p>
        <a href="#">Privacy Policy</a> | 
        <a href="#">Terms of Service</a> | 
        <a href="#">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<void> {
  const appName = config.appName;
  const brandColor = config.brandColor;
  
  const content = `
    <h1>Welcome to ${appName}!</h1>
    <p>Hi ${name},</p>
    <p>Thank you for joining ${appName}. We're excited to have you on board!</p>
    <p>You now have access to thousands of movies and TV shows. Start exploring and discover your next favorite content.</p>
    <a href="${process.env.AUTH0_BASE_URL || 'http://localhost:3000'}/profiles" class="button">Get Started</a>
    <p>If you have any questions, feel free to reach out to our support team.</p>
    <p>Happy streaming!</p>
  `;
  
  await sendEmailWithRetry({
    to: email,
    subject: `Welcome to ${appName}!`,
    html: getEmailTemplate(content),
  });
}

/**
 * Send invitation email to invite others to the platform
 */
export async function sendInvitationEmail(
  email: string,
  inviterName: string
): Promise<void> {
  const appName = config.appName;
  const brandColor = config.brandColor;
  
  const content = `
    <h1>You've been invited to ${appName}</h1>
    <p>Hi there,</p>
    <p>${inviterName} has invited you to join ${appName}, where you can watch thousands of movies and TV shows.</p>
    <p>Sign up today and start streaming your favorite content instantly.</p>
    <a href="${process.env.AUTH0_BASE_URL || 'http://localhost:3000'}/sign-up" class="button">Accept Invitation</a>
    <p>This invitation is personal and cannot be transferred to another person.</p>
  `;
  
  await sendEmailWithRetry({
    to: email,
    subject: `${inviterName} invited you to ${appName}`,
    html: getEmailTemplate(content),
  });
}

/**
 * Send security notification email
 */
export async function sendSecurityNotification(
  email: string,
  event: string
): Promise<void> {
  const appName = config.appName;
  
  const eventMessages: Record<string, { title: string; description: string }> = {
    'password_changed': {
      title: 'Password Changed',
      description: 'Your password was recently changed. If you did not make this change, please contact support immediately.',
    },
    'email_changed': {
      title: 'Email Address Changed',
      description: 'Your email address was recently updated. If you did not make this change, please contact support immediately.',
    },
    'new_device_login': {
      title: 'New Device Login',
      description: 'We detected a login from a new device. If this was you, you can ignore this message. Otherwise, please secure your account.',
    },
    'profile_created': {
      title: 'New Profile Created',
      description: 'A new profile was created on your account. If you did not create this profile, please review your account settings.',
    },
    'profile_deleted': {
      title: 'Profile Deleted',
      description: 'A profile was deleted from your account. If you did not delete this profile, please contact support.',
    },
  };
  
  const eventInfo = eventMessages[event] || {
    title: 'Security Alert',
    description: 'We detected activity on your account that requires your attention.',
  };
  
  const content = `
    <h1>${eventInfo.title}</h1>
    <p>Hi there,</p>
    <p>${eventInfo.description}</p>
    <p><strong>Event:</strong> ${event}</p>
    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    <a href="${process.env.AUTH0_BASE_URL || 'http://localhost:3000'}/settings" class="button">Review Account Settings</a>
    <p>If you have any concerns about your account security, please contact our support team immediately.</p>
  `;
  
  await sendEmailWithRetry({
    to: email,
    subject: `${appName} Security Alert: ${eventInfo.title}`,
    html: getEmailTemplate(content),
  });
}

/**
 * Export the Resend client for advanced usage
 */
export { resend };
