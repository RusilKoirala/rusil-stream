import { NextRequest, NextResponse } from 'next/server';
import { fetchBackdropsForItems } from '@/lib/tmdb/logo-fetcher';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function fetchWithRetry(url: string, retries = 2, timeout = 10000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, { 
        signal: controller.signal,
        next: { revalidate: 300 } // Cache for 5 minutes
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'movie'; // movie or tv
    const genre = searchParams.get('genre');
    const page = searchParams.get('page') || '1';

    if (!TMDB_API_KEY) {
      return NextResponse.json(
        { error: 'TMDB API key not configured' },
        { status: 500 }
      );
    }

    // Build TMDB discover URL
    const mediaType = type === 'tv' ? 'tv' : 'movie';
    let url = `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&page=${page}&sort_by=popularity.desc`;

    // Add genre filter if provided
    if (genre) {
      url += `&with_genres=${genre}`;
    }

    const response = await fetchWithRetry(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    // Get first 12 items
    const items = data.results.slice(0, 12);
    
    // Fetch English backdrops (they often have logos on them)
    const backdrops = await fetchBackdropsForItems(
      items.map((item: any) => ({ id: item.id, mediaType })),
      mediaType
    );

    // Transform TMDB results with English backdrops (which have logos)
    const transformedResults = items.map((item: any, index: number) => ({
      id: item.id,
      type: mediaType as 'movie' | 'tv',
      title: item.title || item.name,
      overview: item.overview,
      backdropPath: backdrops[index] || (item.backdrop_path 
        ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
        : null),
      posterPath: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : null,
      releaseDate: item.release_date || item.first_air_date || '',
      voteAverage: item.vote_average || 0,
      genreIds: item.genre_ids || [],
    }));

    return NextResponse.json({
      results: transformedResults,
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
    });

  } catch (error) {
    console.error('Discover API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
