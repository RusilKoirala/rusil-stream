import { NextRequest } from 'next/server';
import { validateApiAuth, createErrorResponse } from '@/lib/auth';
import { getDatabase, WatchProgress } from '@/lib/db';
import { ObjectId } from 'mongodb';

/**
 * History Item API Routes
 * 
 * DELETE /api/history/:id - Remove item from viewing history
 */

/**
 * DELETE /api/history/:id
 * Remove a specific item from viewing history
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate authentication
  const { error } = await validateApiAuth();
  if (error) return error;

  try {
    // Get id from route params
    const { id } = await params;

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid history item id',
        400
      );
    }

    const db = await getDatabase();
    const watchHistoryCollection = db.collection<WatchProgress>('watchHistory');

    // Delete the history item by _id
    const result = await watchHistoryCollection.deleteOne({
      _id: new ObjectId(id) as any,
    });

    if (result.deletedCount === 0) {
      return createErrorResponse(
        'NOT_FOUND',
        'History item not found',
        404
      );
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error removing history item:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to remove history item',
      500
    );
  }
}
