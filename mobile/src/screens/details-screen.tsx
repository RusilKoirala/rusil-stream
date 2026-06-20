import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ContentRow } from "@/components/ui/content-row";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { ScreenReveal } from "@/components/ui/screen-reveal";
import { SkeletonBox } from "@/components/ui/skeleton-box";
import { getContentDetails } from "@/lib/api";
import { useToggleWatchlist, useWatchlist } from "@/hooks/use-watchlist";
import type { RootStackParamList } from "@/navigation/types";
import { formatRating, formatYear } from "@/utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "Details">;

function DetailsSkeletonLayout() {
  return (
    <ScrollView className="flex-1 bg-[#0b0c10]">
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
    <ScrollView className="flex-1 bg-[#0b0c10]">
      <ScreenReveal>
        <View className="h-[440px] overflow-hidden bg-black">
          {data.backdropPath ? (
            <View style={StyleSheet.absoluteFill}>
              <ExpoImage
                source={{ uri: data.backdropPath }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={0}
                cachePolicy="memory-disk"
                recyclingKey={`details-backdrop-${data.id}-${data.type}`}
              />
              {/* Matches web hero: from-black/68 via-transparent to-bg */}
              <LinearGradient
                colors={["rgba(3,4,6,0.22)", "rgba(8,10,14,0.40)", "rgba(8,10,14,0.92)", "rgba(11,12,16,1)"]}
                locations={[0, 0.38, 0.72, 1]}
                className="h-full w-full justify-end px-5 pb-6"
              >
                {/* Title */}
                <Text
                  className="text-4xl font-bold text-white"
                  style={{ letterSpacing: -0.5 }}
                >
                  {data.title}
                </Text>

                {/* Metadata row */}
                <View className="mt-3 flex-row flex-wrap items-center gap-x-3 gap-y-1">
                  {data.voteAverage > 0 ? (
                    <View className="flex-row items-center gap-1.5">
                      <Ionicons name="star" size={12} color="#F3C97A" />
                      <Text className="text-sm font-semibold text-white/90">
                        {formatRating(data.voteAverage)}
                      </Text>
                    </View>
                  ) : null}
                  <Text className="text-sm text-white/50">{formatYear(data.releaseDate)}</Text>
                  <Text className="text-sm uppercase tracking-[0.5px] text-white/50">{data.type}</Text>
                  <View className="rounded border border-white/25 px-1.5 py-0.5">
                    <Text className="text-[9px] font-semibold uppercase tracking-[0.8px] text-white/70">HD</Text>
                  </View>
                </View>

                {/* Action buttons — web style: white Play + ghost secondary */}
                <View className="mt-5 flex-row items-center gap-3">
                  <AnimatedPressable
                    onPress={() =>
                      navigation.navigate("Player", { id: data.id, type: data.type, title: data.title })
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Play"
                    className="h-11 min-w-[132px] flex-row items-center justify-center gap-2 rounded-full bg-white"
                  >
                    <Ionicons name="play" size={14} color="#0b0c10" />
                    <Text className="text-sm font-bold text-[#0b0c10]">Play</Text>
                  </AnimatedPressable>

                  <AnimatedPressable
                    onPress={() => toggleWatchlist.mutate(data)}
                    accessibilityRole="button"
                    accessibilityLabel={inWatchlist ? "Remove from My List" : "Add to My List"}
                    className="h-11 min-w-[132px] flex-row items-center justify-center gap-2 rounded-full border border-white/20 bg-black/40"
                  >
                    <Ionicons
                      name={inWatchlist ? "checkmark" : "add"}
                      size={15}
                      color="rgba(255,255,255,0.85)"
                    />
                    <Text className="text-sm font-semibold text-white/85">
                      {inWatchlist ? "In My List" : "My List"}
                    </Text>
                  </AnimatedPressable>
                </View>
              </LinearGradient>
            </View>
          ) : (
            <View className="h-full w-full justify-end bg-[#111319] px-5 pb-6">
              <Text className="text-4xl font-bold text-white" style={{ letterSpacing: -0.5 }}>
                {data.title}
              </Text>
              <Text className="mt-2 text-sm text-white/40">
                {formatYear(data.releaseDate)} • {formatRating(data.voteAverage)}
              </Text>
            </View>
          )}
        </View>

        {/* Body */}
        <View className="px-5 pb-8 pt-5">
          <Text className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
            Overview
          </Text>
          <Text className="mt-2.5 text-sm leading-7 text-white/70">{data.overview}</Text>

          {data.genres.length > 0 ? (
            <View className="mt-5 flex-row flex-wrap gap-2">
              {data.genres.slice(0, 4).map((genre) => (
                <View
                  key={genre.id}
                  className="rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5"
                >
                  <Text className="text-xs text-white/60">{genre.name}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View className="mt-5 rounded-2xl border border-white/8 bg-[#111319] p-4">
            <Text className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
              Status
            </Text>
            <Text className="mt-1.5 text-sm text-white/70">{data.status || "Available"}</Text>
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
