// TMDB API Integration - Main Export

export * from './types';
export * from './client';
export * from './parsers';
export * from './service';

// Re-export commonly used functions
export {
  getTrending,
  getPopular,
  getTopRated,
  getNewReleases,
  getGenres,
  getDetails,
  getSeasonDetails,
  getRecommendations,
  getSimilar,
  search,
  getByGenre,
} from './service';

export {
  getOptimizedImageUrl,
  getTMDBImageUrl,
  TMDBError,
} from './client';

export {
  parseTMDBMovie,
  parseTMDBTV,
  parseTMDBMovieDetails,
  parseTMDBTVDetails,
  parseTMDBPerson,
  parseTMDBContent,
} from './parsers';
