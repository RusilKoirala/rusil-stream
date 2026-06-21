// TMDB API Client Configuration

import { getOptimizedImageUrl, getTMDBImageUrl } from './images';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE_URL = process.env.TMDB_API_BASE_URL || 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  throw new Error('TMDB_API_KEY environment variable is not set');
}

export class TMDBError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'TMDBError';
  }
}

export interface TMDBRequestOptions {
  endpoint: string;
  params?: Record<string, string | number | boolean>;
  cache?: RequestCache;
}

/**
 * Make a request to the TMDB API
 */
export async function tmdbRequest<T>(options: TMDBRequestOptions): Promise<T> {
  const { endpoint, params = {}, cache = 'default' } = options;

  // Build query string
  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY!,
    ...Object.entries(params).reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>),
  });

  const url = `${TMDB_API_BASE_URL}${endpoint}?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      cache,
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new TMDBError(
        `TMDB API request failed: ${response.statusText}`,
        response.status,
        endpoint
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof TMDBError) {
      throw error;
    }

    // Network or parsing errors
    throw new TMDBError(
      `Failed to fetch from TMDB: ${error instanceof Error ? error.message : 'Unknown error'}`,
      502,
      endpoint
    );
  }
}

export { getOptimizedImageUrl, getTMDBImageUrl };
