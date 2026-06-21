import { NextRequest } from 'next/server';
import { validateApiAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { getDatabase, WatchProgress } from '@/lib/db';
import { z } from 'zod';

/**
 * Watch Progress API Routes
 * 
 * GET /api/watch-progress - Get continue watching items for a profile
 * POST /api/watch-progress - Update watch progress for content
 */

// Validation schema for updating watch progress
const updateWatchProgressSchema = z.object({
  profileId: z.string().min(1),
  contentId: z.number().int().positive(),
  contentType: z.enum(['movie', 'tv']),
  episodeId: z.string().optional(),
  seasonNumber: z.number().int().positive().optional(),
  episodeNumber: z.number().int().positive().optional(),
  currentTime: z.number().min(0),
  duration: z.number().positive(),
  percentageWatched: z.number().min(0).max(100),
});

/**
 * GET /api/watch-progress?profileId={profileId}
 * Get continue watching items (items with percentageWatched < 95)
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

    // Query watch progress by profileId, filter for items < 95% watched
    const continueWatchingItems = await watchHistoryCollection
      .find({
        profileId,
        percentageWatched: { $lt: 95 },
      })
      .sort({ lastWatchedAt: -1 })
      .toArray();

    return createSuccessResponse(continueWatchingItems);
  } catch (error) {
    console.error('Error fetching watch progress:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch watch progress',
      500
    );
  }
}

/**
 * POST /api/watch-progress
 * Update watch progress for content (upsert)
 */
export async function POST(request: NextRequest) {
  // Validate authentication
  const { error } = await validateApiAuth();
  if (error) return error;

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateWatchProgressSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid watch progress data',
        400,
        validationResult.error.issues
      );
    }

    const {
      profileId,
      contentId,
      contentType,
      episodeId,
      seasonNumber,
      episodeNumber,
      currentTime,
      duration,
      percentageWatched,
    } = validationResult.data;

    const db = await getDatabase();
    const watchHistoryCollection = db.collection<WatchProgress>('watchHistory');

    // Build filter for upsert
    const filter: any = {
      profileId,
      contentId,
    };

    // For TV shows, include episode information in the filter
    if (contentType === 'tv' && episodeId) {
      filter.episodeId = episodeId;
    }

    // Upsert watch progress
    const updateDoc: Partial<WatchProgress> = {
      profileId,
      contentId,
      contentType,
      episodeId,
      seasonNumber,
      episodeNumber,
      currentTime,
      duration,
      percentageWatched,
      lastWatchedAt: new Date(),
    };

    await watchHistoryCollection.updateOne(
      filter,
      { $set: updateDoc },
      { upsert: true }
    );

    return createSuccessResponse({ message: 'Watch progress updated' });
  } catch (error) {
    console.error('Error updating watch progress:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to update watch progress',
      500
    );
  }
}
