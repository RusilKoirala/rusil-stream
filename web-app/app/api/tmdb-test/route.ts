// TMDB Integration Test Route
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  getTrending,
  getPopular,
  getTopRated,
  getNewReleases,
  getGenres,
  getOptimizedImageUrl,
} from '@/lib/tmdb';
import { validateInternalApiKey } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const internalKeyError = validateInternalApiKey(request);
  if (internalKeyError) return internalKeyError;

  try {
    console.log('Testing TMDB API integration...');

    // Test 1: Fetch trending content
    console.log('1. Testing getTrending...');
    const trending = await getTrending('day');
    console.log(`✓ Fetched ${trending.length} trending items`);

    // Test 2: Fetch popular movies
    console.log('2. Testing getPopular (movies)...');
    const popularMovies = await getPopular('movie');
    console.log(`✓ Fetched ${popularMovies.length} popular movies`);

    // Test 3: Fetch popular TV shows
    console.log('3. Testing getPopular (tv)...');
    const popularTV = await getPopular('tv');
    console.log(`✓ Fetched ${popularTV.length} popular TV shows`);

    // Test 4: Fetch top-rated movies
    console.log('4. Testing getTopRated (movies)...');
    const topRatedMovies = await getTopRated('movie');
    console.log(`✓ Fetched ${topRatedMovies.length} top-rated movies`);

    // Test 5: Fetch new releases
    console.log('5. Testing getNewReleases...');
    const newReleases = await getNewReleases();
    console.log(`✓ Fetched ${newReleases.length} new releases`);

    // Test 6: Fetch genres
    console.log('6. Testing getGenres (movies)...');
    const movieGenres = await getGenres('movie');
    console.log(`✓ Fetched ${movieGenres.length} movie genres`);

    console.log('7. Testing getGenres (tv)...');
    const tvGenres = await getGenres('tv');
    console.log(`✓ Fetched ${tvGenres.length} TV genres`);

    // Test 7: Image URL transformation
    console.log('8. Testing image URL transformation...');
    const testPath = '/abc123.jpg';
    const optimizedUrl = getOptimizedImageUrl(testPath, 500);
    console.log(`✓ Generated optimized URL: ${optimizedUrl}`);

    // Verify optimized URL format
    if (
      !optimizedUrl?.includes('wsrv.nl') ||
      !optimizedUrl?.includes('w=500') ||
      !optimizedUrl?.includes('output=webp')
    ) {
      throw new Error('Image URL transformation failed validation');
    }

    return NextResponse.json({
      success: true,
      message: 'All TMDB integration tests passed!',
      results: {
        trending: {
          count: trending.length,
          sample: trending[0],
        },
        popularMovies: {
          count: popularMovies.length,
          sample: popularMovies[0],
        },
        popularTV: {
          count: popularTV.length,
          sample: popularTV[0],
        },
        topRatedMovies: {
          count: topRatedMovies.length,
          sample: topRatedMovies[0],
        },
        newReleases: {
          count: newReleases.length,
          sample: newReleases[0],
        },
        movieGenres: {
          count: movieGenres.length,
          genres: movieGenres.slice(0, 5),
        },
        tvGenres: {
          count: tvGenres.length,
          genres: tvGenres.slice(0, 5),
        },
        imageOptimization: {
          input: testPath,
          output: optimizedUrl,
        },
      },
    });
  } catch (error) {
    console.error('TMDB integration test failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
