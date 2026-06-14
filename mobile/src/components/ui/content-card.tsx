import { memo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, Text, View } from "react-native";
import Svg, { Text as SvgText } from "react-native-svg";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import type { Content } from "@/types/content";

interface ContentCardProps {
  content: Content;
  onPress: () => void;
  variant?: "row" | "grid";
  showTitle?: boolean;
  rankNumber?: number;
  rankSize?: "regular" | "large";
}

function ContentCardBase({ content, onPress, variant = "row", showTitle = true, rankNumber, rankSize = "regular" }: ContentCardProps) {
  const isGrid = variant === "grid";
  const progressPercentage = content.progressPercentage;
  const hasProgress = typeof progressPercentage === "number" && progressPercentage >= 0 && progressPercentage <= 100;
  const isRanked = typeof rankNumber === "number";
  const cardShadowClass = isGrid ? "shadow-soft" : "shadow-card";
  const shouldShowTitle = showTitle && !isRanked;
  const isLargeRank = isRanked && rankSize === "large";

  return (
    <View className={`${isGrid ? "w-full" : isRanked ? isLargeRank ? "mr-4 w-[204px] pl-[52px]" : "mr-3 w-[176px] pl-[45px]" : "mr-3 w-[154px]"}`}>
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={content.title}
      android_ripple={{ color: "rgba(255,255,255,0.14)" }}
    >
      {isRanked ? (
        <View className="absolute -bottom-5 left-0 z-10">
          <Svg width={isLargeRank ? 112 : 98} height={isLargeRank ? 172 : 152} viewBox="0 0 100 150">
            <SvgText
              x="50"
              y="146"
              fontSize="140"
              fontWeight="900"
              textAnchor="middle"
              fill="transparent"
              stroke="#ffffff"
              strokeWidth="6"
            >
              {rankNumber}
            </SvgText>
            <SvgText
              x="50"
              y="146"
              fontSize="140"
              fontWeight="900"
              textAnchor="middle"
              fill="#000000"
            >
              {rankNumber}
            </SvgText>
          </Svg>
        </View>
      ) : null}

      <View className={`overflow-hidden ${isRanked ? "rounded-[20px]" : "rounded-lg"} bg-brand-card ${cardShadowClass}`}>
        {content.posterPath ? (
          <View>
            <Image
              source={{ uri: content.posterPath }}
              className={`${isGrid ? "h-44" : isRanked ? isLargeRank ? "h-[266px]" : "h-[228px]" : "h-[220px]"} w-full`}
              resizeMode="cover"
            />
            <LinearGradient colors={["transparent", "rgba(5,8,12,0.36)", "rgba(5,8,12,0.82)"]} locations={[0.35, 0.68, 1]} className="absolute inset-0" />
          </View>
        ) : (
          <View
            className={`${isGrid ? "h-44" : isRanked ? isLargeRank ? "h-[266px]" : "h-[228px]" : "h-[220px]"} w-full items-center justify-center bg-brand-cardAlt`}
          >
            <Ionicons name="film-outline" size={20} color="#9AA3B2" />
            <Text className="px-2 text-center text-xs text-brand-muted">No image</Text>
          </View>
        )}

        {isGrid && content.voteAverage > 0 ? (
          <View className="absolute right-2 top-2 flex-row items-center gap-1 rounded-full border border-white/20 bg-black/65 px-2 py-1">
            <Ionicons name="star" size={10} color="#F3C97A" />
            <Text className="text-[10px] font-semibold text-white">{content.voteAverage.toFixed(1)}</Text>
          </View>
        ) : null}

      </View>

      {shouldShowTitle ? (
        <>
          <Text numberOfLines={1} className="mt-2 text-sm font-semibold text-brand-text">
            {content.title}
          </Text>
          {isGrid ? <Text className="text-xs text-brand-muted uppercase">{content.type}</Text> : null}

          {hasProgress ? (
            <View className="mt-2">
              <View className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <View className="h-full rounded-full bg-brand-red" style={{ width: `${progressPercentage}%` }} />
              </View>
              <Text className="mt-1 text-[11px] text-brand-muted">{progressPercentage}% watched</Text>
            </View>
          ) : null}
        </>
      ) : null}
    </AnimatedPressable>
    </View>
  );
}

export const ContentCard = memo(ContentCardBase);
