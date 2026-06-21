'use client';

import { useQuery } from '@tanstack/react-query';

interface UseContentOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  providerId?: number | null;
  region?: string;
}

function buildContentUrl(path: string, options?: UseContentOptions, baseParams?: Record<string, string>) {
  const searchParams = new URLSearchParams(baseParams);

  if (options?.providerId) {
    searchParams.set('provider', String(options.providerId));
    searchParams.set('region', (options.region || 'US').toUpperCase());
  }

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

export function useTrendingContent(timeWindow = 'day', options?: UseContentOptions) {
  return useQuery({
    queryKey: ['trending', timeWindow, options?.providerId ?? null, (options?.region || 'US').toUpperCase()],
    queryFn: async () => {
      const response = await fetch(buildContentUrl('/api/content/trending', options, { timeWindow }), {
        cache: 'default', // Use browser cache instead of 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch trending content');
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
    enabled: options?.enabled !== false,
    ...options,
  });
}

export function usePopularContent(type = 'movie', options?: UseContentOptions) {
  return useQuery({
    queryKey: ['popular', type, options?.providerId ?? null, (options?.region || 'US').toUpperCase()],
    queryFn: async () => {
      const response = await fetch(buildContentUrl('/api/content/popular', options, { type }), {
        cache: 'default',
      });
      if (!response.ok) throw new Error('Failed to fetch popular content');
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    enabled: options?.enabled !== false,
    ...options,
  });
}

export function useTopRatedContent(type = 'movie', options?: UseContentOptions) {
  return useQuery({
    queryKey: ['top-rated', type, options?.providerId ?? null, (options?.region || 'US').toUpperCase()],
    queryFn: async () => {
      const response = await fetch(buildContentUrl('/api/content/top-rated', options, { type }), {
        cache: 'default',
      });
      if (!response.ok) throw new Error('Failed to fetch top-rated content');
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    enabled: options?.enabled !== false,
    ...options,
  });
}

export function useNewReleases(options?: UseContentOptions) {
  return useQuery({
    queryKey: ['new-releases', options?.providerId ?? null, (options?.region || 'US').toUpperCase()],
    queryFn: async () => {
      const response = await fetch(buildContentUrl('/api/content/new-releases', options), {
        cache: 'default',
      });
      if (!response.ok) throw new Error('Failed to fetch new releases');
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    enabled: options?.enabled !== false,
    ...options,
  });
}

export function useContentSearch(query: string, options?: UseContentOptions) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: ['search', normalizedQuery],
    queryFn: async () => {
      const response = await fetch(
        `/api/content/search?query=${encodeURIComponent(normalizedQuery)}`,
        { cache: 'default' }
      );
      if (!response.ok) throw new Error('Failed to search content');
      const data = await response.json();

      // API may return SearchResults object ({ movies, tvShows, people })
      // while UI expects a flat list for ContentCard rendering.
      if (Array.isArray(data)) {
        return data;
      }

      const movies = Array.isArray(data?.movies) ? data.movies : [];
      const tvShows = Array.isArray(data?.tvShows) ? data.tvShows : [];

      return [...movies, ...tvShows];
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    enabled: normalizedQuery.length >= 2 && options?.enabled !== false,
    ...options,
  });
}

export function useContentDetails(id: string | number, options?: UseContentOptions) {
  return useQuery({
    queryKey: ['content', id],
    queryFn: async () => {
      const response = await fetch(
        `/api/content/${id}`,
        { cache: 'default' }
      );
      if (!response.ok) throw new Error('Failed to fetch content details');
      return response.json();
    },
    staleTime: 1000 * 60 * 30, // Longer since details don't change often
    gcTime: 1000 * 60 * 120,
    enabled: !!id && options?.enabled !== false,
    ...options,
  });
}
