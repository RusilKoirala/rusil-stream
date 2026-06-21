import { NextRequest } from 'next/server';
import { validateApiAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { getDatabase, Rating } from '@/lib/db';
import { z } from 'zod';

/**
 * Ratings API Routes
 * 
 * GET /api/ratings - Get ratings for a profile
 * POST /api/ratings - Add or update rating for content
 */

// Validation schema for setting a rating
const setRatingSchema = z.object({
  profileId: z.string().min(1),
  contentId: z.string().min(1).transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()),
  rating: z.number().int().min(0).max(10),
  updatedAt: z.string().datetime().optional(),
});

/**
 * GET /api/ratings?profileId={profileId}
 * Get all ratings for a profile
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
    const ratingsCollection = db.collection<Rating>('ratings');

    // Query ratings by profileId
    const ratings = await ratingsCollection
      .find({ profileId })
      .sort({ updatedAt: -1 })
      .toArray();

    return createSuccessResponse(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch ratings',
      500
    );
  }
}

/**
 * POST /api/ratings
 * Set or update a rating for content
 */
export async function POST(request: NextRequest) {
  // Validate authentication
  const { error } = await validateApiAuth();
  if (error) return error;

  try {
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

    const ratingData = validationResult.data;

    const db = await getDatabase();
    const ratingsCollection = db.collection<Rating>('ratings');

    // Use upsert to create or update the rating
    const result = await ratingsCollection.updateOne(
      {
        profileId: ratingData.profileId,
        contentId: ratingData.contentId,
      },
      {
        $set: {
          rating: ratingData.rating,
          updatedAt: new Date(ratingData.updatedAt || new Date()),
        },
      },
      { upsert: true }
    );

    return createSuccessResponse(
      {
        success: true,
        modified: result.modifiedCount > 0,
        upserted: result.upsertedId !== null,
      },
      201
    );
  } catch (error) {
    console.error('Error setting rating:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to set rating',
      500
    );
  }
}
