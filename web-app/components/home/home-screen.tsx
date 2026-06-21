'use client';

import { useMemo, useState } from 'react';
import { HeroBanner, StreamingProviders, getStreamingProviderName } from '@/components/home';
import { ContentRow } from '@/components/content';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { HeroSkeleton, CardGridSkeleton } from '@/components/ui/skeleton';
import {
  useTrendingContent,
  usePopularContent,
  useTopRatedContent,
  useNewReleases,
} from '@/lib/hooks/use-content';
import type { Content } from '@/lib/tmdb/types';

function withPosterAndLimit(items: Content[], limit: number): Content[] {
  return items.filter((item) => Boolean(item.posterPath)).slice(0, limit);
}

export function HomeScreen() {
  const [selectedProviderId, setSelectedProviderId] = useState<number>(8);

  const providerFilterOptions = useMemo(
    () => ({
      providerId: selectedProviderId,
      region: 'US',
    }),
    [selectedProviderId]
  );

  // Using React Query for automatic caching and deduplication
  const {
    data: providerMovies = [],
    isLoading: isProviderMoviesLoading,
  } = usePopularContent('movie', providerFilterOptions);
  const { data: trending = [], isLoading: isTrendingLoading } = useTrendingContent('day');
  const { data: popularMovies = [], isLoading: isMoviesLoading } = usePopularContent('movie');
  const { data: popularTv = [], isLoading: isTvLoading } = usePopularContent('tv');
  const { data: topRatedMovies = [], isLoading: isTopRatedLoading } = useTopRatedContent('movie');
  const { data: newReleases = [], isLoading: isNewReleasesLoading } = useNewReleases();

  // Determine overall loading state
  const isLoading =
    isProviderMoviesLoading ||
    isTrendingLoading ||
    isMoviesLoading ||
    isTvLoading ||
    isTopRatedLoading ||
    isNewReleasesLoading;

  const providerMoviesData = useMemo(
    () => withPosterAndLimit(providerMovies, 12),
    [providerMovies]
  );
  const topRanked = useMemo(() => withPosterAndLimit(trending, 6), [trending]);
  const newReleasesData = useMemo(() => withPosterAndLimit(newReleases, 12), [newReleases]);
  const popularMoviesData = useMemo(() => withPosterAndLimit(popularMovies, 12), [popularMovies]);
  const popularTvData = useMemo(() => withPosterAndLimit(popularTv, 12), [popularTv]);
  const topRatedMoviesData = useMemo(() => withPosterAndLimit(topRatedMovies, 12), [topRatedMovies]);
  const selectedProviderName = useMemo(
    () => getStreamingProviderName(selectedProviderId),
    [selectedProviderId]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-black pb-10">
      <AmbientBackground />
      <HeroBanner />
      <StreamingProviders
        selectedProviderId={selectedProviderId}
        selectedProviderName={selectedProviderName}
        onSelectProvider={setSelectedProviderId}
      />

      {isLoading ? (
        <div className="relative space-y-8 px-4 pt-6 md:px-8">
          <HeroSkeleton />
          <CardGridSkeleton count={6} />
        </div>
      ) : (
        <div className="relative space-y-6 pt-5">
          <ContentRow title="From This Provider" items={providerMoviesData} hideTitle />
          <ContentRow title="New Releases" items={newReleasesData} />
          <ContentRow title="Top 10 in Nepal Today" items={topRanked} variant="top10" />
          <ContentRow title="Popular Movies" items={popularMoviesData} />
          <ContentRow title="Popular TV Shows" items={popularTvData} />
          <ContentRow title="Top Rated Movies" items={topRatedMoviesData} />
        </div>
      )}
    </div>
  );
}
