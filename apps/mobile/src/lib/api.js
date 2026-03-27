const TIMEOUT_MS = 15_000;

const ROUTES = {
  LOGIN: '/api/login',
  SIGNUP: '/api/auth/signup',
  LOGOUT: '/api/auth/logout',
  SAVED: '/api/saved',
  HISTORY: '/api/history',
  TRENDING: '/api/movies?type=trending',
  POPULAR: '/api/movies?type=popular&mediaType=movie',
  TOP_RATED: '/api/movies?type=top_rated&mediaType=movie',
};

class ApiError extends Error {
  constructor({ status, message }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(url, options = {}, token = null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const headers = { 'Content-Type': 'application/json', ...(options.headers ?? {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      let message = res.statusText;
      try { const body = await res.json(); message = body.error ?? body.message ?? message; } catch {}
      throw new ApiError({ status: res.status, message });
    }
    return res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new ApiError({ status: 0, message: 'Request timed out' });
    throw err;
  }
}

export function createApiClient({ baseUrl, getToken }) {
  async function req(path, options = {}) {
    const token = await getToken();
    return request(`${baseUrl}${path}`, options, token);
  }
  return {
    login: (email, password) => req(ROUTES.LOGIN, { method: 'POST', body: JSON.stringify({ email, password }) }),
    logout: () => req(ROUTES.LOGOUT, { method: 'POST' }),
    getProfiles: () => req('/api/auth/me'),
    getSaved: (profileId) => req(`${ROUTES.SAVED}?profileId=${encodeURIComponent(profileId)}`),
    addSaved: (profileId, item) => req(ROUTES.SAVED, { method: 'POST', body: JSON.stringify({ profileId, ...item }) }),
    removeSaved: (profileId, movieId) => req(`${ROUTES.SAVED}?profileId=${encodeURIComponent(profileId)}&movieId=${encodeURIComponent(movieId)}`, { method: 'DELETE' }),
    getHistory: (profileId) => req(`${ROUTES.HISTORY}?profileId=${encodeURIComponent(profileId)}`),
    getTrending: () => req(ROUTES.TRENDING),
    getPopular: () => req(ROUTES.POPULAR),
    searchContent: (query) => req(`/api/movies?mediaType=multi&query=${encodeURIComponent(query)}`),
    getMovieDetail: (id) => req(`/api/movies?id=${encodeURIComponent(id)}&mediaType=movie`),
    getTVDetail: (id) => req(`/api/movies?id=${encodeURIComponent(id)}&mediaType=tv`),
  };
}

export function decodeToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded));
    if (typeof payload.exp === 'number' && payload.exp < Date.now() / 1000) return null;
    return { userId: payload.userId ?? payload.sub ?? null, email: payload.email ?? null, exp: payload.exp ?? null };
  } catch { return null; }
}
