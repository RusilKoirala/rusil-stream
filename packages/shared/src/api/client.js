import { ROUTES } from '../constants/index.js';

const TIMEOUT_MS = 15_000;

/**
 * Error thrown when the API returns a non-2xx response.
 */
export class ApiError extends Error {
  /**
   * @param {{ status: number, message: string }} params
   */
  constructor({ status, message }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Internal fetch wrapper with timeout and auth header support.
 * @param {string} url
 * @param {RequestInit} options
 * @param {string|null} token
 * @returns {Promise<any>}
 */
async function request(url, options = {}, token = null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const headers = { 'Content-Type': 'application/json', ...(options.headers ?? {}) };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      let message = res.statusText;
      try {
        const body = await res.json();
        message = body.error ?? body.message ?? message;
      } catch {
        // ignore parse errors
      }
      throw new ApiError({ status: res.status, message });
    }

    return res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError({ status: 0, message: 'Request timed out' });
    }
    throw err;
  }
}

/**
 * Create a configured API client instance.
 *
 * @param {{ baseUrl: string, getToken: () => Promise<string|null> }} config
 */
export function createApiClient(config) {
  const { baseUrl, getToken } = config;

  async function req(path, options = {}) {
    const token = await getToken();
    return request(`${baseUrl}${path}`, options, token);
  }

  return {
    /** @param {string} email @param {string} password */
    login: (email, password) =>
      req(ROUTES.LOGIN, { method: 'POST', body: JSON.stringify({ email, password }) }),

    /** @param {string} email @param {string} password */
    signup: (email, password) =>
      req(ROUTES.SIGNUP, { method: 'POST', body: JSON.stringify({ email, password }) }),

    logout: () =>
      req(ROUTES.LOGOUT, { method: 'POST' }),

    getProfiles: () =>
      req('/api/auth/me'),

    /** @param {string} profileId */
    getSaved: (profileId) =>
      req(`${ROUTES.SAVED}?profileId=${encodeURIComponent(profileId)}`),

    /** @param {string} profileId @param {object} item */
    addSaved: (profileId, item) =>
      req(ROUTES.SAVED, { method: 'POST', body: JSON.stringify({ profileId, ...item }) }),

    /** @param {string} profileId @param {string} movieId */
    removeSaved: (profileId, movieId) =>
      req(`${ROUTES.SAVED}?profileId=${encodeURIComponent(profileId)}&movieId=${encodeURIComponent(movieId)}`, { method: 'DELETE' }),

    /** @param {string} profileId */
    getHistory: (profileId) =>
      req(`${ROUTES.HISTORY}?profileId=${encodeURIComponent(profileId)}`),

    /** @param {string} profileId @param {object} item */
    addHistory: (profileId, item) =>
      req(ROUTES.HISTORY, { method: 'POST', body: JSON.stringify({ profileId, ...item }) }),

    getTrending: () =>
      req(ROUTES.TRENDING),

    getPopular: () =>
      req(ROUTES.POPULAR),

    getTopRated: () =>
      req(ROUTES.TOP_RATED),

    /** @param {string} query */
    searchContent: (query) =>
      req(`/api/movies?mediaType=multi&query=${encodeURIComponent(query)}`),

    /** @param {string|number} id */
    getMovieDetail: (id) =>
      req(`/api/movies?id=${encodeURIComponent(id)}&mediaType=movie`),

    /** @param {string|number} id */
    getTVDetail: (id) =>
      req(`/api/movies?id=${encodeURIComponent(id)}&mediaType=tv`),
  };
}
