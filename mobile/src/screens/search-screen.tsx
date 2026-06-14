import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ContentCard } from "@/components/ui/content-card";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { PremiumBackground } from "@/components/ui/premium-background";
import { ScreenReveal } from "@/components/ui/screen-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { SkeletonGrid } from "@/components/ui/skeleton-grid";
import { StateView } from "@/components/ui/state-view";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useSearchContent } from "@/hooks/use-search-content";
import type { RootStackParamList } from "@/navigation/types";

export function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const { isOffline } = useNetworkStatus();

  const { data, isLoading, isError, error, refetch, isFetching } = useSearchContent(trimmed);

  const combined = useMemo(() => {
    if (!data) return [];
    return [...data.movies, ...data.tvShows].sort((a, b) => b.voteAverage - a.voteAverage);
  }, [data]);

  const hasNoCachedData = !data;

  if (isOffline && hasNoCachedData) {
    return (
      <SafeAreaView className="flex-1 bg-brand-bg" edges={["top"]}>
        <PremiumBackground />
        <OfflineBanner visible={isOffline} />
        <StateView
          icon={"wifi-off-outline" as any}
          title="You're offline"
          description="Reconnect to browse and search titles."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-bg" edges={["top"]}>
      <PremiumBackground />
      <OfflineBanner visible={isOffline} />
      <ScreenReveal className="flex-1">
        <View className="px-4 pt-2">
          <SectionHeader title="Search" subtitle="Find movies, series, and genres" />
          <View className="flex-row items-center rounded-2xl border border-white/15 bg-brand-card px-4 py-3">
            <Ionicons name="search" size={18} color="#9AA3B2" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Movies, shows, genres"
              placeholderTextColor="#7A7A7A"
              className="ml-3 flex-1 text-base text-white"
            />
            {query.length > 0 ? (
              <Pressable
                onPress={() => setQuery("")}
                className="rounded-full bg-white/10 p-1.5"
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={14} color="#D1D5DB" />
              </Pressable>
            ) : null}
          </View>
        </View>

        {trimmed.length < 2 ? (
          <StateView
            icon="sparkles-outline"
            title="Start your search"
            description="Type at least 2 characters to find titles quickly."
          />
        ) : isLoading ? (
          <SkeletonGrid count={9} itemHeight={176} />
        ) : isError ? (
          <StateView
            icon="warning-outline"
            title="Search failed"
            description={error instanceof Error ? error.message : "Please check your connection and try again."}
            actionLabel="Retry Search"
            onAction={() => void refetch()}
          />
        ) : (
          <FlatList
            className="mt-4"
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }}
            data={combined}
            numColumns={3}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            ListEmptyComponent={
              <View className="mt-14">
                <StateView
                  icon="film-outline"
                  title="No results"
                  description="Try a different title, genre, or keyword."
                />
              </View>
            }
            ListHeaderComponent={
              <View className="mb-3 flex-row items-center justify-between px-1">
                <Text className="text-xs uppercase tracking-[1px] text-zinc-500">{combined.length} results</Text>
                {isFetching ? <Text className="text-xs uppercase tracking-[1px] text-zinc-500">Refreshing...</Text> : null}
              </View>
            }
            renderItem={({ item }) => (
              <View className="mb-4 basis-[31%]">
                <ContentCard
                  content={item}
                  variant="grid"
                  showTitle={false}
                  onPress={() => navigation.navigate("Details", { id: item.id, type: item.type })}
                />
              </View>
            )}
          />
        )}
      </ScreenReveal>
    </SafeAreaView>
  );
}
