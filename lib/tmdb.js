// TMDB API wrapper with caching
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Simple in-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data) {
  cache.set(key, {
    data,
    expiry: Date.now() + CACHE_TTL
  });
}

export async function fetchTMDB(endpoint, params = {}) {
  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params
  });
  const url = `${TMDB_BASE_URL}${endpoint}?${queryParams}`;
  
  const cached = getCached(url);
  if (cached) return cached;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  setCache(url, data);
  return data;
}

export async function getTrending(mediaType = 'all', timeWindow = 'week', page = 1) {
  return fetchTMDB(`/trending/${mediaType}/${timeWindow}`, { page });
}

export async function getPopular(mediaType = 'movie', page = 1) {
  return fetchTMDB(`/${mediaType}/popular`, { page });
}

export async function getTopRated(mediaType = 'movie', page = 1) {
  return fetchTMDB(`/${mediaType}/top_rated`, { page });
}

export async function getMovieDetails(movieId) {
  return fetchTMDB(`/movie/${movieId}`, { append_to_response: 'videos,credits' });
}

export async function getTVDetails(tvId) {
  return fetchTMDB(`/tv/${tvId}`, { append_to_response: 'videos,credits' });
}

export async function getTVSeasonDetails(tvId, seasonNumber) {
  return fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`);
}

export async function searchMovies(query, page = 1) {
  return fetchTMDB('/search/movie', { query, page });
}

export async function searchTV(query, page = 1) {
  return fetchTMDB('/search/tv', { query, page });
}

export async function searchMulti(query, page = 1) {
  return fetchTMDB('/search/multi', { query, page });
}

export async function getMoviesByGenre(genreId, page = 1) {
  return fetchTMDB('/discover/movie', { with_genres: genreId, page });
}

export async function getTVByGenre(genreId, page = 1) {
  return fetchTMDB('/discover/tv', { with_genres: genreId, page });
}

export async function getGenres(mediaType = 'movie') {
  return fetchTMDB(`/genre/${mediaType}/list`);
}
