import AsyncStorage from "@react-native-async-storage/async-storage";

// TTL constants for cache-first data loading (Requirements 6.1, 6.2, 6.3)
export const CONTENT_CACHE_TTL_MS = 600_000;   // 10 minutes — home content sections
export const PROFILES_CACHE_TTL_MS = 1_200_000; // 20 minutes — user profiles
export const WATCHLIST_CACHE_TTL_MS = 60_000;   // 1 minute  — watchlist

interface CacheEnvelope<T> {
  updatedAt: number;
  data: T;
}

const CACHE_PREFIX = "@rusilstream/cache/";
const inFlightRefresh = new Map<string, Promise<unknown>>();

function getStorageKey(key: string) {
  return `${CACHE_PREFIX}${key}`;
}

export async function readCache<T>(key: string): Promise<CacheEnvelope<T> | null> {
  const raw = await AsyncStorage.getItem(getStorageKey(key));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;

    if (!parsed || typeof parsed.updatedAt !== "number") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function writeCache<T>(key: string, data: T) {
  const payload: CacheEnvelope<T> = {
    updatedAt: Date.now(),
    data,
  };

  await AsyncStorage.setItem(getStorageKey(key), JSON.stringify(payload));
}

export interface CacheFirstOptions<T> {
  key: string;
  maxAgeMs: number;
  fetcher: () => Promise<T>;
  onBackgroundUpdate?: (value: T) => void;
}

export async function getCacheFirst<T>(options: CacheFirstOptions<T>): Promise<T> {
  const cached = await readCache<T>(options.key);

  if (!cached) {
    const fresh = await options.fetcher();
    await writeCache(options.key, fresh);
    return fresh;
  }

  const cacheAgeMs = Date.now() - cached.updatedAt;

  if (cacheAgeMs <= options.maxAgeMs) {
    return cached.data;
  }

  void refreshInBackground(options);
  return cached.data;
}

async function refreshInBackground<T>(options: CacheFirstOptions<T>) {
  const existing = inFlightRefresh.get(options.key) as Promise<T> | undefined;

  if (existing) {
    return existing;
  }

  const refreshPromise = options
    .fetcher()
    .then(async (fresh) => {
      await writeCache(options.key, fresh);
      options.onBackgroundUpdate?.(fresh);
      return fresh;
    })
    .catch(() => {
      return null;
    })
    .finally(() => {
      inFlightRefresh.delete(options.key);
    });

  inFlightRefresh.set(options.key, refreshPromise);
  return refreshPromise;
}

export async function clearCacheByKey(key: string) {
  await AsyncStorage.removeItem(getStorageKey(key));
}
