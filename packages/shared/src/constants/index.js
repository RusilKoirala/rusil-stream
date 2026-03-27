/**
 * API route path constants for @streaming-app/shared
 */

export const ROUTES = {
  LOGIN: '/api/login',
  SIGNUP: '/api/auth/signup',
  LOGOUT: '/api/auth/logout',
  PROFILES: '/api/profile',
  SAVED: '/api/saved',
  HISTORY: '/api/history',
  TRENDING: '/api/movies?type=trending',
  POPULAR: '/api/movies?type=popular&mediaType=movie',
  TOP_RATED: '/api/movies?type=top_rated&mediaType=movie',
  SEARCH: '/api/movies?mediaType=multi&query',
};

/** TMDB image base URL */
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

/** TMDB poster size presets */
export const POSTER_SIZES = {
  small: 'w185',
  medium: 'w342',
  large: 'w500',
};

/** TMDB backdrop size presets */
export const BACKDROP_SIZES = {
  small: 'w300',
  medium: 'w780',
  large: 'w1280',
};
