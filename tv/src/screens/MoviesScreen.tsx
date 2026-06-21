import { useCallback, useMemo, useRef } from 'react';
import { View, ScrollView, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ContentRow } from '@/components/home/ContentRow';
import { TVTopNav, type NavTab } from '@/components/ui/TVTopNav';
import { scrollVerticalRowToCenter } from '@/lib/focus-scroll';
import { useNavigation } from '@/navigation/NavigationContext';
import { getPopularMovies, getTopRatedMovies, getNewReleases, getTrending } from '@/lib/api';
import type { Content } from '@/types/content';

interface MoviesScreenProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onLogout?: () => void;
  onChangeProfile?: () => void;
}

const NAV_HEIGHT = 84;
const EMPTY: Content[] = [];

function withPoster(items: Content[], limit = 20): Content[] {
  return items.filter((item) => Boolean(item.posterPath)).slice(0, limit);
}

export function MoviesScreen({ activeTab, onSelectTab, onLogout, onChangeProfile }: MoviesScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const { openDetails } = useNavigation();

  const popularQuery = useQuery({
    queryKey: ['movies-popular'],
    queryFn: () => getPopularMovies(),
  });

  const topRatedQuery = useQuery({
    queryKey: ['movies-top-rated'],
    queryFn: getTopRatedMovies,
  });

  const newReleasesQuery = useQuery({
    queryKey: ['movies-new-releases'],
    queryFn: getNewReleases,
  });

  const trendingQuery = useQuery({
    queryKey: ['movies-trending'],
    queryFn: getTrending,
  });

  const popular = useMemo(() => withPoster(popularQuery.data ?? EMPTY), [popularQuery.data]);
  const topRated = useMemo(() => withPoster(topRatedQuery.data ?? EMPTY), [topRatedQuery.data]);
  const newReleases = useMemo(() => withPoster(newReleasesQuery.data ?? EMPTY), [newReleasesQuery.data]);
  const trendingMovies = useMemo(
    () => withPoster((trendingQuery.data ?? EMPTY).filter((i) => i.type === 'movie')),
    [trendingQuery.data],
  );

  const isLoading = popularQuery.isLoading || topRatedQuery.isLoading || newReleasesQuery.isLoading || trendingQuery.isLoading;
  const isError = popularQuery.isError || topRatedQuery.isError || newReleasesQuery.isError || trendingQuery.isError;

  const scrollRowToCenter = useCallback((rowRef: View) => {
    scrollVerticalRowToCenter(scrollRef.current, contentRef.current, rowRef, NAV_HEIGHT);
  }, []);

  const openItemDetails = useCallback(
    (item: Content) => openDetails({ id: item.id, type: item.type }),
    [openDetails],
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Loading movies…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Unable to load movies</Text>
        <Text style={styles.errorSub}>Check your connection and try again.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View ref={contentRef}>
        <TVTopNav active={activeTab} onSelect={onSelectTab} onLogout={onLogout} onChangeProfile={onChangeProfile} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Movies</Text>
        </View>

        <View style={styles.rows}>
          <ContentRow title="Trending Movies" items={trendingMovies} showRanks onRowFocus={scrollRowToCenter} onPressItem={openItemDetails} />
          <ContentRow title="Popular Movies" items={popular} onRowFocus={scrollRowToCenter} onPressItem={openItemDetails} />
          <ContentRow title="New Releases" items={newReleases} onRowFocus={scrollRowToCenter} onPressItem={openItemDetails} />
          <ContentRow title="Top Rated Movies" items={topRated} onRowFocus={scrollRowToCenter} onPressItem={openItemDetails} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#050505',
  },
  content: {
    paddingTop: 0,
    paddingBottom: 60,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 56,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  rows: {
    gap: 24,
    paddingTop: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050505',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    marginTop: 12,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  errorSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 8,
  },
});
