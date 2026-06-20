import { memo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { Content } from "@/types/content";
import { PosterImage } from "@/components/ui/poster-image";
import { colors, radius, type as t } from "@/lib/tokens";

// Card dimensions — fixed so getItemLayout works perfectly
export const CARD_WIDTH = {
  row:      140,   // standard row card poster
  ranked:   140,   // ranked — same poster width, gutter handled separately
  rankedLg: 140,
  grid:     "100%" as const,
} as const;

/** Left gutter reserved for the rank number beside the poster */
export const RANK_GUTTER = {
  regular: 32,
  large:   32,
} as const;

export const CARD_HEIGHT = {
  row:      210,   // all row variants share one height for visual consistency
  ranked:   210,
  rankedLg: 210,
  grid:     176,
} as const;

interface ContentCardProps {
  content: Content;
  onPress?: () => void;
  onPressItem?: (item: Content) => void;
  variant?: "row" | "grid";
  showTitle?: boolean;
  rankNumber?: number;
  rankSize?: "regular" | "large";
}

function ContentCardBase({
  content,
  onPress,
  onPressItem,
  variant = "row",
  showTitle = true,
  rankNumber,
  rankSize = "regular",
}: ContentCardProps) {
  const isGrid      = variant === "grid";
  const isRanked    = typeof rankNumber === "number";
  const isLargeRank = isRanked && rankSize === "large";
  const showLabel   = showTitle && !isRanked;

  const progress = content.progressPercentage;
  const hasProgress =
    typeof progress === "number" && progress >= 0 && progress <= 100;

  // Image height per variant
  const imgHeight = isGrid
    ? CARD_HEIGHT.grid
    : isLargeRank
    ? CARD_HEIGHT.rankedLg
    : isRanked
    ? CARD_HEIGHT.ranked
    : CARD_HEIGHT.row;

  // Container width
  const containerStyle = isGrid
    ? s.containerGrid
    : isLargeRank
    ? s.containerRankedLg
    : isRanked
    ? s.containerRanked
    : s.containerRow;

  return (
    <View style={containerStyle}>
      <Pressable
        onPress={onPress ?? (() => onPressItem?.(content))}
        accessibilityRole="button"
        accessibilityLabel={content.title}
        android_ripple={{ color: "rgba(255,255,255,0.12)", borderless: false }}
        style={({ pressed }) =>
          pressed && Platform.OS === "ios" ? { opacity: 0.82 } : undefined
        }
      >
        {/* Rank number — SVG outline rendered behind the card */}
        {isRanked ? (
          <View style={s.rankContainer}>
            <Text style={isLargeRank ? s.rankNumberLg : s.rankNumber}>{rankNumber}</Text>
          </View>
        ) : null}

        {/* Poster */}
        <View style={[s.imageWrap, { height: imgHeight }]}>
          <PosterImage
            uri={content.posterPath}
            recyclingKey={`${content.type}-${content.id}`}
            style={s.image}
          />

          {/* Grid rating badge */}
          {isGrid && content.voteAverage > 0 ? (
            <View style={s.ratingBadge}>
              <Ionicons name="star" size={9} color={colors.gold} />
              <Text style={s.ratingText}>{content.voteAverage.toFixed(1)}</Text>
            </View>
          ) : null}
        </View>

        {/* Title + progress */}
        {showLabel ? (
          <View style={s.labelBlock}>
            <Text style={s.title} numberOfLines={1}>{content.title}</Text>
            {isGrid ? (
              <Text style={s.type}>{content.type.toUpperCase()}</Text>
            ) : null}
            {hasProgress ? (
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${progress}%` as any }]} />
              </View>
            ) : null}
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

export const ContentCard = memo(ContentCardBase, (prev, next) =>
  prev.content.id === next.content.id &&
  prev.content.type === next.content.type &&
  prev.content.posterPath === next.content.posterPath &&
  prev.content.progressPercentage === next.content.progressPercentage &&
  prev.onPress === next.onPress &&
  prev.onPressItem === next.onPressItem &&
  prev.variant === next.variant &&
  prev.showTitle === next.showTitle &&
  prev.rankNumber === next.rankNumber &&
  prev.rankSize === next.rankSize
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Containers
  containerRow: {
    width: CARD_WIDTH.row,
    marginRight: 10,
  },
  containerRanked: {
    width: CARD_WIDTH.ranked + RANK_GUTTER.regular,
    marginRight: 10,
    paddingLeft: RANK_GUTTER.regular,
  },
  containerRankedLg: {
    width: CARD_WIDTH.rankedLg + RANK_GUTTER.large,
    marginRight: 12,
    paddingLeft: RANK_GUTTER.large,
  },
  containerGrid: {
    width: "100%",
  },

  // Rank number
  rankContainer: {
    position: "absolute",
    bottom: 14,
    left: -2,
    zIndex: 1,
    justifyContent: "flex-end",
  },
  rankNumber: {
    fontSize: 44,
    fontWeight: "900",
    color: "rgba(255,255,255,0.18)",
    lineHeight: 44,
    includeFontPadding: false,
  },
  rankNumberLg: {
    fontSize: 44,
    fontWeight: "900",
    color: "rgba(255,255,255,0.18)",
    lineHeight: 44,
    includeFontPadding: false,
  },

  // Image
  imageWrap: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.bgSurface,
  },
  image: {
    width: "100%",
    height: "100%",
  },

  // Rating
  ratingBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.72)",
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: t.weight.semibold,
    color: colors.text100,
  },

  // Label
  labelBlock: {
    marginTop: 6,
    gap: 2,
  },
  title: {
    fontSize: t.size.sm,
    fontWeight: t.weight.semibold,
    color: colors.text80,
  },
  type: {
    fontSize: 10,
    color: colors.text40,
    fontWeight: t.weight.medium,
    letterSpacing: 0.5,
  },

  // Progress
  progressTrack: {
    marginTop: 4,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.bgHighest,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 1,
    backgroundColor: colors.red,
  },
});
