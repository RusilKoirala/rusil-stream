// Watch history API routes
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import WatchHistory from '../../../../models/WatchHistory';
import { getAuthUser } from '../../../../lib/auth';

// Get watch history for a profile
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
    const history = await WatchHistory.find({
      userId: authUser.userId,
      profileId
    }).sort({ lastPlayedAt: -1 }).limit(50);

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update or create watch history
export async function POST(request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { profileId, movieId, movieTitle, posterPath, lastPositionSec, durationSec } = await request.json();
    
    if (!profileId || !movieId) {
      return NextResponse.json({ error: 'Profile ID and movie ID are required' }, { status: 400 });
    }

    await connectDB();

    const watchedPercentage = durationSec > 0 ? (lastPositionSec / durationSec) * 100 : 0;
    const status = watchedPercentage >= 85 ? 'completed' : 'watching';

    const history = await WatchHistory.findOneAndUpdate(
      {
        userId: authUser.userId,
        profileId,
        movieId
      },
      {
        $set: {
          movieTitle,
          posterPath,
          lastPlayedAt: new Date(),
          lastPositionSec: lastPositionSec || 0,
          durationSec: durationSec || 0,
          watchedPercentage,
          status
        },
        $setOnInsert: {
          startedAt: new Date()
        }
      },
      {
        upsert: true,
        new: true
      }
    );

    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error('Update history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
