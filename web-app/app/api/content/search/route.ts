import { NextRequest, NextResponse } from 'next/server';
import { search } from '@/lib/tmdb/service';
import type { SearchFilters } from '@/lib/tmdb/types';

/**
 * GET /api/content/search
 * 
 * Searches for content (movies, TV shows, people) from TMDB API
 * 
 * Query Parameters:
 * - query: Search query string (required)
 * - type: 'movie' | 'tv' | 'person' (optional)
 * - genres: Comma-separated genre IDs (optional)
 * - minYear: Minimum release year (optional)
 * - maxYear: Maximum release year (optional)
 * - minRating: Minimum rating (optional)
 * 
 * Requirements: 8.4, 8.5, 8.12
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || searchParams.get('q');

    // Validate query parameter
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'query parameter is required and cannot be empty',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Build filters object
    const filters: SearchFilters = {};

    // Type filter
    const type = searchParams.get('type');
    if (type) {
      if (type !== 'movie' && type !== 'tv' && type !== 'person') {
        return NextResponse.json(
          {
            error: 'VALIDATION_ERROR',
            message: 'type must be either "movie", "tv", or "person"',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      filters.type = type as 'movie' | 'tv' | 'person';
    }

    // Genre filter
    const genresParam = searchParams.get('genres');
    if (genresParam) {
      const genreIds = genresParam.split(',').map((id) => parseInt(id.trim(), 10));
      if (genreIds.some((id) => isNaN(id))) {
        return NextResponse.json(
          {
            error: 'VALIDATION_ERROR',
            message: 'genres must be comma-separated integers',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      filters.genres = genreIds;
    }

    // Year range filter
    const minYear = searchParams.get('minYear');
    const maxYear = searchParams.get('maxYear');
    if (minYear || maxYear) {
      const min = minYear ? parseInt(minYear, 10) : 1900;
      const max = maxYear ? parseInt(maxYear, 10) : new Date().getFullYear();

      if (isNaN(min) || isNaN(max)) {
        return NextResponse.json(
          {
            error: 'VALIDATION_ERROR',
            message: 'minYear and maxYear must be valid integers',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      if (min > max) {
        return NextResponse.json(
          {
            error: 'VALIDATION_ERROR',
            message: 'minYear cannot be greater than maxYear',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      filters.yearRange = { min, max };
    }

    // Rating filter
    const minRating = searchParams.get('minRating');
    if (minRating) {
      const rating = parseFloat(minRating);
      if (isNaN(rating) || rating < 0 || rating > 10) {
        return NextResponse.json(
          {
            error: 'VALIDATION_ERROR',
            message: 'minRating must be a number between 0 and 10',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      filters.minRating = rating;
    }

    const results = await search(query, filters);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error searching content:', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to search content',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
