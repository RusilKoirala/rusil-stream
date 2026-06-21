import { NextRequest, NextResponse } from 'next/server';
import { tmdbRequest } from '@/lib/tmdb/client';
import { getOptimizedImageUrl } from '@/lib/tmdb/images';

interface TMDBImageLogo {
  file_path: string;
  iso_639_1: string | null;
  vote_average: number;
  width: number;
}

interface TMDBImagesResponse {
  id: number;
  logos: TMDBImageLogo[];
}

interface LogoCacheEntry {
  logoPath: string | null;
  timestamp: number;
}

const logoCache = new Map<string, LogoCacheEntry>();
const LOGO_CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

/**
 * GET /api/content/logo?id=123&type=movie
 *
 * Returns the best TMDB title logo image for a movie/TV item.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const idParam = searchParams.get('id');
    const typeParam = searchParams.get('type');

    const contentId = Number(idParam);
    const type = typeParam === 'movie' || typeParam === 'tv' ? typeParam : null;

    if (!Number.isFinite(contentId) || contentId <= 0 || !type) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'id must be a positive number and type must be "movie" or "tv"',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const cacheKey = `${type}:${contentId}`;
    const cached = logoCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < LOGO_CACHE_TTL_MS) {
      return NextResponse.json(
        { logoPath: cached.logoPath },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          },
        }
      );
    }

    const response = await tmdbRequest<TMDBImagesResponse>({
      endpoint: `/${type}/${contentId}/images`,
      params: {
        include_image_language: 'en,null',
      },
    });

    const bestLogo = response.logos
      .filter((logo) => Boolean(logo.file_path))
      .sort((a, b) => {
        const aEnglishPriority = a.iso_639_1 === 'en' ? 1 : 0;
        const bEnglishPriority = b.iso_639_1 === 'en' ? 1 : 0;

        if (aEnglishPriority !== bEnglishPriority) {
          return bEnglishPriority - aEnglishPriority;
        }

        if (a.vote_average !== b.vote_average) {
          return b.vote_average - a.vote_average;
        }

        return b.width - a.width;
      })[0];

    const logoPath = bestLogo ? getOptimizedImageUrl(bestLogo.file_path, 800) : null;
    logoCache.set(cacheKey, {
      logoPath,
      timestamp: Date.now(),
    });

    return NextResponse.json(
      {
        logoPath,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching content logo:', error);

    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch content logo',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
