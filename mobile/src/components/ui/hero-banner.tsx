import { memo } from "react";
import { Image as ExpoImage } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Content } from "@/types/content";
import { formatYear } from "@/utils/format";
import { colors } from "@/lib/tokens";

interface HeroBannerProps {
  item: Content;
  logoUri?: string | null;
  onPlay: (item: Content) => void;
  onMoreInfo: (item: Content) => void;
}

function HeroBannerBase({ item, logoUri, onPlay, onMoreInfo }: HeroBannerProps) {
  const imageUri = item.backdropPath || item.posterPath;
  const rating = item.voteAverage > 0 ? item.voteAverage.toFixed(1) : null;
  const year = formatYear(item.releaseDate);
  const overview = item.overview?.trim();

  return (
    <View style={s.root}>
      {/* Backdrop */}
      {imageUri ? (
        <ExpoImage
          source={{ uri: imageUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={0}
          cachePolicy="memory-disk"
          recyclingKey={`hero-backdrop-${imageUri}`}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bgSurface }]} />
      )}

      {/* Scrim */}
      <View style={s.scrim} pointerEvents="none" />

      {/* Overlay */}
      <View style={s.overlay}>

        {/* Title or logo */}
        <View style={s.titleSlot}>
          {logoUri ? (
            <ExpoImage
              source={{ uri: logoUri }}
              style={s.logo}
              contentFit="contain"
              transition={0}
              cachePolicy="memory-disk"
              recyclingKey={`hero-logo-${logoUri}`}
              accessibilityLabel={`${item.title} logo`}
            />
          ) : (
            <Text style={s.title} numberOfLines={2}>{item.title}</Text>
          )}
        </View>

        {/* Meta */}
        <View style={s.meta}>
          {rating ? (
            <>
              <Ionicons name="star" size={11} color="#FCD34D" />
              <Text style={s.metaText}>{rating}</Text>
              <Text style={s.dot}>·</Text>
            </>
          ) : null}
          {year !== "N/A" ? (
            <>
              <Text style={s.metaText}>{year}</Text>
              <Text style={s.dot}>·</Text>
            </>
          ) : null}
          <Text style={[s.metaText, { textTransform: "uppercase", letterSpacing: 0.6 }]}>
            {item.type}
          </Text>
        </View>

        {/* Overview */}
        {overview ? (
          <Text style={s.overview} numberOfLines={2}>{overview}</Text>
        ) : null}

        {/* Buttons */}
        <View style={s.buttons}>

          {/* ▶ Play — white solid */}
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={() => onPlay(item)}
            style={s.playBtn}
            accessibilityRole="button"
            accessibilityLabel={`Play ${item.title}`}
          >
            <Ionicons name="play" size={16} color="#FFFFFF" />
            <Text style={s.playText}>Play</Text>
          </TouchableOpacity>

          {/* ⓘ More Info — dark with white border */}
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={() => onMoreInfo(item)}
            style={s.infoBtn}
            accessibilityRole="button"
            accessibilityLabel={`More info about ${item.title}`}
          >
            <Ionicons name="information-circle-outline" size={16} color="#FFFFFF" />
            <Text style={s.infoText}>More Info</Text>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
}

export const HeroBanner = memo(HeroBannerBase);

export function clearHeroLogoCache() {
  // kept for app-settings compatibility
}

const s = StyleSheet.create({
  root: {
    width: "100%",
    height: 400,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.50)",
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // Title
  titleSlot: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  logo: {
    width: 200,
    height: 60,
  },

  // Meta
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.80)",
  },
  dot: {
    fontSize: 12,
    color: "rgba(255,255,255,0.40)",
    paddingHorizontal: 2,
  },

  // Overview
  overview: {
    fontSize: 12,
    lineHeight: 18,
    color: "rgba(255,255,255,0.70)",
    marginBottom: 16,
  },

  // Buttons row
  buttons: {
    flexDirection: "row",
    gap: 10,
  },

  // ▶ Play
  playBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.red,
    borderRadius: 6,
    paddingVertical: 12,
  },
  playText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // ⓘ More Info
  infoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(30,30,30,0.80)",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
