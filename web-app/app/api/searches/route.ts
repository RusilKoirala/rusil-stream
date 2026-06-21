import { NextRequest } from 'next/server';
import { validateApiAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { getDatabase, RecentSearch } from '@/lib/db';
import { z } from 'zod';

/**
 * Recent Searches API Routes
 * 
 * GET /api/searches - Get recent searches for a profile
 * POST /api/searches - Add a recent search
 */

// Validation schema for adding recent search
const addRecentSearchSchema = z.object({
  profileId: z.string().min(1),
  query: z.string().min(1),
});

/**
 * GET /api/searches?profileId={profileId}
 * Get recent searches for a profile (limit 10, sorted by timestamp descending)
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
    const recentSearchesCollection = db.collection<RecentSearch>('recentSearches');

    // Query recent searches by profileId, limit to 10, sorted by most recent
    const recentSearches = await recentSearchesCollection
      .find({ profileId })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    // Return array of query strings
    const queries = recentSearches.map(search => search.query);

    return createSuccessResponse(queries);
  } catch (error) {
    console.error('Error fetching recent searches:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch recent searches',
      500
    );
  }
}

/**
 * POST /api/searches
 * Add or update a recent search (upsert)
 */
export async function POST(request: NextRequest) {
  // Validate authentication
  const { error } = await validateApiAuth();
  if (error) return error;

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = addRecentSearchSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid search data',
        400,
        validationResult.error.issues
      );
    }

    const { profileId, query } = validationResult.data;

    const db = await getDatabase();
    const recentSearchesCollection = db.collection<RecentSearch>('recentSearches');

    // Upsert recent search (update timestamp if exists, insert if not)
    await recentSearchesCollection.updateOne(
      {
        profileId,
        query,
      },
      {
        $set: {
          profileId,
          query,
          timestamp: new Date(),
        },
      },
      { upsert: true }
    );

    return createSuccessResponse({ message: 'Recent search added' }, 201);
  } catch (error) {
    console.error('Error adding recent search:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to add recent search',
      500
    );
  }
}
