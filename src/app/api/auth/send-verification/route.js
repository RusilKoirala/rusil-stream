// Send verification email API
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import connectDB from '../../../../../lib/db';
import User from '../../../../../models/User';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store pending user data temporarily (we'll create user after verification)
    // For now, store in a temporary collection or use the same User model with emailVerified: false
    const { hashPassword } = await import('../../../../../lib/auth');
    const passwordHash = await hashPassword(password);

    if (existingUser && !existingUser.emailVerified) {
      // Update existing unverified user
      existingUser.verificationToken = verificationToken;
      existingUser.verificationTokenExpiry = verificationTokenExpiry;
      existingUser.passwordHash = passwordHash;
      existingUser.profiles = [{ name, avatarUrl: '', preferences: {} }];
      await existingUser.save();
    } else {
      // Create new unverified user
      await User.create({
        email: email.toLowerCase(),
        passwordHash,
        profiles: [{ name, avatarUrl: '', preferences: {} }],
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry
      });
    }

    // Send verification email
    // Auto-detect the base URL based on environment
    let baseUrl = 'https://rusil-stream.vercel.app'
    
    if (!baseUrl) {
      // Auto-detect based on headers if not set
      const host = request.headers.get('host');
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      baseUrl = `${protocol}://${host}`;
    }
    
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    console.log('Sending verification email to:', email);
    console.log('Verification URL:', verificationUrl);

    // Use verified domain email or fallback to onboarding@resend.dev
    const fromEmail = process.env.RESEND_FROM_EMAIL 
      ? `Rusil Stream <${process.env.RESEND_FROM_EMAIL}>`
      : 'Rusil Stream <onboarding@resend.dev>';

    console.log('Sending from:', fromEmail);

    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Verify your email - Rusil Stream',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center;">
                        <h1 style="margin: 0; color : rgba(53, 230, 253, 1); font-size: 36px; font-weight: 900; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                          RUSIL STREAM
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 20px 40px;">
                        <h2 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 16px;">
                          Welcome, ${name}! 👋
                        </h2>
                        <p style="color: #9ca3af; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                          Thanks for signing up for Rusil Stream! We're excited to have you on board. To get started, please verify your email address by clicking the button below.
                        </p>
                        
                        <!-- Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 20px 0;">
                              <a href="${verificationUrl}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 12px; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);">
                                Verify Email Address
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
                          Or copy and paste this link into your browser:
                        </p>
                        <p style="color: #3b82f6; font-size: 14px; word-break: break-all; margin: 8px 0 0;">
                          ${verificationUrl}
                        </p>
                        
                        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                            ⏱️ This link will expire in <strong style="color: #9ca3af;">15 minutes</strong>.
                          </p>
                          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 12px 0 0;">
                            If you didn't create an account with Rusil Stream, you can safely ignore this email.
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 32px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                        <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">
                          Made with ❤️ by <a href="https://rusilkoirala.com.np" style="color: #3b82f6; text-decoration: none;">Rusil Koirala</a>
                        </p>
                        <p style="color: #4b5563; font-size: 11px; margin: 0;">
                          Educational streaming platform • For learning purposes only
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `
    });

    if (emailError) {
      console.error('❌ Resend API Error:', emailError);
      return NextResponse.json({
        error: 'Failed to send verification email',
        details: process.env.NODE_ENV === 'development' ? emailError : undefined
      }, { status: 500 });
    }


    return NextResponse.json({
      success: true,
      message: 'Verification email sent. Please check your inbox and spam folder.',
      debug: process.env.NODE_ENV === 'development' ? {
        emailId: emailResult?.id,
        verificationUrl
      } : undefined
    });
  } catch (error) {
    console.error('Send verification error:', error);
    console.error('Error details:', error.message);
    
    // Return more detailed error in development
    return NextResponse.json(
      { 
        error: 'Failed to send verification email',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
