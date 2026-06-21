import { NextRequest, NextResponse } from 'next/server';
import { tmdbRequest } from '@/lib/tmdb/client';
import { getOptimizedImageUrl } from '@/lib/tmdb/images';

interface TMDBWatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

interface TMDBWatchProviderResponse {
  results: TMDBWatchProvider[];
}

interface WatchProvider {
  id: number;
  name: string;
  logoPath: string | null;
  priority: number;
}

/**
 * GET /api/content/providers
 *
 * Query Parameters:
 * - type: 'movie' | 'tv' (optional, defaults to 'movie')
 * - region: ISO region code (optional, defaults to 'US')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = (searchParams.get('type') as 'movie' | 'tv' | null) || 'movie';
    const region = (searchParams.get('region') || 'US').toUpperCase();

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

    const response = await tmdbRequest<TMDBWatchProviderResponse>({
      endpoint: `/watch/providers/${type}`,
      params: { watch_region: region },
    });

    const providers: WatchProvider[] = response.results
      .filter((provider) => Boolean(provider.logo_path))
      .sort((a, b) => a.display_priority - b.display_priority)
      .slice(0, 12)
      .map((provider) => ({
        id: provider.provider_id,
        name: provider.provider_name,
        logoPath: getOptimizedImageUrl(provider.logo_path, 300),
        priority: provider.display_priority,
      }));

    return NextResponse.json(providers, { status: 200 });
  } catch (error) {
    console.error('Error fetching watch providers:', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch watch providers',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
