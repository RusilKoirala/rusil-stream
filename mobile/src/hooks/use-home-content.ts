import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getHomeContinueWatching,
  getHomeFeatured,
  getHomeRecommended,
  getHomeTrending,
  getNewReleases,
  getPopularMovies,
  getPopularTV,
  getTopRatedMovies,
} from "@/lib/api";
import { readCache, writeCache } from "@/lib/persistent-cache";
import type { Content } from "@/types/content";

function sectionKey(section: string) {
  return `home-v3/${section}`;
}

async function loadFromCacheOrNetwork<T>(section: string, fetcher: () => Promise<T>) {
  const cached = await readCache<T>(sectionKey(section));
  if (cached) {
    return cached.data;
  }

  const fresh = await fetcher();
  await writeCache(sectionKey(section), fresh);
  return fresh;
}

async function refreshAndReplaceCache<T>(section: string, fetcher: () => Promise<T>) {
  const fresh = await fetcher();
  await writeCache(sectionKey(section), fresh);
  return fresh;
}

export function useHomeContent() {
  const queryClient = useQueryClient();

  const featuredQuery = useQuery({
    queryKey: ["home-v3", "featured"],
    queryFn: () => loadFromCacheOrNetwork("featured", getHomeFeatured),
    staleTime: Infinity,
  });

  const trendingQuery = useQuery({
    queryKey: ["home-v3", "trending"],
    queryFn: () => loadFromCacheOrNetwork("trending", getHomeTrending),
    staleTime: Infinity,
  });

  const rowsEnabled = Boolean(featuredQuery.data || (trendingQuery.data?.length ?? 0) > 0);

  const continueQuery = useQuery({
    queryKey: ["home-v3", "continue"],
    queryFn: () => loadFromCacheOrNetwork("continue", getHomeContinueWatching),
    staleTime: Infinity,
    enabled: rowsEnabled,
  });

  const recommendedQuery = useQuery({
    queryKey: ["home-v3", "recommended"],
    queryFn: () => loadFromCacheOrNetwork("recommended", getHomeRecommended),
    staleTime: Infinity,
    enabled: rowsEnabled,
  });

  const popularMoviesQuery = useQuery({
    queryKey: ["home-v3", "popular-movies"],
    queryFn: () => loadFromCacheOrNetwork("popular-movies", () => getPopularMovies()),
    staleTime: Infinity,
    enabled: rowsEnabled,
  });

  const popularTVQuery = useQuery({
    queryKey: ["home-v3", "popular-tv"],
    queryFn: () => loadFromCacheOrNetwork("popular-tv", () => getPopularTV()),
    staleTime: Infinity,
    enabled: rowsEnabled,
  });

  const topRatedQuery = useQuery({
    queryKey: ["home-v3", "top-rated"],
    queryFn: () => loadFromCacheOrNetwork("top-rated", () => getTopRatedMovies()),
    staleTime: Infinity,
    enabled: rowsEnabled,
  });

  const newReleasesQuery = useQuery({
    queryKey: ["home-v3", "new-releases"],
    queryFn: () => loadFromCacheOrNetwork("new-releases", () => getNewReleases()),
    staleTime: Infinity,
    enabled: rowsEnabled,
  });

  const refetch = async () => {
    await Promise.all([
      queryClient.fetchQuery({
        queryKey: ["home-v3", "featured"],
        queryFn: () => refreshAndReplaceCache("featured", getHomeFeatured),
        staleTime: Infinity,
      }),
      queryClient.fetchQuery({
        queryKey: ["home-v3", "trending"],
        queryFn: () => refreshAndReplaceCache("trending", getHomeTrending),
        staleTime: Infinity,
      }),
      queryClient.fetchQuery({
        queryKey: ["home-v3", "continue"],
        queryFn: () => refreshAndReplaceCache("continue", getHomeContinueWatching),
        staleTime: Infinity,
      }),
      queryClient.fetchQuery({
        queryKey: ["home-v3", "recommended"],
        queryFn: () => refreshAndReplaceCache("recommended", getHomeRecommended),
        staleTime: Infinity,
      }),
      queryClient.fetchQuery({
        queryKey: ["home-v3", "popular-movies"],
        queryFn: () => refreshAndReplaceCache("popular-movies", () => getPopularMovies()),
        staleTime: Infinity,
      }),
      queryClient.fetchQuery({
        queryKey: ["home-v3", "popular-tv"],
        queryFn: () => refreshAndReplaceCache("popular-tv", () => getPopularTV()),
        staleTime: Infinity,
      }),
      queryClient.fetchQuery({
        queryKey: ["home-v3", "top-rated"],
        queryFn: () => refreshAndReplaceCache("top-rated", () => getTopRatedMovies()),
        staleTime: Infinity,
      }),
      queryClient.fetchQuery({
        queryKey: ["home-v3", "new-releases"],
        queryFn: () => refreshAndReplaceCache("new-releases", () => getNewReleases()),
        staleTime: Infinity,
      }),
    ]);
  };

  return {
    featured: (featuredQuery.data as Content | null | undefined) ?? null,
    trending: (trendingQuery.data as Content[] | undefined) ?? [],
    continueWatching: (continueQuery.data as Content[] | undefined) ?? [],
    recommended: (recommendedQuery.data as Content[] | undefined) ?? [],
    popularMovies: (popularMoviesQuery.data as Content[] | undefined) ?? [],
    popularTV: (popularTVQuery.data as Content[] | undefined) ?? [],
    topRatedMovies: (topRatedQuery.data as Content[] | undefined) ?? [],
    newReleases: (newReleasesQuery.data as Content[] | undefined) ?? [],
    isCoreLoading: featuredQuery.isLoading || trendingQuery.isLoading,
    isRowsLoading:
      continueQuery.isLoading ||
      recommendedQuery.isLoading ||
      popularMoviesQuery.isLoading ||
      popularTVQuery.isLoading ||
      topRatedQuery.isLoading ||
      newReleasesQuery.isLoading,
    isLoading:
      featuredQuery.isLoading ||
      trendingQuery.isLoading ||
      continueQuery.isLoading ||
      recommendedQuery.isLoading ||
      popularMoviesQuery.isLoading ||
      popularTVQuery.isLoading ||
      topRatedQuery.isLoading ||
      newReleasesQuery.isLoading,
    isError:
      featuredQuery.isError ||
      trendingQuery.isError ||
      continueQuery.isError ||
      recommendedQuery.isError ||
      popularMoviesQuery.isError ||
      popularTVQuery.isError ||
      topRatedQuery.isError ||
      newReleasesQuery.isError,
    refetch,
  };
}
