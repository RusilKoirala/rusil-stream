import { NextRequest, NextResponse } from 'next/server';
import { getTrending } from '@/lib/tmdb/service';
import { fetchBackdropsForItems } from '@/lib/tmdb/logo-fetcher';

/**
 * GET /api/content/trending
 * 
 * Fetches trending content from TMDB API with English backdrops (with logos)
 * 
 * Query Parameters:
 * - timeWindow: 'day' | 'week' (optional, defaults to 'day')
 * 
 * Requirements: 3.2, 4.2
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeWindow = searchParams.get('timeWindow') as 'day' | 'week' | null;
    const providerParam = searchParams.get('provider');
    const region = (searchParams.get('region') || 'US').toUpperCase();

    // Validate timeWindow parameter
    if (timeWindow && timeWindow !== 'day' && timeWindow !== 'week') {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'timeWindow must be either "day" or "week"',
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

    const content = await getTrending(timeWindow || 'day', {
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
    console.error('Error fetching trending content:', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch trending content',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
