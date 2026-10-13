'use client';

import { useCallback, useEffect, useState } from 'react';
import { HeroBanner, HorizontalContentRow } from '@/components/home';
import { CardGridSkeleton } from '@/components/ui/skeleton';
import { BufferLoader } from '@/components/ui/buffer-loader';
import {
  usePopularContent,
  useTopRatedContent,
  useNewReleases,
} from '@/lib/hooks/use-content';
import { useQuery } from '@tanstack/react-query';
import type { Content } from '@/lib/tmdb/types';
import { cn } from '@/lib/utils';

function useGenreMovies(genreId: number, label: string) {
  return useQuery({
    queryKey: ['genre-movie', genreId],
    queryFn: async () => {
      const response = await fetch(`/api/content/discover?type=movie&genre=${genreId}`);
      if (!response.ok) throw new Error(`Failed to load ${label}`);
      const data = await response.json();
      return (data.results || []) as Content[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function MoviesTab({ isActive = true }: { isActive?: boolean } = {}) {
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

  const { data: popularMovies = [], isLoading: isPopularLoading } = usePopularContent('movie');
  const { data: topRatedMovies = [], isLoading: isTopRatedLoading } = useTopRatedContent('movie');
  const { data: newReleases = [], isLoading: isNewReleasesLoading } = useNewReleases();

  const { data: actionMovies = [] } = useGenreMovies(28, 'action');
  const { data: comedyMovies = [] } = useGenreMovies(35, 'comedy');
  const { data: horrorMovies = [] } = useGenreMovies(27, 'horror');
  const { data: thrillerMovies = [] } = useGenreMovies(53, 'thriller');
  const { data: animationMovies = [] } = useGenreMovies(16, 'animation');
  const { data: romanceMovies = [] } = useGenreMovies(10749, 'romance');
  const { data: scifiMovies = [] } = useGenreMovies(878, 'sci-fi');
  const { data: documentaries = [] } = useGenreMovies(99, 'documentaries');

  const isInitialLoading =
    (isPopularLoading || isTopRatedLoading || isNewReleasesLoading) &&
    popularMovies.length === 0 &&
    topRatedMovies.length === 0;

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

      <HeroBanner contentType="movie" onReady={handleHeroReady} isActive={isActive} />

      {isInitialLoading ? (
        <div className="relative space-y-8 px-4 md:px-8">
          <CardGridSkeleton count={6} />
        </div>
      ) : (
        <div className="relative space-y-2">
          {popularMovies.length > 0 && (
            <HorizontalContentRow title="Popular Movies" items={popularMovies} enableVideoPreview />
          )}
          {topRatedMovies.length > 0 && (
            <HorizontalContentRow title="Top Rated" items={topRatedMovies} enableVideoPreview />
          )}
          {newReleases.length > 0 && (
            <HorizontalContentRow title="New Releases" items={newReleases} enableVideoPreview />
          )}
          {actionMovies.length > 0 && (
            <HorizontalContentRow title="Action" items={actionMovies} enableVideoPreview />
          )}
          {comedyMovies.length > 0 && (
            <HorizontalContentRow title="Comedy" items={comedyMovies} enableVideoPreview />
          )}
          {horrorMovies.length > 0 && (
            <HorizontalContentRow title="Horror" items={horrorMovies} enableVideoPreview />
          )}
          {thrillerMovies.length > 0 && (
            <HorizontalContentRow title="Thrillers" items={thrillerMovies} enableVideoPreview />
          )}
          {animationMovies.length > 0 && (
            <HorizontalContentRow title="Animation" items={animationMovies} enableVideoPreview />
          )}
          {romanceMovies.length > 0 && (
            <HorizontalContentRow title="Romance" items={romanceMovies} enableVideoPreview />
          )}
          {scifiMovies.length > 0 && (
            <HorizontalContentRow title="Sci-Fi" items={scifiMovies} enableVideoPreview />
          )}
          {documentaries.length > 0 && (
            <HorizontalContentRow title="Documentaries" items={documentaries} enableVideoPreview />
          )}
        </div>
      )}
    </div>
  );
}
