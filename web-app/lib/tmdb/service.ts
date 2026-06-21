// TMDB Service - Main API functions

import { tmdbRequest, TMDBError } from './client';
import {
  parseTMDBContent,
  parseTMDBMovieDetails,
  parseTMDBTVDetails,
  parseTMDBPerson,
  parseTMDBSeasonDetails,
  parseTMDBGenre,
  parseTMDBMovie,
  parseTMDBTV,
} from './parsers';
import type {
  TMDBTrendingResponse,
  TMDBMovieDetails,
  TMDBTVDetails,
  TMDBCredits,
  TMDBVideosResponse,
  TMDBSearchResponse,
  TMDBGenreListResponse,
  TMDBSeasonDetails,
  TMDBPerson,
  TMDBMovie,
  TMDBTVShow,
  Content,
  ContentDetails,
  Season,
  Genre,
  SearchResults,
  SearchFilters,
} from './types';

// Cache for fallback data
const cache = new Map<string, unknown>();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface ContentFilterOptions {
  providerId?: number;
  region?: string;
}

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Fetch trending content
 */
export async function getTrending(
  timeWindow: 'day' | 'week' = 'day',
  options?: ContentFilterOptions
): Promise<Content[]> {
  const region = (options?.region || 'US').toUpperCase();
  const providerId = options?.providerId;
  const cacheKey = `trending_${timeWindow}_${providerId ?? 'all'}_${region}`;

  try {
    let content: Content[];

    if (providerId) {
      const [moviesResponse, tvResponse] = await Promise.all([
        tmdbRequest<TMDBTrendingResponse>({
          endpoint: '/discover/movie',
          params: {
            with_watch_providers: providerId,
            watch_region: region,
            sort_by: 'popularity.desc',
          },
        }),
        tmdbRequest<TMDBTrendingResponse>({
          endpoint: '/discover/tv',
          params: {
            with_watch_providers: providerId,
            watch_region: region,
            sort_by: 'popularity.desc',
          },
        }),
      ]);

      const movies = moviesResponse.results.map(parseTMDBContent);
      const tvShows = tvResponse.results.map(parseTMDBContent);
      const maxLength = Math.max(movies.length, tvShows.length);

      content = [];
      for (let index = 0; index < maxLength; index += 1) {
        if (movies[index]) content.push(movies[index]);
        if (tvShows[index]) content.push(tvShows[index]);
      }
    } else {
      const response = await tmdbRequest<TMDBTrendingResponse>({
        endpoint: `/trending/all/${timeWindow}`,
      });
      content = response.results.map(parseTMDBContent);
    }

    setCache(cacheKey, content);
    return content;
  } catch (error) {
    // Try to return cached data on failure
    const cached = getCached<Content[]>(cacheKey);
    if (cached) {
      console.warn('TMDB API failed, returning cached data:', error);
      return cached;
    }

    if (error instanceof TMDBError) {
      throw new Error(`Failed to fetch trending content: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch popular content
 */
export async function getPopular(
  type: 'movie' | 'tv',
  options?: ContentFilterOptions
): Promise<Content[]> {
  const region = (options?.region || 'US').toUpperCase();
  const providerId = options?.providerId;
  const cacheKey = `popular_${type}_${providerId ?? 'all'}_${region}`;

  try {
    const response = providerId
      ? await tmdbRequest<TMDBTrendingResponse>({
          endpoint: `/discover/${type}`,
          params: {
            with_watch_providers: providerId,
            watch_region: region,
            sort_by: 'popularity.desc',
          },
        })
      : await tmdbRequest<TMDBTrendingResponse>({
          endpoint: `/${type}/popular`,
        });

    const content = response.results.map(parseTMDBContent);
    setCache(cacheKey, content);
    return content;
  } catch (error) {
    const cached = getCached<Content[]>(cacheKey);
    if (cached) {
      console.warn('TMDB API failed, returning cached data:', error);
      return cached;
    }

    if (error instanceof TMDBError) {
      throw new Error(`Failed to fetch popular ${type}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch top-rated content
 */
export async function getTopRated(
  type: 'movie' | 'tv',
  options?: ContentFilterOptions
): Promise<Content[]> {
  const region = (options?.region || 'US').toUpperCase();
  const providerId = options?.providerId;
  const cacheKey = `top_rated_${type}_${providerId ?? 'all'}_${region}`;

  try {
    const response = providerId
      ? await tmdbRequest<TMDBTrendingResponse>({
          endpoint: `/discover/${type}`,
          params: {
            with_watch_providers: providerId,
            watch_region: region,
            sort_by: 'vote_average.desc',
            'vote_count.gte': 200,
          },
        })
      : await tmdbRequest<TMDBTrendingResponse>({
          endpoint: `/${type}/top_rated`,
        });

    const content = response.results.map(parseTMDBContent);
    setCache(cacheKey, content);
    return content;
  } catch (error) {
    const cached = getCached<Content[]>(cacheKey);
    if (cached) {
      console.warn('TMDB API failed, returning cached data:', error);
      return cached;
    }

    if (error instanceof TMDBError) {
      throw new Error(`Failed to fetch top-rated ${type}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch new releases (movies released in the last 30 days)
 */
export async function getNewReleases(
  options?: ContentFilterOptions
): Promise<Content[]> {
  const region = (options?.region || 'US').toUpperCase();
  const providerId = options?.providerId;
  const cacheKey = `new_releases_${providerId ?? 'all'}_${region}`;

  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const response = await tmdbRequest<TMDBTrendingResponse>({
      endpoint: '/discover/movie',
      params: {
        'primary_release_date.gte': thirtyDaysAgo.toISOString().split('T')[0],
        'primary_release_date.lte': today.toISOString().split('T')[0],
        sort_by: 'primary_release_date.desc',
        ...(providerId
          ? {
              with_watch_providers: providerId,
              watch_region: region,
            }
          : {}),
      },
    });

    const content = response.results.map(parseTMDBContent);
    setCache(cacheKey, content);
    return content;
  } catch (error) {
    const cached = getCached<Content[]>(cacheKey);
    if (cached) {
      console.warn('TMDB API failed, returning cached data:', error);
      return cached;
    }

    if (error instanceof TMDBError) {
      throw new Error(`Failed to fetch new releases: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch genres
 */
export async function getGenres(type: 'movie' | 'tv'): Promise<Genre[]> {
  const cacheKey = `genres_${type}`;

  try {
    const response = await tmdbRequest<TMDBGenreListResponse>({
      endpoint: `/genre/${type}/list`,
    });

    const genres = response.genres.map(parseTMDBGenre);
    setCache(cacheKey, genres);
    return genres;
  } catch (error) {
    const cached = getCached<Genre[]>(cacheKey);
    if (cached) {
      console.warn('TMDB API failed, returning cached data:', error);
      return cached;
    }

    if (error instanceof TMDBError) {
      throw new Error(`Failed to fetch genres: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch content details
 */
export async function getDetails(
  contentId: number,
  type: 'movie' | 'tv'
): Promise<ContentDetails> {
  const cacheKey = `details_${type}_${contentId}`;

  try {
    // Fetch main details
    const details = await tmdbRequest<TMDBMovieDetails | TMDBTVDetails>({
      endpoint: `/${type}/${contentId}`,
    });

    // Fetch credits
    const credits = await tmdbRequest<TMDBCredits>({
      endpoint: `/${type}/${contentId}/credits`,
    });

    // Fetch videos
    const videosResponse = await tmdbRequest<TMDBVideosResponse>({
      endpoint: `/${type}/${contentId}/videos`,
    });

    // Fetch recommendations
    const recommendationsResponse = await tmdbRequest<TMDBTrendingResponse>({
      endpoint: `/${type}/${contentId}/recommendations`,
    });

    // Fetch similar
    const similarResponse = await tmdbRequest<TMDBTrendingResponse>({
      endpoint: `/${type}/${contentId}/similar`,
    });

    let contentDetails: ContentDetails;

    if (type === 'movie') {
      contentDetails = parseTMDBMovieDetails(
        details as TMDBMovieDetails,
        credits,
        videosResponse.results,
        recommendationsResponse.results as TMDBMovie[],
        similarResponse.results as TMDBMovie[]
      );
    } else {
      contentDetails = parseTMDBTVDetails(
        details as TMDBTVDetails,
        credits,
        videosResponse.results,
        recommendationsResponse.results as TMDBTVShow[],
        similarResponse.results as TMDBTVShow[]
      );
    }

    setCache(cacheKey, contentDetails);
    return contentDetails;
  } catch (error) {
    const cached = getCached<ContentDetails>(cacheKey);
    if (cached) {
      console.warn('TMDB API failed, returning cached data:', error);
      return cached;
    }

    if (error instanceof TMDBError) {
      throw new Error(
        `Failed to fetch ${type} details (ID: ${contentId}): ${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Fetch season details with episodes
 */
export async function getSeasonDetails(
  tvId: number,
  seasonNumber: number
): Promise<Season> {
  const cacheKey = `season_${tvId}_${seasonNumber}`;

  try {
    const seasonDetails = await tmdbRequest<TMDBSeasonDetails>({
      endpoint: `/tv/${tvId}/season/${seasonNumber}`,
    });

    const season = parseTMDBSeasonDetails(seasonDetails);
    setCache(cacheKey, season);
    return season;
  } catch (error) {
    const cached = getCached<Season>(cacheKey);
    if (cached) {
      console.warn('TMDB API failed, returning cached data:', error);
      return cached;
    }

    if (error instanceof TMDBError) {
      throw new Error(
        `Failed to fetch season details (TV: ${tvId}, Season: ${seasonNumber}): ${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Fetch recommendations for content
 */
export async function getRecommendations(
  contentId: number,
  type: 'movie' | 'tv'
): Promise<Content[]> {
  const cacheKey = `recommendations_${type}_${contentId}`;

  try {
    const response = await tmdbRequest<TMDBTrendingResponse>({
      endpoint: `/${type}/${contentId}/recommendations`,
    });

    const content = response.results.map(parseTMDBContent);
    setCache(cacheKey, content);
    return content;
  } catch (error) {
    const cached = getCached<Content[]>(cacheKey);
    if (cached) {
      console.warn('TMDB API failed, returning cached data:', error);
      return cached;
    }

    if (error instanceof TMDBError) {
      throw new Error(
        `Failed to fetch recommendations for ${type} ${contentId}: ${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Fetch similar content
 */
export async function getSimilar(
  contentId: number,
  type: 'movie' | 'tv'
): Promise<Content[]> {
  const cacheKey = `similar_${type}_${contentId}`;

  try {
    const response = await tmdbRequest<TMDBTrendingResponse>({
      endpoint: `/${type}/${contentId}/similar`,
    });

    const content = response.results.map(parseTMDBContent);
    setCache(cacheKey, content);
    return content;
  } catch (error) {
    const cached = getCached<Content[]>(cacheKey);
    if (cached) {
      console.warn('TMDB API failed, returning cached data:', error);
      return cached;
    }

    if (error instanceof TMDBError) {
      throw new Error(
        `Failed to fetch similar content for ${type} ${contentId}: ${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Search for content
 */
export async function search(
  query: string,
  filters?: SearchFilters
): Promise<SearchResults> {
  const cacheKey = `search_${query}_${JSON.stringify(filters)}`;

  try {
    const params: Record<string, string | number> = {
      query,
    };

    // Add filters if provided
    if (filters?.yearRange) {
      params['primary_release_date.gte'] = `${filters.yearRange.min}-01-01`;
      params['primary_release_date.lte'] = `${filters.yearRange.max}-12-31`;
    }

    if (filters?.minRating) {
      params['vote_average.gte'] = filters.minRating;
    }

    if (filters?.genres && filters.genres.length > 0) {
      params.with_genres = filters.genres.join(',');
    }

    // Determine search endpoint based on type filter
    let endpoint = '/search/multi';
    if (filters?.type === 'movie') {
      endpoint = '/search/movie';
    } else if (filters?.type === 'tv') {
      endpoint = '/search/tv';
    } else if (filters?.type === 'person') {
      endpoint = '/search/person';
    }

    const response = await tmdbRequest<TMDBSearchResponse>({
      endpoint,
      params,
    });

    const results: SearchResults = {
      movies: [],
      tvShows: [],
      people: [],
      totalResults: response.total_results,
    };

    // Parse results based on type
    for (const item of response.results) {
      if ('title' in item) {
        results.movies.push(parseTMDBMovie(item as TMDBMovie));
      } else if ('name' in item && 'first_air_date' in item) {
        results.tvShows.push(parseTMDBTV(item as TMDBTVShow));
      } else if ('known_for' in item) {
        results.people.push(parseTMDBPerson(item as TMDBPerson));
      }
    }

    setCache(cacheKey, results);
    return results;
  } catch (error) {
    const cached = getCached<SearchResults>(cacheKey);
    if (cached) {
      console.warn('TMDB API failed, returning cached data:', error);
      return cached;
    }

    if (error instanceof TMDBError) {
      throw new Error(`Failed to search for "${query}": ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch content by genre
 */
export async function getByGenre(
  genreId: number,
  type: 'movie' | 'tv',
  page: number = 1
): Promise<Content[]> {
  const cacheKey = `genre_${type}_${genreId}_${page}`;

  try {
    const response = await tmdbRequest<TMDBTrendingResponse>({
      endpoint: `/discover/${type}`,
      params: {
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc',
      },
    });

    const content = response.results.map(parseTMDBContent);
    setCache(cacheKey, content);
    return content;
  } catch (error) {
    const cached = getCached<Content[]>(cacheKey);
    if (cached) {
      console.warn('TMDB API failed, returning cached data:', error);
      return cached;
    }

    if (error instanceof TMDBError) {
      throw new Error(
        `Failed to fetch ${type} by genre ${genreId}: ${error.message}`
      );
    }
    throw error;
  }
}
