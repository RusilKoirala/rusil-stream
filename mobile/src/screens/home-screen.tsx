import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ContentRow } from "@/components/ui/content-row";
import { HeroBanner } from "@/components/ui/hero-banner";
import { CARD_HEIGHT, CARD_WIDTH } from "@/components/ui/content-card";
import { SkeletonBox } from "@/components/ui/skeleton-box";
import { useHomeContent } from "@/hooks/use-home-content";
import { colors, radius, space, type as t } from "@/lib/tokens";
import type { RootStackParamList } from "@/navigation/types";
import type { Content } from "@/types/content";

const HOME_TABS = ["Home", "TV Shows", "Movies"] as const;
type HomeTab = (typeof HOME_TABS)[number];

// ─── Skeletons ────────────────────────────────────────────────────────────────

function BannerSkeleton() {
  return <SkeletonBox height={360} borderRadius={0} />;
}

function RowSkeleton() {
  return (
    <View style={s.skeletonSection}>
      <SkeletonBox width={140} height={18} borderRadius={radius.xs} />
      <View style={s.skeletonRow}>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBox
            key={`sk-${i}`}
            width={CARD_WIDTH.row}
            height={CARD_HEIGHT.row}
            borderRadius={radius.md}
          />
        ))}
      </View>
    </View>
  );
}

const LoadingRows = memo(function LoadingRows() {
  return (
    <View>
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
    </View>
  );
});

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const HomeTabs = memo(function HomeTabs({
  selected,
  onSelect,
}: {
  selected: HomeTab;
  onSelect: (tab: HomeTab) => void;
}) {
  return (
    <View style={s.tabsRow}>
      {HOME_TABS.map((tab) => {
        const active = tab === selected;
        return (
          <Pressable
            key={tab}
            onPress={() => onSelect(tab)}
            style={[s.tabPill, active && s.tabPillActive]}
            hitSlop={6}
          >
            <Text style={[s.tabLabel, active && s.tabLabelActive]}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );
});

// ─── Header (logo + search button) ───────────────────────────────────────────

const HomeTopBar = memo(function HomeTopBar({
  onSearchPress,
}: {
  onSearchPress: () => void;
}) {
  return (
    <View style={s.header}>
      <View style={s.headerLeft}>
        <BrandLogo size="sm" />
        <Text style={s.headerTitle}>Rusil Stream</Text>
      </View>
      <Pressable
        style={s.searchBtn}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Search"
        onPress={onSearchPress}
      >
        <Ionicons name="search" color={colors.text100} size={16} />
      </Pressable>
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedTab, setSelectedTab] = useState<HomeTab>("Home");
  const [refreshing, setRefreshing] = useState(false);
  // Only allow pull-to-refresh when the scroll is at the very top
  const [atTop, setAtTop] = useState(true);

  const {
    featured,
    trending,
    continueWatching,
    recommended,
    popularMovies,
    popularTV,
    topRated,
    newReleases,
    isLoading,
    isError,
    refetch,
  } = useHomeContent();

  // ── Tab filtering ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const filter = (items: Content[]) => {
      if (selectedTab === "Movies")   return items.filter((i) => i.type === "movie");
      if (selectedTab === "TV Shows") return items.filter((i) => i.type === "tv");
      return items;
    };
    return {
      trending:         filter(trending),
      continueWatching: filter(continueWatching),
      recommended:      filter(recommended),
      popularMovies:    filter(popularMovies),
      popularTV:        filter(popularTV),
      topRated:         filter(topRated),
      newReleases:      filter(newReleases),
    };
  }, [selectedTab, trending, continueWatching, recommended, popularMovies, popularTV, topRated, newReleases]);

  // ── Callbacks ──────────────────────────────────────────────────────────────
  const openDetails = useCallback(
    (item: Content) => navigation.navigate("Details", { id: item.id, type: item.type }),
    [navigation]
  );

  const openSearch = useCallback(
    () => navigation.navigate("MainTabs" as never, { screen: "Search" } as never),
    [navigation]
  );

  const onFeaturedPlay = useCallback(() => {
    if (!featured) return;
    navigation.navigate("Player", { id: featured.id, type: featured.type, title: featured.title });
  }, [featured, navigation]);

  const onFeaturedDetails = useCallback(() => {
    if (featured) openDetails(featured);
  }, [featured, openDetails]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await refetch(); } finally { setRefreshing(false); }
  }, [refetch]);

  const onScroll = useCallback((e: { nativeEvent: { contentOffset: { y: number } } }) => {
    setAtTop(e.nativeEvent.contentOffset.y <= 0);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <StatusBar style="light" />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        overScrollMode="never"
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={onScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={atTop ? () => void onRefresh() : undefined}
            enabled={atTop}
            tintColor={colors.red}
            colors={[colors.red]}
          />
        }
      >
        {/* ── Top bar (overlaid on banner when loaded) ───────────────── */}
        <HomeTopBar onSearchPress={openSearch} />

        {/* ── Hero banner ────────────────────────────────────────────── */}
        {featured ? (
          <HeroBanner
            item={featured}
            onPlay={onFeaturedPlay}
            onMoreInfo={onFeaturedDetails}
          />
        ) : (
          <BannerSkeleton />
        )}

        {/* ── Filter tabs ────────────────────────────────────────────── */}
        <HomeTabs selected={selectedTab} onSelect={setSelectedTab} />

        {/* ── Error notice ───────────────────────────────────────────── */}
        {isError ? (
          <View style={s.errorWrap}>
            <Text style={s.errorText}>Some sections failed to load. Pull down to retry.</Text>
          </View>
        ) : null}

        {/* ── Content rows ───────────────────────────────────────────── */}
        {isLoading ? (
          <LoadingRows />
        ) : (
          <>
            {/* Continue Watching — show progress bar, no title */}
            <ContentRow
              title="Continue Watching"
              items={filtered.continueWatching}
              onPressItem={openDetails}
              showCardTitle={false}
            />

            {/* Trending Now */}
            <ContentRow
              title="Trending Now"
              items={filtered.trending}
              onPressItem={openDetails}
              showCardTitle={false}
            />

            {/* New Releases */}
            <ContentRow
              title="New Releases"
              items={filtered.newReleases}
              onPressItem={openDetails}
              showCardTitle={false}
            />

            {/* Popular Movies */}
            <ContentRow
              title="Popular Movies"
              items={filtered.popularMovies}
              onPressItem={openDetails}
              showCardTitle={false}
            />

            {/* Popular TV */}
            <ContentRow
              title="Popular TV Shows"
              items={filtered.popularTV}
              onPressItem={openDetails}
              showCardTitle={false}
            />

            {/* Top Rated */}
            <ContentRow
              title="Top Rated"
              items={filtered.topRated}
              onPressItem={openDetails}
              showCardTitle={false}
            />

            {/* Recommended / Because You Watched */}
            <ContentRow
              title="Because You Watched"
              items={filtered.recommended}
              onPressItem={openDetails}
              showCardTitle={false}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingBottom: space[8],
  },

  // Top bar
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space[4],
    paddingTop: space[2],
    paddingBottom: space[3],
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
  },
  headerTitle: {
    fontSize: t.size.base,
    fontWeight: t.weight.bold,
    color: colors.text100,
    letterSpacing: t.tracking.tight,
  },
  searchBtn: {
    borderRadius: radius.full,
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space[2] + 2,
  },

  // Tabs
  tabsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space[2],
    paddingHorizontal: space[4],
    paddingTop: space[4],
    paddingBottom: space[2],
  },
  tabPill: {
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSurface,
  },
  tabPillActive: {
    backgroundColor: colors.redDim,
    borderColor: "rgba(229,9,20,0.35)",
  },
  tabLabel: {
    fontSize: t.size.sm,
    fontWeight: t.weight.semibold,
    color: colors.text60,
  },
  tabLabelActive: {
    color: colors.red,
  },

  // Error
  errorWrap: {
    paddingHorizontal: space[4],
    paddingTop: space[3],
    paddingBottom: space[2],
  },
  errorText: {
    fontSize: t.size.sm,
    color: colors.error,
  },

  // Skeletons
  skeletonSection: {
    marginBottom: space[6],
    gap: space[3],
    paddingHorizontal: space[4],
  },
  skeletonRow: {
    flexDirection: "row",
    gap: space[2] + 2,
  },
});
