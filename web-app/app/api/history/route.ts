import { NextRequest } from 'next/server';
import { validateApiAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { getDatabase, WatchProgress } from '@/lib/db';

/**
 * History API Routes
 * 
 * GET /api/history - Get viewing history for a profile
 */

/**
 * GET /api/history?profileId={profileId}
 * Get all viewing history for a profile
 */
export async function GET(request: NextRequest) {
  // Validate authentication
  const { error } = await validateApiAuth();
  if (error) return error;

  try {
    // Get profileId from query parameters
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'profileId query parameter is required',
        400
      );
    }

    const db = await getDatabase();
    const watchHistoryCollection = db.collection<WatchProgress>('watchHistory');

    // Query all watch history by profileId, sorted by most recent
    const historyItems = await watchHistoryCollection
      .find({ profileId })
      .sort({ lastWatchedAt: -1 })
      .toArray();

    return createSuccessResponse(historyItems);
  } catch (error) {
    console.error('Error fetching history:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch history',
      500
    );
  }
}
