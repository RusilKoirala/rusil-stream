import { NextRequest } from 'next/server';
import { validateApiAuth, createErrorResponse } from '@/lib/auth';
import { getDatabase, WatchProgress } from '@/lib/db';

/**
 * Watch Progress Item API Routes
 * 
 * DELETE /api/watch-progress/:contentId - Remove item from continue watching
 */

/**
 * DELETE /api/watch-progress/:contentId?profileId={profileId}
 * Remove an item from continue watching (delete watch progress)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  // Validate authentication
  const { error } = await validateApiAuth();
  if (error) return error;

  try {
    // Get contentId from route params
    const { contentId } = await params;
    const contentIdNum = parseInt(contentId, 10);

    if (isNaN(contentIdNum)) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid contentId',
        400
      );
    }

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

    // Delete all watch progress entries for this content and profile
    const result = await watchHistoryCollection.deleteMany({
      profileId,
      contentId: contentIdNum,
    });

    if (result.deletedCount === 0) {
      return createErrorResponse(
        'NOT_FOUND',
        'Watch progress not found',
        404
      );
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error removing watch progress:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to remove watch progress',
      500
    );
  }
}
