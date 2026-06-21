import { useCallback, useMemo, useRef } from 'react';
import { View, ScrollView, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useHomeContent } from '@/hooks/useHomeContent';
import { HeroBanner } from '@/components/home/HeroBanner';
import { ContentRow } from '@/components/home/ContentRow';
import { TVTopNav, type NavTab } from '@/components/ui/TVTopNav';
import { scrollVerticalRowToCenter } from '@/lib/focus-scroll';
import { useNavigation } from '@/navigation/NavigationContext';
import type { Content } from '@/types/content';

interface HomeScreenProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onLogout?: () => void;
  onChangeProfile?: () => void;
}

const NAV_HEIGHT = 84;

function withPoster(items: Content[], limit = 20): Content[] {
  return items.filter((item) => Boolean(item.posterPath)).slice(0, limit);
}

export function HomeScreen({ activeTab, onSelectTab, onLogout, onChangeProfile }: HomeScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const heroRef = useRef<View>(null);
  const { openDetails, openPlayer } = useNavigation();

  const {
    trending,
    popularMovies,
    popularTV,
    topRated,
    newReleases,
    isLoading,
    isError,
  } = useHomeContent(8);

  const heroItems = useMemo(
    () => trending.filter((item) => item.backdropPath || item.posterPath).slice(0, 5),
    [trending],
  );
  const trendRow = useMemo(() => withPoster(trending), [trending]);
  const newRow = useMemo(() => withPoster(newReleases), [newReleases]);
  const moviesRow = useMemo(() => withPoster(popularMovies), [popularMovies]);
  const tvRow = useMemo(() => withPoster(popularTV), [popularTV]);
  const topRow = useMemo(() => withPoster(topRated), [topRated]);

  const scrollRowToCenter = useCallback((rowRef: View) => {
    scrollVerticalRowToCenter(scrollRef.current, contentRef.current, rowRef, NAV_HEIGHT);
  }, []);

  const scrollToHero = useCallback(() => {
    scrollVerticalRowToCenter(scrollRef.current, contentRef.current, heroRef.current, NAV_HEIGHT);
  }, []);

  const openItemDetails = useCallback(
    (item: Content) => openDetails({ id: item.id, type: item.type }),
    [openDetails],
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Unable to load content</Text>
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
        <View ref={heroRef}>
          <TVTopNav active={activeTab} onSelect={onSelectTab} onLogout={onLogout} onChangeProfile={onChangeProfile} />
          <HeroBanner
            items={heroItems}
            onWatch={(item) => openPlayer({ id: item.id, type: item.type, title: item.title })}
            onDetails={(item) => openDetails({ id: item.id, type: item.type })}
            onFocus={scrollToHero}
          />
        </View>

        <View style={styles.rows}>
          <ContentRow title="New Releases" items={newRow} onRowFocus={scrollRowToCenter} onPressItem={openItemDetails} />
          <ContentRow title="Top 10 Trending Today" items={trendRow} showRanks onRowFocus={scrollRowToCenter} onPressItem={openItemDetails} />
          <ContentRow title="Popular Movies" items={moviesRow} onRowFocus={scrollRowToCenter} onPressItem={openItemDetails} />
          <ContentRow title="Popular TV Shows" items={tvRow} onRowFocus={scrollRowToCenter} onPressItem={openItemDetails} />
          <ContentRow title="Top Rated Movies" items={topRow} onRowFocus={scrollRowToCenter} onPressItem={openItemDetails} />
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
