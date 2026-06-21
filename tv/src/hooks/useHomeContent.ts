import { useQuery } from '@tanstack/react-query';
import {
  getTrending,
  getPopularMovies,
  getPopularTV,
  getTopRatedMovies,
  getNewReleases,
} from '@/lib/api';
import type { Content } from '@/types/content';

const EMPTY: Content[] = [];

export function useHomeContent(providerId: number) {
  const trendingQuery = useQuery({
    queryKey: ['tv-home', 'trending'],
    queryFn: getTrending,
  });

  const providerQuery = useQuery({
    queryKey: ['tv-home', 'provider', providerId],
    queryFn: () => getPopularMovies({ providerId, region: 'US' }),
  });

  const popularMoviesQuery = useQuery({
    queryKey: ['tv-home', 'popular-movies'],
    queryFn: () => getPopularMovies(),
  });

  const popularTVQuery = useQuery({
    queryKey: ['tv-home', 'popular-tv'],
    queryFn: getPopularTV,
  });

  const topRatedQuery = useQuery({
    queryKey: ['tv-home', 'top-rated'],
    queryFn: getTopRatedMovies,
  });

  const newReleasesQuery = useQuery({
    queryKey: ['tv-home', 'new-releases'],
    queryFn: getNewReleases,
  });

  const queries = [
    trendingQuery,
    providerQuery,
    popularMoviesQuery,
    popularTVQuery,
    topRatedQuery,
    newReleasesQuery,
  ];

  return {
    trending: trendingQuery.data ?? EMPTY,
    providerMovies: providerQuery.data ?? EMPTY,
    popularMovies: popularMoviesQuery.data ?? EMPTY,
    popularTV: popularTVQuery.data ?? EMPTY,
    topRated: topRatedQuery.data ?? EMPTY,
    newReleases: newReleasesQuery.data ?? EMPTY,
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
  };
}
