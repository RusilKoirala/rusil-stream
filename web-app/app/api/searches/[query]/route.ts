import { NextRequest } from 'next/server';
import { validateApiAuth, createErrorResponse } from '@/lib/auth';
import { getDatabase, RecentSearch } from '@/lib/db';

/**
 * Recent Search Item API Routes
 * 
 * DELETE /api/searches/:query - Remove a recent search
 */

/**
 * DELETE /api/searches/:query?profileId={profileId}
 * Remove a specific recent search
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ query: string }> }
) {
  // Validate authentication
  const { error } = await validateApiAuth();
  if (error) return error;

  try {
    // Get query from route params (URL decode it)
    const { query } = await params;
    const decodedQuery = decodeURIComponent(query);

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
    const recentSearchesCollection = db.collection<RecentSearch>('recentSearches');

    // Delete the recent search
    const result = await recentSearchesCollection.deleteOne({
      profileId,
      query: decodedQuery,
    });

    if (result.deletedCount === 0) {
      return createErrorResponse(
        'NOT_FOUND',
        'Recent search not found',
        404
      );
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error removing recent search:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to remove recent search',
      500
    );
  }
}
