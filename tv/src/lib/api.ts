import axios from 'axios';
import { env } from '@/config/env';
import { getDeviceToken, clearDeviceToken } from './device-token';
import type { Content, ContentDetails, SearchResults } from '@/types/content';

const API_BASE = env.apiBaseUrl;
const TIMEOUT_MS = 12_000;

// Spoof a browser UA — Android's default 'okhttp' UA can get blocked by Cloudflare/WAF
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const client = axios.create({
  baseURL: API_BASE,
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': BROWSER_UA,
    'X-Client-Platform': 'tv',
  },
});

// Attach device token to every request
client.interceptors.request.use((config) => {
  const token = getDeviceToken();
  if (token) {
    config.headers['x-device-token'] = token;
  }
  return config;
});

// Handle 401 by clearing invalid token
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearDeviceToken();
    }
    return Promise.reject(err);
  },
);

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const response = await client.get<T>(path, { params });
  return response.data;
}

// ─── Content endpoints ────────────────────────────────────────────────────────

export async function getTrending(): Promise<Content[]> {
  return get<Content[]>('/content/trending', { timeWindow: 'day' });
}

export async function getPopularMovies(options?: { providerId?: number; region?: string }): Promise<Content[]> {
  const params: Record<string, string> = { type: 'movie' };
  if (options?.providerId) params.provider = String(options.providerId);
  if (options?.region) params.region = options.region;
  return get<Content[]>('/content/popular', params);
}

export async function getPopularTV(): Promise<Content[]> {
  return get<Content[]>('/content/popular', { type: 'tv' });
}

export async function getTopRatedMovies(): Promise<Content[]> {
  return get<Content[]>('/content/top-rated', { type: 'movie' });
}

export async function getNewReleases(): Promise<Content[]> {
  return get<Content[]>('/content/new-releases');
}

export async function getContentDetails(id: number, type: 'movie' | 'tv'): Promise<ContentDetails> {
  return get<ContentDetails>(`/content/${id}`, { type });
}

export async function getContentLogoPath(id: number, type: 'movie' | 'tv'): Promise<string | null> {
  const res = await get<{ logoPath: string | null }>('/content/logo', {
    id: String(id),
    type,
  });
  return res.logoPath;
}

export async function searchContent(query: string): Promise<SearchResults> {
  return get<SearchResults>('/content/search', { query: encodeURIComponent(query) });
}

// ─── Profile endpoints ─────────────────────────────────────────────────────────

export interface TVProfile {
  _id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  isKids: boolean;
  maturityRating: string;
  pinEnabled: boolean;
  language: string;
}

export async function getProfiles(): Promise<TVProfile[]> {
  return get<TVProfile[]>('/profiles');
}

