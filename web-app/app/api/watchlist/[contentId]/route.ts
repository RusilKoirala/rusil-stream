import { NextRequest } from 'next/server';
import { validateApiAuth, createErrorResponse } from '@/lib/auth';
import { getDatabase, WatchlistItem } from '@/lib/db';

/**
 * Watchlist Item API Routes
 * 
 * DELETE /api/watchlist/:contentId - Remove item from watchlist
 */

/**
 * DELETE /api/watchlist/:contentId?profileId={profileId}
 * Remove an item from the watchlist
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
    const watchlistCollection = db.collection<WatchlistItem>('watchlists');

    // Delete the watchlist item
    const result = await watchlistCollection.deleteOne({
      profileId,
      contentId: contentIdNum,
    });

    if (result.deletedCount === 0) {
      return createErrorResponse(
        'NOT_FOUND',
        'Watchlist item not found',
        404
      );
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to remove from watchlist',
      500
    );
  }
}
