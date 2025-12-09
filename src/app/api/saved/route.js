// Saved list (favorites/watchlist) API routes
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import SavedList from '../../../../models/SavedList';
import { getAuthUser } from '../../../../lib/auth';

// Get saved list for a profile
export async function GET(request) {
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
    const saved = await SavedList.find({
      userId: authUser.userId,
      profileId
    }).sort({ addedAt: -1 });

    return NextResponse.json({ saved });
  } catch (error) {
    console.error('Get saved list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add to saved list
export async function POST(request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { profileId, movieId, movieTitle, posterPath } = await request.json();
    
    if (!profileId || !movieId) {
      return NextResponse.json({ error: 'Profile ID and movie ID are required' }, { status: 400 });
    }

    await connectDB();

    const saved = await SavedList.findOneAndUpdate(
      {
        userId: authUser.userId,
        profileId,
        movieId
      },
      {
        $set: {
          movieTitle,
          posterPath,
          addedAt: new Date()
        }
      },
      {
        upsert: true,
        new: true
      }
    );

    return NextResponse.json({ success: true, saved });
  } catch (error) {
    console.error('Add to saved list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Remove from saved list
export async function DELETE(request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const movieId = searchParams.get('movieId');
    
    if (!profileId || !movieId) {
      return NextResponse.json({ error: 'Profile ID and movie ID are required' }, { status: 400 });
    }

    await connectDB();

    await SavedList.deleteOne({
      userId: authUser.userId,
      profileId,
      movieId: parseInt(movieId)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove from saved list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
