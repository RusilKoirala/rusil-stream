import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ImageBackground, ScrollView, Text, View } from "react-native";
import { ContentRow } from "@/components/ui/content-row";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { PremiumBackground } from "@/components/ui/premium-background";
import { ScreenReveal } from "@/components/ui/screen-reveal";
import { SkeletonBox } from "@/components/ui/skeleton-box";
import { getContentDetails } from "@/lib/api";
import { useToggleWatchlist, useWatchlist } from "@/hooks/use-watchlist";
import type { RootStackParamList } from "@/navigation/types";
import { formatRating, formatYear } from "@/utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "Details">;

function DetailsSkeletonLayout() {
  return (
    <ScrollView className="flex-1 bg-brand-bg">
      {/* Backdrop skeleton */}
      <SkeletonBox height={430} borderRadius={0} />

      <View className="px-4 pb-8 pt-5">
        {/* Title bar skeleton */}
        <SkeletonBox height={36} width="70%" borderRadius={8} />

        {/* Metadata row skeleton */}
        <View className="mt-3 flex-row gap-3">
          <SkeletonBox height={16} width={60} borderRadius={6} />
          <SkeletonBox height={16} width={40} borderRadius={6} />
          <SkeletonBox height={16} width={50} borderRadius={6} />
        </View>

        {/* Action buttons skeleton */}
        <View className="mt-5 flex-row gap-3">
          <SkeletonBox height={44} width={128} borderRadius={22} />
          <SkeletonBox height={44} width={128} borderRadius={22} />
        </View>

        {/* Overview label skeleton */}
        <View className="mt-6">
          <SkeletonBox height={10} width={80} borderRadius={4} />
          {/* Overview paragraph skeleton */}
          <View className="mt-2 gap-2">
            <SkeletonBox height={16} borderRadius={4} />
            <SkeletonBox height={16} borderRadius={4} />
            <SkeletonBox height={16} width="80%" borderRadius={4} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export function DetailsScreen({ route, navigation }: Props) {
  const { id, type } = route.params;

  const { data, isLoading } = useQuery({
    queryKey: ["details", id, type],
    queryFn: () => getContentDetails(id, type),
  });

  const { data: watchlist = [] } = useWatchlist();
  const toggleWatchlist = useToggleWatchlist();

  if (isLoading || !data) {
    return <DetailsSkeletonLayout />;
  }

  const inWatchlist = watchlist.some((item) => item.id === data.id && item.type === data.type);
  const moreLikeThis = [...data.recommendations, ...data.similar].reduce<typeof data.recommendations>((acc, item) => {
    if (!acc.some((existing) => existing.id === item.id && existing.type === item.type)) {
      acc.push(item);
    }
    return acc;
  }, []);

  return (
    <ScrollView className="flex-1 bg-brand-bg">
      <PremiumBackground />
      <ScreenReveal>
        <View className="h-[430px] overflow-hidden bg-black">
          {data.backdropPath ? (
            <ImageBackground source={{ uri: data.backdropPath }} className="h-full w-full" resizeMode="cover">
              <LinearGradient
                colors={["rgba(3,4,6,0.3)", "rgba(8,10,14,0.55)", "rgba(8,10,14,0.98)"]}
                locations={[0.05, 0.52, 1]}
                className="h-full w-full justify-end px-4 pb-7"
              >
                <Text className="text-4xl font-black text-white">{data.title}</Text>

                <View className="mt-3 flex-row items-center gap-3">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name="star" size={13} color="#F3C97A" />
                    <Text className="text-sm font-semibold text-zinc-100">{formatRating(data.voteAverage)}</Text>
                  </View>
                  <Text className="text-sm text-zinc-300">{formatYear(data.releaseDate)}</Text>
                  <Text className="text-sm uppercase tracking-[0.5px] text-zinc-300">{data.type}</Text>
                  <View className="rounded-md border border-white/30 px-2 py-0.5">
                    <Text className="text-[10px] font-semibold uppercase tracking-[0.8px] text-zinc-100">HD</Text>
                  </View>
                </View>

                <View className="mt-5 flex-row items-center gap-3">
                  <AnimatedPressable
                    onPress={() => navigation.navigate("Player", { id: data.id, type: data.type, title: data.title })}
                    accessibilityRole="button"
                    accessibilityLabel="Play"
                    className="min-w-32 flex-row items-center justify-center gap-2 rounded-full bg-white px-6 py-3"
                  >
                    <Ionicons name="play" size={14} color="#050505" />
                    <Text className="font-bold text-black">Play</Text>
                  </AnimatedPressable>
                  <AnimatedPressable
                    onPress={() => toggleWatchlist.mutate(data)}
                    accessibilityRole="button"
                    accessibilityLabel={inWatchlist ? "Remove from My List" : "Add to My List"}
                    className="min-w-32 flex-row items-center justify-center gap-2 rounded-full bg-[#1A2332]/90 px-6 py-3"
                  >
                    <Ionicons name={inWatchlist ? "checkmark" : "add"} size={14} color="#FFFFFF" />
                    <Text className="font-bold text-white">{inWatchlist ? "In My List" : "My List"}</Text>
                  </AnimatedPressable>
                </View>
              </LinearGradient>
            </ImageBackground>
          ) : (
            <View className="h-full w-full justify-end bg-brand-card px-4 pb-7">
              <Text className="text-4xl font-black text-white">{data.title}</Text>
              <Text className="mt-2 text-sm text-brand-muted">
                {formatYear(data.releaseDate)} • {formatRating(data.voteAverage)}
              </Text>
            </View>
          )}
        </View>

        <View className="px-4 pb-8 pt-5">
          <Text className="text-[10px] font-semibold uppercase tracking-[1.2px] text-zinc-500">Overview</Text>
          <Text className="mt-2 text-base leading-7 text-zinc-200">{data.overview}</Text>

          {data.genres.length > 0 ? (
            <View className="mt-5 flex-row flex-wrap gap-2">
              {data.genres.slice(0, 4).map((genre) => (
                <View key={genre.id} className="rounded-full border border-white/15 bg-[#141C2A] px-3 py-1.5">
                  <Text className="text-xs text-zinc-200">{genre.name}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View className="mt-6 rounded-2xl border border-white/10 bg-[#0E1420]/90 p-4">
            <Text className="text-[10px] font-semibold uppercase tracking-[1.1px] text-zinc-500">Status</Text>
            <Text className="mt-1 text-sm text-zinc-200">{data.status || "Available"}</Text>
          </View>
        </View>

        <ContentRow
          title="More Like This"
          items={moreLikeThis.slice(0, 20)}
          onPressItem={(item) => navigation.push("Details", { id: item.id, type: item.type })}
        />
      </ScreenReveal>
    </ScrollView>
  );
}
