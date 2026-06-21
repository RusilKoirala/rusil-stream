import { NextRequest } from 'next/server';
import { validateApiAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { getDatabase, WatchlistItem } from '@/lib/db';
import { getDetails } from '@/lib/tmdb/service';
import type { Content } from '@/lib/tmdb/types';
import { z } from 'zod';

/**
 * Watchlist API Routes
 * 
 * GET /api/watchlist - Get watchlist for a profile
 * POST /api/watchlist - Add item to watchlist
 */

// Validation schema for adding to watchlist
const addToWatchlistSchema = z.object({
  profileId: z.string().min(1),
  contentId: z.string().min(1).transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()),
  contentType: z.enum(['movie', 'tv']),
});

/**
 * GET /api/watchlist?profileId={profileId}
 * Get all watchlist items for a profile
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
    const watchlistCollection = db.collection<WatchlistItem>('watchlists');

    // Query watchlist by profileId
    const watchlistItems = await watchlistCollection
      .find({ profileId })
      .sort({ addedAt: -1 })
      .toArray();

    if (watchlistItems.length === 0) {
      return createSuccessResponse([]);
    }

    const hydratedResults = await Promise.allSettled(
      watchlistItems.map(async (item) => {
        const details = await getDetails(item.contentId, item.contentType);

        const content: Content = {
          id: details.id,
          type: details.type,
          title: details.title,
          posterPath: details.posterPath,
          backdropPath: details.backdropPath,
          overview: details.overview,
          releaseDate: details.releaseDate,
          voteAverage: details.voteAverage,
          genreIds: details.genreIds,
        };

        return content;
      })
    );

    const hydratedWatchlist = hydratedResults
      .filter((result): result is PromiseFulfilledResult<Content> => result.status === 'fulfilled')
      .map((result) => result.value);

    return createSuccessResponse(hydratedWatchlist);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch watchlist',
      500
    );
  }
}

/**
 * POST /api/watchlist
 * Add an item to the watchlist
 */
export async function POST(request: NextRequest) {
  // Validate authentication
  const { error } = await validateApiAuth();
  if (error) return error;

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = addToWatchlistSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid watchlist data',
        400,
        validationResult.error.issues
      );
    }

    const { profileId, contentId, contentType } = validationResult.data;

    const db = await getDatabase();
    const watchlistCollection = db.collection<WatchlistItem>('watchlists');

    // Check if item already exists in watchlist
    const existingItem = await watchlistCollection.findOne({
      profileId,
      contentId,
    });

    if (existingItem) {
      return createErrorResponse(
        'DUPLICATE_ENTRY',
        'Item already in watchlist',
        409
      );
    }

    // Create new watchlist item
    const newItem: WatchlistItem = {
      profileId,
      contentId,
      contentType,
      addedAt: new Date(),
    };

    // Insert into MongoDB
    await watchlistCollection.insertOne(newItem);

    return createSuccessResponse({ message: 'Added to watchlist' }, 201);
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to add to watchlist',
      500
    );
  }
}
