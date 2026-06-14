import { env } from "@/config/env";
import Constants from "expo-constants";
import { getClerkInstance } from "@clerk/clerk-expo";
import type { Content, ContentDetails, SearchResults } from "@/types/content";
import { getCacheFirst, writeCache } from "@/lib/persistent-cache";

interface ContentQueryOptions {
  providerId?: number;
  region?: string;
}

type HomeContentKind = "featured" | "trending" | "continue" | "recommended";

interface RawHomeContentItem {
  id?: number | string;
  tmdbId?: number | string;
  contentId?: number | string;
  type?: "movie" | "tv";
  mediaType?: "movie" | "tv";
  title?: string;
  name?: string;
  genre?: string;
  releaseDate?: string;
  year?: string | number;
  rating?: string | number;
  matchScore?: string | number;
  progress?: number;
  progressPercentage?: number;
  voteAverage?: number;
  vote_average?: number;
  overview?: string;
  posterPath?: string | null;
  poster_path?: string | null;
  backdropPath?: string | null;
  backdrop_path?: string | null;
}

export interface HomeFeaturedContent extends Content {
  genre?: string;
  year?: string;
  rating?: string;
  matchScore?: number;
}

export interface WatchProgressItem {
  _id?: string;
  profileId: string;
  contentId: number;
  contentType: "movie" | "tv";
  episodeId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  currentTime: number;
  duration: number;
  percentageWatched: number;
  lastWatchedAt: string;
}

function buildQueryOptions(options?: ContentQueryOptions) {
  if (!options) return "";

  const query = new URLSearchParams();

  if (options.providerId) {
    query.set("provider", String(options.providerId));
  }

  if (options.region) {
    query.set("region", options.region);
  }

  const queryString = query.toString();
  return queryString ? `&${queryString}` : "";
}

export interface UserProfile {
  id?: string;
  _id?: string;
  name: string;
  avatarImageName?: string;
  avatarUrl?: string;
  isKids?: boolean;
  maturityRating?: "G" | "PG" | "PG-13" | "R" | "NC-17";
  language?: string;
}

const REQUEST_TIMEOUT_MS = 4_000;
const TOKEN_CACHE_TTL_MS = 60_000;
const PROFILES_CACHE_KEY = "profiles/mobile";
const PROFILES_CACHE_MAX_AGE_MS = 20 * 60_000;

type AuthMode = "none" | "required";

let cachedAuthToken: { value: string; expiresAt: number } | null = null;
let tokenRequestInFlight: Promise<string | null> | null = null;

function getExpoHost() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;
  return hostUri.split(":")[0] || null;
}

function getApiBaseCandidates() {
  const candidates = [env.apiBaseUrl];
  const expoHost = getExpoHost();

  if (expoHost) {
    try {
      const parsed = new URL(env.apiBaseUrl);

      if (["localhost", "127.0.0.1", "10.0.2.2"].includes(parsed.hostname)) {
        parsed.hostname = expoHost;
        candidates.push(parsed.toString().replace(/\/$/, ""));
      }
    } catch {
      // Keep default candidate only if base URL is malformed.
    }
  }

  return [...new Set(candidates)];
}

function normalizeHeaders(headers?: HeadersInit) {
  if (!headers) {
    return {} as Record<string, string>;
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return { ...headers };
}

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function getAuthToken(): Promise<string | null> {
  if (cachedAuthToken && cachedAuthToken.expiresAt > Date.now()) {
    return cachedAuthToken.value;
  }

  if (tokenRequestInFlight) {
    return tokenRequestInFlight;
  }

  tokenRequestInFlight = (async () => {
    try {
      const clerk = getClerkInstance();
      const token = await clerk.session?.getToken();

      if (token) {
        cachedAuthToken = {
          value: token,
          expiresAt: Date.now() + TOKEN_CACHE_TTL_MS,
        };
      }

      return token || null;
    } catch {
      return null;
    } finally {
      tokenRequestInFlight = null;
    }
  })();

  return tokenRequestInFlight;
}

async function getAuthHeaders(authMode: AuthMode): Promise<Record<string, string>> {
  if (authMode === "none") {
    return {
      "X-Client-Platform": "mobile-expo",
    };
  }

  const token = await getAuthToken();

  if (!token) {
    throw new Error("Missing authentication token");
  }

  return {
    Authorization: `Bearer ${token}`,
    "X-Client-Platform": "mobile-expo",
  };
}

async function apiRequest<T>(path: string, init?: RequestInit, authMode: AuthMode = "none"): Promise<T> {
  let lastError: unknown = null;
  const authHeaders = await getAuthHeaders(authMode);

  for (const base of getApiBaseCandidates()) {
    try {
      const response = await fetchWithTimeout(`${base}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
          ...normalizeHeaders(init?.headers),
        },
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("API request failed");
}

export async function getTrending(options?: ContentQueryOptions) {
  return apiRequest<Content[]>(`/content/trending?timeWindow=week${buildQueryOptions(options)}`);
}

function normalizeContentId(item: RawHomeContentItem) {
  const raw = item.id ?? item.tmdbId ?? item.contentId;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeContentType(item: RawHomeContentItem, fallback: "movie" | "tv" = "movie"): "movie" | "tv" {
  if (item.type === "movie" || item.type === "tv") return item.type;
  if (item.mediaType === "movie" || item.mediaType === "tv") return item.mediaType;
  return fallback;
}

function normalizeContentItem(item: RawHomeContentItem, kind: HomeContentKind): HomeFeaturedContent {
  const normalizedType = normalizeContentType(item, kind === "continue" ? "tv" : "movie");
  const progressRaw = item.progressPercentage ?? item.progress;
  const progressPercentage =
    typeof progressRaw === "number" ? Math.round(Math.max(0, Math.min(1, progressRaw)) * 100) : undefined;
  const matchRaw = item.matchScore;
  const matchScore = typeof matchRaw === "number" ? Math.round(matchRaw) : Number(matchRaw);
  const normalizedYear = item.year ? String(item.year) : item.releaseDate ? item.releaseDate.slice(0, 4) : undefined;
  const normalizedRating = item.rating ? String(item.rating) : undefined;

  return {
    id: normalizeContentId(item),
    type: normalizedType,
    title: item.title || item.name || "Untitled",
    posterPath: item.posterPath ?? item.poster_path ?? null,
    backdropPath: item.backdropPath ?? item.backdrop_path ?? null,
    overview: item.overview || "",
    releaseDate: item.releaseDate || "",
    voteAverage: Number(item.voteAverage ?? item.vote_average ?? 0),
    genreIds: [],
    progressPercentage,
    genre: item.genre,
    year: normalizedYear,
    rating: normalizedRating,
    matchScore: Number.isFinite(matchScore) ? matchScore : undefined,
  };
}

export async function getHomeFeatured() {
  try {
    const payload = await apiRequest<RawHomeContentItem>("/featured");
    return normalizeContentItem(payload, "featured");
  } catch {
    const fallback = await getTrending();
    if (!fallback.length) {
      throw new Error("No featured content available");
    }
    return {
      ...fallback[0],
      matchScore: 98,
      year: fallback[0].releaseDate ? fallback[0].releaseDate.slice(0, 4) : undefined,
    };
  }
}

export async function getHomeTrending() {
  try {
    const payload = await apiRequest<RawHomeContentItem[]>("/trending");
    return payload.map((item) => normalizeContentItem(item, "trending"));
  } catch {
    return getTrending();
  }
}

export async function getHomeContinueWatching() {
  try {
    const payload = await apiRequest<RawHomeContentItem[]>("/continue");
    return payload.map((item) => normalizeContentItem(item, "continue"));
  } catch {
    return [];
  }
}

export async function getHomeRecommended() {
  try {
    const payload = await apiRequest<RawHomeContentItem[]>("/recommended");
    return payload.map((item) => normalizeContentItem(item, "recommended"));
  } catch {
    return getPopularMovies();
  }
}

export async function getPopularMovies(options?: ContentQueryOptions) {
  return apiRequest<Content[]>(`/content/popular?type=movie${buildQueryOptions(options)}`);
}

export async function getPopularTV(options?: ContentQueryOptions) {
  return apiRequest<Content[]>(`/content/popular?type=tv${buildQueryOptions(options)}`);
}

export async function getTopRatedMovies(options?: ContentQueryOptions) {
  return apiRequest<Content[]>(`/content/top-rated?type=movie${buildQueryOptions(options)}`);
}

export async function getNewReleases(options?: ContentQueryOptions) {
  const optionsQuery = options?.providerId || options?.region ? `?${buildQueryOptions(options).slice(1)}` : "";
  return apiRequest<Content[]>(`/content/new-releases${optionsQuery}`);
}

export async function getContentDetails(id: number, type: "movie" | "tv") {
  return apiRequest<ContentDetails>(`/content/${id}?type=${type}`);
}

export async function getContentLogoPath(id: number, type: "movie" | "tv") {
  const response = await apiRequest<{ logoPath: string | null }>(`/content/logo?id=${id}&type=${type}`);
  return response.logoPath;
}

export async function searchContent(query: string) {
  return apiRequest<SearchResults>(`/content/search?query=${encodeURIComponent(query)}`);
}

export async function getProfiles() {
  return apiRequest<UserProfile[]>("/profiles", undefined, "required");
}

export async function getProfilesCached(onBackgroundUpdate?: (profiles: UserProfile[]) => void) {
  return getCacheFirst<UserProfile[]>({
    key: PROFILES_CACHE_KEY,
    maxAgeMs: PROFILES_CACHE_MAX_AGE_MS,
    fetcher: async () => {
      const profiles = await getProfiles();
      return profiles;
    },
    onBackgroundUpdate,
  });
}

export async function saveProfilesCache(profiles: UserProfile[]) {
  await writeCache(PROFILES_CACHE_KEY, profiles);
}

export function resolveApiAssetUrl(assetPath?: string | null) {
  if (!assetPath) return null;
  if (/^https?:\/\//.test(assetPath)) return assetPath;

  const normalizedPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  const candidates = getApiBaseCandidates();

  const preferredBase =
    candidates.find((candidate) => {
      try {
        const hostname = new URL(candidate).hostname;
        return !["localhost", "127.0.0.1", "10.0.2.2"].includes(hostname);
      } catch {
        return false;
      }
    }) || candidates[candidates.length - 1] || env.apiBaseUrl;

  try {
    const parsed = new URL(preferredBase);
    parsed.pathname = parsed.pathname.replace(/\/api\/?$/, "") || "/";
    return `${parsed.toString().replace(/\/$/, "")}${normalizedPath}`;
  } catch {
    return `${preferredBase}${normalizedPath}`;
  }
}

export async function getWatchlist(profileId: string) {
  return apiRequest<Content[]>(`/watchlist?profileId=${encodeURIComponent(profileId)}`, undefined, "required");
}

export async function getWatchProgress(profileId: string) {
  return apiRequest<WatchProgressItem[]>(`/watch-progress?profileId=${encodeURIComponent(profileId)}`, undefined, "required");
}

export async function getContinueWatching(profileId: string) {
  const watchProgress = await getWatchProgress(profileId);

  const resolved: Array<Content | null> = await Promise.all(
    watchProgress.slice(0, 16).map(async (item) => {
      try {
        const details = await getContentDetails(item.contentId, item.contentType);

        const content: Content = {
          ...details,
          progressPercentage: Math.max(0, Math.min(100, Math.round(item.percentageWatched))),
          lastWatchedAt: item.lastWatchedAt,
        };

        return content;
      } catch {
        return null;
      }
    })
  );

  return resolved.filter((item): item is Content => Boolean(item));
}

export async function addToWatchlist(profileId: string, content: Content) {
  return apiRequest<{ message: string }>("/watchlist", {
    method: "POST",
    body: JSON.stringify({
      profileId,
      contentId: String(content.id),
      contentType: content.type,
    }),
  }, "required");
}

export async function removeFromWatchlist(profileId: string, content: Content) {
  return apiRequest<void>(`/watchlist/${content.id}?profileId=${encodeURIComponent(profileId)}`, {
    method: "DELETE",
  }, "required");
}

export interface ApiHealthInfo {
  status: "healthy" | "unhealthy" | "unknown";
  database?: string;
  collections?: number;
  timestamp?: string;
  error?: string;
}

export async function getApiHealthInfo(): Promise<ApiHealthInfo> {
  let lastError: string | undefined;
  const authHeaders = await getAuthHeaders("none");

  for (const base of getApiBaseCandidates()) {
    try {
      const response = await fetchWithTimeout(`${base}/health`, {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      });

      const payload = (await response.json()) as Partial<ApiHealthInfo>;

      if (!response.ok) {
        lastError = payload.error || `HTTP ${response.status}`;
        continue;
      }

      return {
        status: payload.status === "ok" ? "healthy" : "unknown",
        database: payload.database,
        collections: payload.collections,
        timestamp: payload.timestamp,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : "API probe failed";
    }
  }

  try {
    return {
      status: "unknown",
      error: lastError || "API probe failed",
    };
  } catch {
    return {
      status: "unknown",
      error: "API probe failed",
    };
  }
}
