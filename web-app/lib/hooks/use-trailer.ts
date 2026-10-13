'use client';

import { useQuery } from '@tanstack/react-query';

interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

interface TrailerResponse {
  results: Video[];
}

/**
 * Fetch trailer/teaser video key from TMDB
 */
async function fetchTrailer(contentId: number, contentType: 'movie' | 'tv'): Promise<string | null> {
  try {
    const response = await fetch(`/api/content/${contentType}/${contentId}/videos`);
    if (!response.ok) return null;
    
    const data: TrailerResponse = await response.json();
    
    // Priority: Official Trailer > Trailer > Teaser > Any video
    const officialTrailer = data.results.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
    );
    
    if (officialTrailer) return officialTrailer.key;
    
    const anyTrailer = data.results.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer'
    );
    
    if (anyTrailer) return anyTrailer.key;
    
    const teaser = data.results.find(
      (v) => v.site === 'YouTube' && v.type === 'Teaser'
    );
    
    if (teaser) return teaser.key;
    
    // Fallback to any YouTube video
    const anyVideo = data.results.find((v) => v.site === 'YouTube');
    return anyVideo?.key || null;
    
  } catch (error) {
    console.error('Failed to fetch trailer:', error);
    return null;
  }
}

/**
 * Hook to fetch and cache trailer video key
 */
export function useTrailer(contentId: number | undefined, contentType: 'movie' | 'tv' | undefined) {
  return useQuery({
    queryKey: ['trailer', contentType, contentId],
    queryFn: () => {
      if (!contentId || !contentType) return null;
      return fetchTrailer(contentId, contentType);
    },
    enabled: !!contentId && !!contentType,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
