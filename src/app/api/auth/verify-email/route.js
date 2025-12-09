// Verify email API
import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/db';
import User from '../../../../../models/User';
import { setAuthCookie } from '../../../../../lib/auth';

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Mark email as verified
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // Set auth cookie and return JWT token
    const jwtToken = await setAuthCookie(user._id.toString(), user.email);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        profiles: user.profiles
      }
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
