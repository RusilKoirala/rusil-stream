import { NextRequest } from 'next/server';
import { validateApiAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { getDatabase, WatchProgress } from '@/lib/db';

/**
 * Watch Progress Clear API Route
 *
 * DELETE /api/watch-progress/clear?profileId={profileId}
 * Remove all watch history (continue watching) entries for a profile.
 */
export async function DELETE(request: NextRequest) {
  // Validate authentication
  const { error } = await validateApiAuth();
  if (error) return error;

  try {
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

    const result = await watchHistoryCollection.deleteMany({ profileId });

    return createSuccessResponse({ deleted: result.deletedCount });
  } catch (error) {
    console.error('Error clearing watch progress:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to clear watch progress',
      500
    );
  }
}
