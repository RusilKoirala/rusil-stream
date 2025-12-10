// Admin API to view pending verifications (development only)
import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/db';
import User from '../../../../../models/User';

export async function GET(request) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    await connectDB();

    const pendingUsers = await User.find({
      emailVerified: false,
      verificationToken: { $exists: true }
    }).select('email verificationToken verificationTokenExpiry createdAt');

    // Auto-detect the base URL based on environment
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    if (!baseUrl) {
      // Auto-detect based on headers if not set
      const host = request.headers.get('host');
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      baseUrl = `${protocol}://${host}`;
    }

    const verifications = pendingUsers.map(user => ({
      email: user.email,
      verificationUrl: `${baseUrl}/verify-email?token=${user.verificationToken}`,
      expiresAt: user.verificationTokenExpiry,
      createdAt: user.createdAt
    }));

    return NextResponse.json({
      count: verifications.length,
      verifications
    });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    return NextResponse.json({ error: 'Failed to fetch verifications' }, { status: 500 });
  }
}
