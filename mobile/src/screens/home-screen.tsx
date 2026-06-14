import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, InteractionManager, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import Animated, {
  interpolate,
  Extrapolation,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ContentRow } from "@/components/ui/content-row";
import { HeroBanner } from "@/components/ui/hero-banner";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { ScreenReveal } from "@/components/ui/screen-reveal";
import { SkeletonBox } from "@/components/ui/skeleton-box";
import { getContentLogoPath, resolveApiAssetUrl } from "@/lib/api";
import { useHomeContent } from "@/hooks/use-home-content";
import { useNetworkStatus } from "@/hooks/use-network-status";
import type { RootStackParamList } from "@/navigation/types";
import type { Content } from "@/types/content";

const HOME_FILTERS = ["For You", "Movies", "TV"] as const;
type HomeFilter = (typeof HOME_FILTERS)[number];

/** Skeleton row: title bar + 4 card placeholders */
function SkeletonContentRow() {
  return (
    <View className="mb-6">
      {/* Title bar */}
      <View className="mb-3 px-4">
        <SkeletonBox height={18} width={140} borderRadius={6} />
      </View>
      {/* 4 card placeholders */}
      <View className="flex-row gap-3 px-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonBox key={i} width={110} height={165} borderRadius={8} />
        ))}
      </View>
    </View>
  );
}

function HeroGateSkeleton() {
  return (
    <View className="flex-1 bg-black">
      <SkeletonBox height={500} borderRadius={0} />
      <View className="px-4 pt-4">
        <SkeletonContentRow />
      </View>
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<HomeFilter>("For You");
  const [refreshing, setRefreshing] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroReadyItems, setHeroReadyItems] = useState<Content[]>([]);
  const [heroLogoMap, setHeroLogoMap] = useState<Record<string, string>>({});
  const { isOffline } = useNetworkStatus();

  const {
    featured,
    trending,
    continueWatching,
    recommended,
    popularMovies,
    popularTV,
    topRatedMovies,
    newReleases,
    isCoreLoading,
    isRowsLoading,
    isLoading,
    isError,
    refetch,
  } = useHomeContent();

  // Determine if we have any cached data to show
  const hasCachedData = useMemo(
    () =>
      featured !== null ||
      trending.length > 0 ||
      continueWatching.length > 0 ||
      recommended.length > 0 ||
      popularMovies.length > 0 ||
      popularTV.length > 0 ||
      topRatedMovies.length > 0 ||
      newReleases.length > 0,
    [featured, trending, continueWatching, recommended, popularMovies, popularTV, topRatedMovies, newReleases]
  );

  const showSkeleton = isLoading && !hasCachedData;

  const heroItems = useMemo(() => {
    const seeded = [featured, ...trending, ...recommended, ...popularMovies]
      .filter(Boolean) as Content[];
    const unique = seeded.filter(
      (item, index, arr) =>
        arr.findIndex((x) => x.id === item.id && x.type === item.type) === index
    );
    return unique.slice(0, 6);
  }, [featured, trending, recommended, popularMovies]);

  useEffect(() => {
    if (heroItems.length === 0) {
      setHeroReadyItems([]);
      setHeroLogoMap({});
      return;
    }

    let cancelled = false;

    const resolveHeroItemsWithLogo = async () => {
      const checks = await Promise.all(
        heroItems.map(async (item) => {
          try {
            const logoPath = await getContentLogoPath(item.id, item.type);
            const resolvedLogo = resolveApiAssetUrl(logoPath);
            return resolvedLogo
              ? {
                  item,
                  key: `${item.type}:${item.id}`,
                  logo: resolvedLogo,
                }
              : null;
          } catch {
            return null;
          }
        })
      );

      if (cancelled) return;

      const valid = checks.filter(
        (entry): entry is { item: Content; key: string; logo: string } => Boolean(entry)
      );
      const nextLogoMap: Record<string, string> = {};
      valid.forEach((entry) => {
        nextLogoMap[entry.key] = entry.logo;
      });
      setHeroReadyItems(valid.map((entry) => entry.item));
      setHeroLogoMap(nextLogoMap);
    };

    void resolveHeroItemsWithLogo();

    return () => {
      cancelled = true;
    };
  }, [heroItems]);

  const filtered = useMemo(() => {
    const byFilter = (items: Content[]) => {
      if (selectedFilter === "Movies") return items.filter((item) => item.type === "movie");
      if (selectedFilter === "TV") return items.filter((item) => item.type === "tv");
      return items;
    };

    return {
      continueWatching: byFilter(continueWatching),
      trending: byFilter(trending),
      recommended: byFilter(recommended),
      popularMovies: byFilter(popularMovies),
      popularTV: byFilter(popularTV),
      topRatedMovies: byFilter(topRatedMovies),
      newReleases: byFilter(newReleases),
    };
  }, [continueWatching, newReleases, popularMovies, popularTV, recommended, selectedFilter, topRatedMovies, trending]);

  // Hero auto-rotation every 6s
  useEffect(() => {
    if (heroReadyItems.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroReadyItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroReadyItems.length]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const openDetails = useCallback(
    (item: Content) => {
      navigation.navigate("Details", { id: item.id, type: item.type });
    },
    [navigation]
  );

  // Reanimated scroll offset for floating top bar fade
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  useFocusEffect(
    useCallback(() => {
      let timer: ReturnType<typeof setTimeout> | null = null;
      const interaction = InteractionManager.runAfterInteractions(() => {
        setHeroIndex(0);
        scrollRef.current?.scrollTo?.({ x: 0, y: 0, animated: false });

        // A second reset shortly after mount prevents stale preserved tab offsets.
        timer = setTimeout(() => {
          scrollRef.current?.scrollTo?.({ x: 0, y: 0, animated: false });
        }, 120);
      });

      return () => {
        if (timer) clearTimeout(timer);
        interaction.cancel();
      };
    }, [scrollRef])
  );

  useEffect(() => {
    const heroPosters = (heroReadyItems.length > 0 ? heroReadyItems : heroItems)
      .map((item) => item.backdropPath || item.posterPath)
      .filter((path): path is string => Boolean(path));

    const rowImages = [
      ...filtered.trending,
      ...filtered.recommended,
      ...filtered.popularMovies,
      ...filtered.popularTV,
    ]
      .slice(0, 36)
      .map((item) => item.posterPath || item.backdropPath)
      .filter((path): path is string => Boolean(path));

    const uniqueUris = Array.from(new Set([...heroPosters, ...rowImages]));
    uniqueUris.forEach((uri) => {
      void Image.prefetch(uri);
    });

    (heroReadyItems.length > 0 ? heroReadyItems : heroItems).slice(0, 4).forEach((item) => {
      void getContentLogoPath(item.id, item.type)
        .then((path) => resolveApiAssetUrl(path))
        .then((uri) => {
          if (uri) {
            void Image.prefetch(uri);
          }
        })
        .catch(() => {
          // Prefetch failures should never block rendering.
        });
    });
  }, [filtered, heroItems, heroReadyItems]);

  const topBarSolidStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollOffset.value, [0, 120], [0, 0.95], "clamp"),
  }));

  const heroParallaxStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollOffset.value, [-140, 0, 260], [18, 0, -36], Extrapolation.CLAMP);
    const scale = interpolate(scrollOffset.value, [-140, 0], [1.06, 1], Extrapolation.CLAMP);
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const rows = useMemo(() => {
    const candidates: Array<{
      key: string;
      title: string;
      items: Content[];
      showRanking?: boolean;
      largeRanking?: boolean;
    }> = [
      { key: "recommended", title: "From Your Taste", items: filtered.recommended.slice(0, 14) },
      { key: "newReleases", title: "New Releases", items: filtered.newReleases.slice(0, 16) },
      { key: "trending", title: "Top 10 in Nepal Today", items: filtered.trending.slice(0, 10), showRanking: true, largeRanking: true },
      { key: "continue", title: "Continue Watching", items: filtered.continueWatching },
      { key: "popularMovies", title: "Popular Movies", items: filtered.popularMovies.slice(0, 16) },
      { key: "popularTV", title: "Popular TV Shows", items: filtered.popularTV.slice(0, 16) },
      { key: "topRated", title: "Top Rated Movies", items: filtered.topRatedMovies.slice(0, 16) },
    ];

    const seenSignatures = new Set<string>();

    return candidates.filter((row) => {
      if (row.items.length === 0) return false;
      const signature = row.items
        .slice(0, 10)
        .map((item) => `${item.type}:${item.id}`)
        .join("|");

      if (!signature || seenSignatures.has(signature)) {
        return false;
      }

      seenSignatures.add(signature);
      return true;
    });
  }, [filtered]);

  const hasTrending = filtered.trending.length > 0;
  const hasHeroReady = heroReadyItems.length > 0;
  const shouldBlockUntilHero = isCoreLoading || (!hasHeroReady && heroItems.length > 0);
  const shouldShowTrendingOnly = hasHeroReady && (isRowsLoading || !hasTrending);

  if (shouldBlockUntilHero) {
    return (
      <SafeAreaView className="flex-1 bg-black" edges={["top", "bottom"]}>
        <StatusBar style="light" />
        <HeroGateSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["bottom"]}>
      <StatusBar style="light" />
      <View style={{ position: "absolute", inset: 0, backgroundColor: "#000000" }} />

      {/* Overlay banner so hidden state does not reserve layout space */}
      <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: insets.top, zIndex: 30 }}>
        <OfflineBanner visible={isOffline} />
      </View>

      <ScreenReveal className="flex-1">
        <Animated.ScrollView
          ref={scrollRef}
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void onRefresh()}
              tintColor="#C7D5EA"
            />
          }
          contentContainerStyle={{ paddingBottom: 28 }}
          scrollEventThrottle={16}
        >
          {/* Floating top bar */}
          <Animated.View
            style={{ paddingTop: insets.top + 6, paddingBottom: 8 }}
            className="absolute left-0 right-0 top-0 z-20 px-4"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.85)", "rgba(0,0,0,0.45)", "rgba(0,0,0,0)"]}
              locations={[0, 0.64, 1]}
              style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
              pointerEvents="none"
            />
            <Animated.View
              pointerEvents="none"
              style={[topBarSolidStyle, { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.78)" }]}
            />

            <View className="relative z-10 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <BrandLogo size="sm" styleVariant="web-navbar" />
                <Text className="text-[10px] font-semibold uppercase tracking-[2.8px] text-white">Rusil Stream</Text>
              </View>

              <View className="flex-row items-center gap-2.5">
                <Pressable
                  className="rounded-full bg-black/35 p-2.5"
                  onPress={() => navigation.navigate("AppSettings")}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Notifications"
                >
                  <Ionicons name="notifications-outline" size={16} color="#FFF" />
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {/* Hero section */}
          <Animated.View style={heroParallaxStyle}>
            {heroReadyItems.length > 0 ? (
              <HeroBanner
                items={heroReadyItems}
                activeIndex={heroIndex}
                logoPathMap={heroLogoMap}
                onPlay={(item) =>
                  navigation.navigate("Player", {
                    id: item.id,
                    type: item.type,
                    title: item.title,
                  })
                }
                onMoreInfo={(item) => openDetails(item)}
              />
            ) : null}
          </Animated.View>

          <View className="mb-2 mt-0">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
            >
              {HOME_FILTERS.map((filter) => {
                const active = filter === selectedFilter;
                return (
                  <Pressable
                    key={filter}
                    onPress={() => setSelectedFilter(filter)}
                    accessibilityRole="button"
                    accessibilityLabel={`${filter} filter`}
                    accessibilityState={{ selected: active }}
                    className={`rounded-full border px-4 py-2 ${active ? "border-white/45 bg-white/14" : "border-white/18 bg-black/35"}`}
                  >
                    <Text className={`text-xs font-semibold uppercase tracking-[0.8px] ${active ? "text-white" : "text-white/80"}`}>
                      {filter}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Content rows */}
          <View className="mt-0">
            {shouldShowTrendingOnly ? (
              <>
                <ContentRow
                  title="Top 10 in Nepal Today"
                  items={filtered.trending.slice(0, 10)}
                  onPressItem={openDetails}
                  showRanking
                  largeRanking
                  showCardTitle={false}
                />
                <View className="px-4 pb-8">
                  <View className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                    <SkeletonBox height={16} width={120} borderRadius={6} />
                    <View className="mt-3 flex-row gap-3">
                      <SkeletonBox height={165} width={110} borderRadius={8} />
                      <SkeletonBox height={165} width={110} borderRadius={8} />
                      <SkeletonBox height={165} width={110} borderRadius={8} />
                    </View>
                  </View>
                </View>
              </>
            ) : showSkeleton ? (
              <>
                <SkeletonContentRow />
                <SkeletonContentRow />
              </>
            ) : (
              <>
                {rows.map((row) => (
                  <ContentRow
                    key={row.key}
                    title={row.title}
                    items={row.items}
                    onPressItem={openDetails}
                    showRanking={row.showRanking}
                    largeRanking={row.largeRanking}
                    showCardTitle={false}
                  />
                ))}
              </>
            )}
          </View>

          {isError ? (
            <Text className="px-4 pt-4 text-sm text-red-400">
              Some sections failed to load. Pull down to retry.
            </Text>
          ) : null}
        </Animated.ScrollView>
      </ScreenReveal>
    </SafeAreaView>
  );
}
