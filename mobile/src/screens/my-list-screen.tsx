import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ContentCard } from "@/components/ui/content-card";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { PremiumBackground } from "@/components/ui/premium-background";
import { ScreenReveal } from "@/components/ui/screen-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { SkeletonGrid } from "@/components/ui/skeleton-grid";
import { StateView } from "@/components/ui/state-view";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useWatchlist } from "@/hooks/use-watchlist";
import type { RootStackParamList } from "@/navigation/types";

export function MyListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data = [], isLoading, isError, error, refetch, isFetching } = useWatchlist();
  const { isOffline } = useNetworkStatus();

  const hasNoCachedData = data.length === 0;

  if (isOffline && hasNoCachedData) {
    return (
      <SafeAreaView className="flex-1 bg-brand-bg" edges={["top"]}>
        <PremiumBackground />
        <OfflineBanner visible={isOffline} />
        <StateView
          icon="wifi-off-outline"
          title="You're offline"
          description="Reconnect to sync your saved list."
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
          <SectionHeader title="My List" subtitle="Saved for later" />
        </View>

        {isLoading ? (
          <SkeletonGrid count={6} itemHeight={176} />
        ) : isError ? (
          <StateView
            icon="warning-outline"
            title="Could not load your list"
            description={error instanceof Error ? error.message : "Please try again."}
            actionLabel="Retry"
            onAction={() => void refetch()}
          />
        ) : (
          <FlatList
            className="mt-4"
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }}
            data={data}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            ListHeaderComponent={
              <View className="mb-3 flex-row items-center justify-between px-1">
                <Text className="text-xs uppercase tracking-[1px] text-zinc-500">{data.length} saved titles</Text>
                {isFetching ? <Text className="text-xs uppercase tracking-[1px] text-zinc-500">Syncing...</Text> : null}
              </View>
            }
            ListEmptyComponent={
              <View className="mt-14">
                <StateView
                  icon="bookmark-outline"
                  title="Nothing saved yet"
                  description="Add titles from details pages to build your watchlist."
                />
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
