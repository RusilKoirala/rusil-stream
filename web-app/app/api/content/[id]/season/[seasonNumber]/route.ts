import { NextRequest, NextResponse } from 'next/server';
import { getSeasonDetails } from '@/lib/tmdb/service';

/**
 * GET /api/content/:id/season/:seasonNumber
 * 
 * Fetches season details including episodes from TMDB API
 * 
 * Path Parameters:
 * - id: TV show ID (number)
 * - seasonNumber: Season number (number)
 * 
 * Requirements: 3.10, 11.12, 11.13, 11.14
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; seasonNumber: string }> }
) {
  try {
    const { id, seasonNumber: seasonNumberStr } = await params;
    const tvId = parseInt(id, 10);
    const seasonNumber = parseInt(seasonNumberStr, 10);

    // Validate tvId parameter
    if (isNaN(tvId) || tvId <= 0) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'id must be a positive integer',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate seasonNumber parameter
    if (isNaN(seasonNumber) || seasonNumber < 0) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'seasonNumber must be a non-negative integer',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const season = await getSeasonDetails(tvId, seasonNumber);

    return NextResponse.json(season, { status: 200 });
  } catch (error) {
    console.error('Error fetching season details:', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch season details',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
