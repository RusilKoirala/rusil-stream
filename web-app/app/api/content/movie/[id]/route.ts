import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!TMDB_API_KEY) {
      return NextResponse.json(
        { error: 'TMDB API key not configured' },
        { status: 500 }
      );
    }

    // Fetch movie details
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,recommendations,similar`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform response
    const movie = {
      id: data.id,
      title: data.title,
      overview: data.overview,
      backdropPath: data.backdrop_path
        ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
        : null,
      posterPath: data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : null,
      releaseDate: data.release_date,
      runtime: data.runtime,
      voteAverage: data.vote_average,
      genres: data.genres,
      director: data.credits?.crew?.find((c: any) => c.job === 'Director')?.name || null,
      cast: data.credits?.cast?.slice(0, 10) || [],
      videos: data.videos?.results || [],
      recommendations: data.recommendations?.results?.slice(0, 12) || [],
      similar: data.similar?.results?.slice(0, 12) || [],
    };

    return NextResponse.json(movie);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie details' },
      { status: 500 }
    );
  }
}
