'use client';

import { useCallback, useEffect, useState } from 'react';
import { ContinueWatching, HeroBanner } from '@/components/home';
import { CardGridSkeleton } from '@/components/ui/skeleton';
import { BufferLoader } from '@/components/ui/buffer-loader';
import {
  useTrendingContent,
  usePopularContent,
  useTopRatedContent,
} from '@/lib/hooks/use-content';
import { useQuery } from '@tanstack/react-query';
import type { Content } from '@/lib/tmdb/types';
import { HorizontalContentRow } from '@/components/home';
import { cn } from '@/lib/utils';

export function HomeTab({ isActive = true }: { isActive?: boolean } = {}) {
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
  // Fetch different content categories - using different sources for variety
  const { data: trendingAll = [], isLoading: isTrendingLoading } = useTrendingContent('week');
  const { data: popularMovies = [], isLoading: isPopularMoviesLoading } = usePopularContent('movie');
  const { data: topRatedMovies = [], isLoading: isTopRatedLoading } = useTopRatedContent('movie');
  const { data: popularTV = [], isLoading: isPopularTVLoading } = usePopularContent('tv');

  // Fetch by genre - MORE VARIETY
  const { data: horrorMovies = [], isLoading: isHorrorLoading } = useQuery({
    queryKey: ['genre-movie', 27], // Horror genre ID
    queryFn: async () => {
      const response = await fetch('/api/content/discover?type=movie&genre=27');
      if (!response.ok) throw new Error('Failed to load horror');
      const data = await response.json();
      return (data.results || []) as Content[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: thrillerMovies = [], isLoading: isThrillerLoading } = useQuery({
    queryKey: ['genre-movie', 53], // Thriller genre ID
    queryFn: async () => {
      const response = await fetch('/api/content/discover?type=movie&genre=53');
      if (!response.ok) throw new Error('Failed to load thriller');
      const data = await response.json();
      return (data.results || []) as Content[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: dramaTV = [], isLoading: isDramaLoading } = useQuery({
    queryKey: ['genre-tv', 18], // Drama genre ID
    queryFn: async () => {
      const response = await fetch('/api/content/discover?type=tv&genre=18');
      if (!response.ok) throw new Error('Failed to load drama TV');
      const data = await response.json();
      return (data.results || []) as Content[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: scifiTV = [], isLoading: isScifiLoading } = useQuery({
    queryKey: ['genre-tv', 10765], // Sci-Fi & Fantasy genre ID
    queryFn: async () => {
      const response = await fetch('/api/content/discover?type=tv&genre=10765');
      if (!response.ok) throw new Error('Failed to load sci-fi TV');
      const data = await response.json();
      return (data.results || []) as Content[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: comedyTV = [], isLoading: isComedyLoading } = useQuery({
    queryKey: ['genre-tv', 35], // Comedy genre ID
    queryFn: async () => {
      const response = await fetch('/api/content/discover?type=tv&genre=35');
      if (!response.ok) throw new Error('Failed to load comedy TV');
      const data = await response.json();
      return (data.results || []) as Content[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: animationMovies = [], isLoading: isAnimationLoading } = useQuery({
    queryKey: ['genre-movie', 16], // Animation genre ID
    queryFn: async () => {
      const response = await fetch('/api/content/discover?type=movie&genre=16');
      if (!response.ok) throw new Error('Failed to load animation');
      const data = await response.json();
      return (data.results || []) as Content[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: romanceMovies = [], isLoading: isRomanceLoading } = useQuery({
    queryKey: ['genre-movie', 10749], // Romance genre ID
    queryFn: async () => {
      const response = await fetch('/api/content/discover?type=movie&genre=10749');
      if (!response.ok) throw new Error('Failed to load romance');
      const data = await response.json();
      return (data.results || []) as Content[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: actionMovies = [], isLoading: isActionLoading } = useQuery({
    queryKey: ['genre-movie', 28], // Action genre ID
    queryFn: async () => {
      const response = await fetch('/api/content/discover?type=movie&genre=28');
      if (!response.ok) throw new Error('Failed to load action movies');
      const data = await response.json();
      return (data.results || []) as Content[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: documentaries = [], isLoading: isDocumentariesLoading } = useQuery({
    queryKey: ['genre-movie', 99], // Documentary genre ID
    queryFn: async () => {
      const response = await fetch('/api/content/discover?type=movie&genre=99');
      if (!response.ok) throw new Error('Failed to load documentaries');
      const data = await response.json();
      return (data.results || []) as Content[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: crimeTV = [], isLoading: isCrimeLoading } = useQuery({
    queryKey: ['genre-tv', 80], // Crime genre ID
    queryFn: async () => {
      const response = await fetch('/api/content/discover?type=tv&genre=80');
      if (!response.ok) throw new Error('Failed to load crime TV');
      const data = await response.json();
      return (data.results || []) as Content[];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Only show initial skeleton if primary rows haven't loaded anything yet
  const isInitialLoading = 
    (isTrendingLoading || isPopularMoviesLoading) &&
    trendingAll.length === 0 &&
    popularMovies.length === 0;

  return (
    <div className="relative pb-10">
      {/* Full-screen frosted glass until the home hero is ready */}
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

      <HeroBanner onReady={handleHeroReady} isActive={isActive} />

      <ContinueWatching />

      {isInitialLoading ? (
        <div className="relative space-y-8 px-4 md:px-8">
          <CardGridSkeleton count={6} />
        </div>
      ) : (
        <div className="relative space-y-2">
          {trendingAll.length > 0 && (
            <HorizontalContentRow title="Trending This Week" items={trendingAll} enableVideoPreview />
          )}
          {popularMovies.length > 0 && (
            <HorizontalContentRow title="Popular Movies" items={popularMovies} enableVideoPreview />
          )}
          {topRatedMovies.length > 0 && (
            <HorizontalContentRow title="Top Rated" items={topRatedMovies} enableVideoPreview />
          )}
          {popularTV.length > 0 && (
            <HorizontalContentRow title="Popular TV Shows" items={popularTV} enableVideoPreview />
          )}
          {horrorMovies.length > 0 && (
            <HorizontalContentRow title="Horror Movies" items={horrorMovies} enableVideoPreview />
          )}
          {thrillerMovies.length > 0 && (
            <HorizontalContentRow title="Thrillers" items={thrillerMovies} enableVideoPreview />
          )}
          {dramaTV.length > 0 && (
            <HorizontalContentRow title="Drama Series" items={dramaTV} enableVideoPreview />
          )}
          {scifiTV.length > 0 && (
            <HorizontalContentRow title="Sci-Fi & Fantasy" items={scifiTV} enableVideoPreview />
          )}
          {comedyTV.length > 0 && (
            <HorizontalContentRow title="Comedy Shows" items={comedyTV} enableVideoPreview />
          )}
          {animationMovies.length > 0 && (
            <HorizontalContentRow title="Animated Films" items={animationMovies} enableVideoPreview />
          )}
          {romanceMovies.length > 0 && (
            <HorizontalContentRow title="Romance Movies" items={romanceMovies} enableVideoPreview />
          )}
          {actionMovies.length > 0 && (
            <HorizontalContentRow title="Action Movies" items={actionMovies} enableVideoPreview />
          )}
          {documentaries.length > 0 && (
            <HorizontalContentRow title="Documentaries" items={documentaries} enableVideoPreview />
          )}
          {crimeTV.length > 0 && (
            <HorizontalContentRow title="Crime TV" items={crimeTV} enableVideoPreview />
          )}
        </div>
      )}
    </div>
  );
}
