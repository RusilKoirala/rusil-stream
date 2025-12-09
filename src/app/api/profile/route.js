// Profile management API routes
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import { getAuthUser } from '../../../../lib/auth';

// Create new profile
export async function POST(request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { name, avatarUrl } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(authUser.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.profiles.length >= 5) {
      return NextResponse.json({ error: 'Maximum 5 profiles allowed' }, { status: 400 });
    }

    user.profiles.push({
      name,
      avatarUrl: avatarUrl || '',
      preferences: {}
    });

    await user.save();

    return NextResponse.json({
      success: true,
      profile: user.profiles[user.profiles.length - 1]
    });
  } catch (error) {
    console.error('Create profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update profile
export async function PUT(request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { profileId, name, avatarUrl, preferences } = await request.json();
    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(authUser.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = user.profiles.id(profileId);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (name) profile.name = name;
    if (avatarUrl !== undefined) profile.avatarUrl = avatarUrl;
    if (preferences) profile.preferences = { ...profile.preferences, ...preferences };

    await user.save();

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete profile
export async function DELETE(request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    
    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(authUser.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.profiles.length <= 1) {
      return NextResponse.json({ error: 'Cannot delete last profile' }, { status: 400 });
    }

    user.profiles = user.profiles.filter(p => p._id.toString() !== profileId);
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
