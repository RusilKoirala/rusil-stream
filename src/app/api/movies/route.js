// TMDB movies & TV API with caching
import { NextResponse } from 'next/server';
import { getTrending, getPopular, getTopRated, getMovieDetails, getTVDetails, getTVSeasonDetails, searchMovies, searchTV, searchMulti, getMoviesByGenre, getTVByGenre } from '../../../../lib/tmdb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const id = searchParams.get('id');
    const tvId = searchParams.get('tvId');
    const season = searchParams.get('season');
    const genre = searchParams.get('genre');
    const page = parseInt(searchParams.get('page') || '1');
    const type = searchParams.get('type');
    const mediaType = searchParams.get('mediaType') || 'movie'; // movie or tv

    let data;

    if (tvId && season) {
      // Get TV season details
      data = await getTVSeasonDetails(tvId, season);
    } else if (id) {
      // Get details by ID
      if (mediaType === 'tv') {
        data = await getTVDetails(id);
      } else {
        data = await getMovieDetails(id);
      }
    } else if (query) {
      // Search
      if (mediaType === 'tv') {
        data = await searchTV(query, page);
      } else if (mediaType === 'multi') {
        data = await searchMulti(query, page);
      } else {
        data = await searchMovies(query, page);
      }
    } else if (genre) {
      // Get by genre
      if (mediaType === 'tv') {
        data = await getTVByGenre(genre, page);
      } else {
        data = await getMoviesByGenre(genre, page);
      }
    } else if (type === 'popular') {
      data = await getPopular(mediaType, page);
    } else if (type === 'top_rated') {
      data = await getTopRated(mediaType, page);
    } else if (type === 'trending') {
      data = await getTrending('all', 'week', page);
    } else {
      // Default: trending all
      data = await getTrending('all', 'week', page);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('TMDB API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
