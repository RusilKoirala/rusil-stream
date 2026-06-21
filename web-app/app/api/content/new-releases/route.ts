import { NextRequest, NextResponse } from 'next/server';
import { getNewReleases } from '@/lib/tmdb/service';

/**
 * GET /api/content/new-releases
 * 
 * Fetches new releases from TMDB API
 * 
 * Requirements: 3.5, 4.6
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const providerParam = searchParams.get('provider');
    const region = (searchParams.get('region') || 'US').toUpperCase();

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

    const content = await getNewReleases({
      providerId,
      region,
    });

    return NextResponse.json(content, { status: 200 });
  } catch (error) {
    console.error('Error fetching new releases:', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch new releases',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
