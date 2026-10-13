import { NextRequest, NextResponse } from 'next/server';
import { getTopRated } from '@/lib/tmdb/service';
import { fetchBackdropsForItems } from '@/lib/tmdb/logo-fetcher';

/**
 * GET /api/content/top-rated
 * 
 * Fetches top-rated content from TMDB API with English backdrops (with logos)
 * 
 * Query Parameters:
 * - type: 'movie' | 'tv' (required)
 * 
 * Requirements: 3.4
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'movie' | 'tv' | null;
    const providerParam = searchParams.get('provider');
    const region = (searchParams.get('region') || 'US').toUpperCase();

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

    let providerId: number | undefined;
    if (providerParam) {
      providerId = Number(providerParam);
      if (!Number.isInteger(providerId) || providerId <= 0) {
        return NextResponse.json(
          {
            error: 'VALIDATION_ERROR',
            message: 'provider must be a positive integer',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    }

    const content = await getTopRated(type, {
      providerId,
      region,
    });

    // Fetch English backdrops with logos for first 20 items
    const itemsToEnhance = content.slice(0, 20);
    const backdrops = await fetchBackdropsForItems(
      itemsToEnhance.map(item => ({ id: item.id, mediaType: item.type }))
    );

    // Expose the logo-bearing backdrop separately so plain backdropPath stays
    // title-free for hero / detail backgrounds.
    const enhancedContent = content.map((item, index) => {
      if (index < itemsToEnhance.length && backdrops[index]) {
        return { ...item, logoBackdropPath: backdrops[index] };
      }
      return item;
    });

    return NextResponse.json(enhancedContent, { status: 200 });
  } catch (error) {
    console.error('Error fetching top-rated content:', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch top-rated content',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
