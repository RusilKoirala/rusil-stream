import { NextRequest, NextResponse } from 'next/server';
import { getRecommendations } from '@/lib/tmdb/service';

/**
 * GET /api/content/:id/recommendations
 * 
 * Fetches recommended content based on a specific title from TMDB API
 * 
 * Path Parameters:
 * - id: Content ID (number)
 * 
 * Query Parameters:
 * - type: 'movie' | 'tv' (required)
 * 
 * Requirements: 3.9, 11.16
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'movie' | 'tv' | null;
    const contentId = parseInt(id, 10);

    // Validate contentId parameter
    if (isNaN(contentId) || contentId <= 0) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'id must be a positive integer',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate type parameter
    if (!type) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'type parameter is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (type !== 'movie' && type !== 'tv') {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'type must be either "movie" or "tv"',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const recommendations = await getRecommendations(contentId, type);

    return NextResponse.json(recommendations, { status: 200 });
  } catch (error) {
    console.error('Error fetching recommendations:', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch recommendations',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
