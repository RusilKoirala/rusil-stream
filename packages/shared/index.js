/**
 * @streaming-app/shared
 *
 * This package is a placeholder for utilities that are candidates for extraction
 * from the web app into a shared package consumable by future mobile and TV apps.
 *
 * Extraction candidates from src/lib/:
 *
 * 1. TMDB API Client (src/lib/tmdb.js)
 *    - fetchTMDB(endpoint, params) — base fetch wrapper with caching
 *    - getTrending, getPopular, getTopRated
 *    - getMovieDetails, getTVDetails, getTVSeasonDetails
 *    - searchMovies, searchTV, searchMulti
 *    - getMoviesByGenre, getTVByGenre, getGenres
 *    All platforms need to browse and search TMDB content.
 *
 * 2. Auth Helpers (src/lib/auth.js)
 *    - JWT signing/verification logic (platform-agnostic)
 *    - Password hashing utilities (bcryptjs)
 *    Note: cookie-based session management stays web-only.
 *
 * 3. Shared Constants
 *    - TMDB image base URLs and poster/backdrop size presets
 *    - Genre ID mappings
 *    - API route path constants
 *
 * To extract a utility:
 *   1. Copy the file here and remove Next.js / Node-specific dependencies
 *   2. Export it from this index
 *   3. Update the web app to import from '@streaming-app/shared' instead of '@/lib/'
 */

// No exports yet — extraction happens when a second app is added.
