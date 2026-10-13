'use client';

import { useCallback, useEffect, useState } from 'react';
import { HeroBanner, HorizontalContentRow } from '@/components/home';
import { CardGridSkeleton } from '@/components/ui/skeleton';
import { BufferLoader } from '@/components/ui/buffer-loader';
import {
  usePopularContent,
  useTopRatedContent,
} from '@/lib/hooks/use-content';
import { useQuery } from '@tanstack/react-query';
import type { Content } from '@/lib/tmdb/types';
import { cn } from '@/lib/utils';

function useGenreTV(genreId: number, label: string) {
  return useQuery({
    queryKey: ['genre-tv', genreId],
    queryFn: async () => {
      const response = await fetch(`/api/content/discover?type=tv&genre=${genreId}`);
      if (!response.ok) throw new Error(`Failed to load ${label}`);
      const data = await response.json();
      return (data.results || []) as Content[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function TvTab({ isActive = true }: { isActive?: boolean } = {}) {
  const [isHeroReady, setIsHeroReady] = useState(false);
  const [showFrost, setShowFrost] = useState(true);
  const [frostOpaque, setFrostOpaque] = useState(true);

  const handleHeroReady = useCallback((ready: boolean) => {
    setIsHeroReady(ready);
  }, []);

  useEffect(() => {
    if (!isHeroReady) {
      setShowFrost(true);
      setFrostOpaque(true);
      return;
    }
    setFrostOpaque(false);
    const timer = setTimeout(() => setShowFrost(false), 450);
    return () => clearTimeout(timer);
  }, [isHeroReady]);

  const { data: popularTV = [], isLoading: isPopularLoading } = usePopularContent('tv');
  const { data: topRatedTV = [], isLoading: isTopRatedLoading } = useTopRatedContent('tv');

  const { data: dramaTV = [] } = useGenreTV(18, 'drama');
  const { data: comedyTV = [] } = useGenreTV(35, 'comedy');
  const { data: scifiTV = [] } = useGenreTV(10765, 'sci-fi');
  const { data: crimeTV = [] } = useGenreTV(80, 'crime');
  const { data: actionTV = [] } = useGenreTV(10759, 'action');
  const { data: mysteryTV = [] } = useGenreTV(9648, 'mystery');
  const { data: animationTV = [] } = useGenreTV(16, 'animation');
  const { data: realityTV = [] } = useGenreTV(10764, 'reality');

  const isInitialLoading =
    (isPopularLoading || isTopRatedLoading) &&
    popularTV.length === 0 &&
    topRatedTV.length === 0;

  return (
    <div className="relative pb-10">
      {showFrost && (
        <BufferLoader
          fullscreen
          size="md"
          message="Loading..."
          className={cn(
            'transition-opacity duration-500 ease-out',
            frostOpaque ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        />
      )}

      <HeroBanner contentType="tv" onReady={handleHeroReady} isActive={isActive} />

      {isInitialLoading ? (
        <div className="relative space-y-8 px-4 md:px-8">
          <CardGridSkeleton count={6} />
        </div>
      ) : (
        <div className="relative space-y-2">
          {popularTV.length > 0 && (
            <HorizontalContentRow title="Popular TV Shows" items={popularTV} enableVideoPreview />
          )}
          {topRatedTV.length > 0 && (
            <HorizontalContentRow title="Top Rated" items={topRatedTV} enableVideoPreview />
          )}
          {dramaTV.length > 0 && (
            <HorizontalContentRow title="Drama Series" items={dramaTV} enableVideoPreview />
          )}
          {comedyTV.length > 0 && (
            <HorizontalContentRow title="Comedy Shows" items={comedyTV} enableVideoPreview />
          )}
          {scifiTV.length > 0 && (
            <HorizontalContentRow title="Sci-Fi & Fantasy" items={scifiTV} enableVideoPreview />
          )}
          {crimeTV.length > 0 && (
            <HorizontalContentRow title="Crime" items={crimeTV} enableVideoPreview />
          )}
          {actionTV.length > 0 && (
            <HorizontalContentRow title="Action & Adventure" items={actionTV} enableVideoPreview />
          )}
          {mysteryTV.length > 0 && (
            <HorizontalContentRow title="Mystery" items={mysteryTV} enableVideoPreview />
          )}
          {animationTV.length > 0 && (
            <HorizontalContentRow title="Animation" items={animationTV} enableVideoPreview />
          )}
          {realityTV.length > 0 && (
            <HorizontalContentRow title="Reality" items={realityTV} enableVideoPreview />
          )}
        </div>
      )}
    </div>
  );
}
