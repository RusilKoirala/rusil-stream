import { NextRequest } from 'next/server';
import { validateApiAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { getDatabase, Rating } from '@/lib/db';
import { z } from 'zod';

/**
 * Ratings API Routes
 * 
 * GET /api/ratings/:contentId - Get rating for content
 * PUT /api/ratings/:contentId - Set rating for content
 */

// Validation schema for setting rating
const setRatingSchema = z.object({
  profileId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  contentType: z.enum(['movie', 'tv']),
});

/**
 * GET /api/ratings/:contentId?profileId={profileId}
 * Get rating for a specific content item
 */
export async function GET(
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
    const ratingsCollection = db.collection<Rating>('ratings');

    // Find rating for this content and profile
    const ratingDoc = await ratingsCollection.findOne({
      profileId,
      contentId: contentIdNum,
    });

    // Return rating number or null if not found
    return createSuccessResponse({
      rating: ratingDoc ? ratingDoc.rating : null,
    });
  } catch (error) {
    console.error('Error fetching rating:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch rating',
      500
    );
  }
}

/**
 * PUT /api/ratings/:contentId
 * Set or update rating for content (upsert)
 */
export async function PUT(
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = setRatingSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid rating data',
        400,
        validationResult.error.issues
      );
    }

    const { profileId, rating, contentType } = validationResult.data;

    const db = await getDatabase();
    const ratingsCollection = db.collection<Rating>('ratings');

    // Upsert rating
    await ratingsCollection.updateOne(
      {
        profileId,
        contentId: contentIdNum,
      },
      {
        $set: {
          profileId,
          contentId: contentIdNum,
          contentType,
          rating,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return createSuccessResponse({ message: 'Rating updated' });
  } catch (error) {
    console.error('Error setting rating:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to set rating',
      500
    );
  }
}
