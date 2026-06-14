import { useEffect, useRef, useState } from "react";
import { Image, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  type SharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getContentLogoPath, resolveApiAssetUrl } from "@/lib/api";
import type { Content } from "@/types/content";
import { formatYear } from "@/utils/format";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { SkeletonBox } from "@/components/ui/skeleton-box";

interface HeroBannerProps {
  items: Content[];
  activeIndex: number;
  onPlay: (item: Content) => void;
  onMoreInfo: (item: Content) => void;
  logoPathMap?: Record<string, string>;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);
const logoCache = new Map<string, string | null>();
const logoRequestCache = new Map<string, Promise<string | null>>();

export function clearHeroLogoCache() {
  logoCache.clear();
  logoRequestCache.clear();
}

async function getCachedLogoPath(id: number, type: "movie" | "tv") {
  const cacheKey = `${type}:${id}`;

  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey) ?? null;
  }

  const inFlight = logoRequestCache.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const request = getContentLogoPath(id, type)
    .then((path) => resolveApiAssetUrl(path))
    .catch(() => null)
    .finally(() => {
      logoRequestCache.delete(cacheKey);
    });

  logoRequestCache.set(cacheKey, request);
  const resolved = await request;
  logoCache.set(cacheKey, resolved);
  return resolved;
}

interface HeroLayerProps {
  item: Content;
  opacity: SharedValue<number>;
}

function HeroLayer({ item, opacity }: HeroLayerProps) {
  const imageUri = item.backdropPath || item.posterPath;
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!imageUri) return null;

  return (
    <Animated.View style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }, animatedStyle]}>
      <AnimatedImage
        source={{ uri: imageUri }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

export function HeroBanner({ items, activeIndex, onPlay, onMoreInfo, logoPathMap }: HeroBannerProps) {
  const safeIndex = items.length > 0 ? activeIndex % items.length : 0;
  const activeItem = items[safeIndex] ?? null;

  const [prevItem, setPrevItem] = useState<Content | null>(null);
  const [titleLogoPath, setTitleLogoPath] = useState<string | null>(null);

  // Reanimated shared values for incoming hero
  const heroOpacity = useSharedValue(0);

  // Outgoing hero opacity (fades out as incoming fades in)
  const prevOpacity = useSharedValue(1);
  const logoOpacity = useSharedValue(1);

  const prevIndexRef = useRef<number>(-1);

  useEffect(() => {
    if (!activeItem) return;

    const previousIndex = prevIndexRef.current;
    const isFirstRender = previousIndex === -1;
    const previousItem = previousIndex >= 0 && items.length > 0 ? items[previousIndex % items.length] : null;
    prevIndexRef.current = safeIndex;

    if (isFirstRender) {
      // First render: show immediately, no cross-fade
      heroOpacity.value = 1;
      prevOpacity.value = 0;
      setPrevItem(null);
      return;
    }

    if (previousItem) {
      setPrevItem(previousItem);
      prevOpacity.value = 1;
    }

    // Cross-fade tuned for smoother cinematic transition.
    heroOpacity.value = 0;
    prevOpacity.value = withTiming(0, { duration: 700, easing: Easing.inOut(Easing.cubic) });
    heroOpacity.value = withTiming(1, { duration: 700, easing: Easing.inOut(Easing.cubic) });
  }, [safeIndex, activeItem]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeItem) {
      setTitleLogoPath(null);
      return;
    }

    let mounted = true;
    logoOpacity.value = 0;
    const cacheKey = `${activeItem.type}:${activeItem.id}`;
    const mappedLogo = logoPathMap?.[cacheKey];
    if (mappedLogo) {
      setTitleLogoPath(mappedLogo);
      logoOpacity.value = withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) });
      return () => {
        mounted = false;
      };
    }

    void getCachedLogoPath(activeItem.id, activeItem.type)
      .then((path) => {
        if (!mounted) return;
        setTitleLogoPath(path ?? null);
        logoOpacity.value = withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) });
      });

    return () => {
      mounted = false;
    };
  }, [activeItem?.id, activeItem?.type, logoPathMap]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  if (!activeItem) {
    return (
      <View className="h-[500px] w-full items-center justify-center bg-brand-card">
        <Text className="text-base text-brand-muted">No hero artwork available</Text>
      </View>
    );
  }

  const rating = activeItem.voteAverage > 0 ? activeItem.voteAverage.toFixed(1) : null;
  const year = formatYear(activeItem.releaseDate);
  const overview = activeItem.overview?.trim();

  return (
    <View className="h-[500px] w-full overflow-hidden bg-black">
      {/* Outgoing hero layer (behind) */}
      {prevItem ? (
        <HeroLayer item={prevItem} opacity={prevOpacity} />
      ) : null}

      {/* Incoming hero layer (front) */}
      <HeroLayer item={activeItem} opacity={heroOpacity} />

      {/* Side gradient mirrors web hero composition */}
      <LinearGradient
        colors={["rgba(5,5,8,0.95)", "rgba(6,6,9,0.68)", "rgba(9,8,10,0.30)", "rgba(10,9,11,0.86)"]}
        locations={[0, 0.36, 0.68, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
        pointerEvents="none"
      />

      {/* Vertical fade to deep black like web */}
      <LinearGradient
        colors={["rgba(0,0,0,0.36)", "rgba(0,0,0,0)", "rgba(0,0,0,0.98)"]}
        locations={[0, 0.4, 1]}
        style={{ position: "absolute", inset: 0 }}
        pointerEvents="none"
      />

      {/* Content overlay */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-6">
        <View className="max-w-[92%]">
          <Animated.View className="mb-2 h-[78px] w-[82%] justify-center" style={logoAnimatedStyle}>
            {titleLogoPath ? (
              <Image
                source={{ uri: titleLogoPath }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
                accessibilityLabel={`${activeItem.title} title logo`}
              />
            ) : (
              <SkeletonBox height={54} width="68%" borderRadius={999} />
            )}
          </Animated.View>

          {/* Metadata */}
          <View className="mb-2 mt-1 flex-row items-center">
            {rating ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="star" size={11} color="#FCD34D" />
                <Text className="text-[11px] font-semibold text-zinc-100">{rating}</Text>
              </View>
            ) : null}
            {rating ? <Text className="px-2 text-zinc-400">•</Text> : null}
            {year !== "N/A" ? <Text className="text-[11px] font-medium text-zinc-200">{year}</Text> : null}
            {year !== "N/A" ? <Text className="px-2 text-zinc-400">•</Text> : null}
            <Text className="text-[11px] font-medium uppercase tracking-[0.5px] text-zinc-200">{activeItem.type}</Text>
            <Text className="px-2 text-zinc-400">•</Text>
            <Text className="rounded border border-white/35 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.65px] text-zinc-100">HD</Text>
          </View>

          {overview ? (
            <Text numberOfLines={3} className="mb-4 max-w-[92%] text-[12px] leading-5 text-zinc-200/90">
              {overview}
            </Text>
          ) : null}

          {/* Action buttons */}
          <View className="flex-row items-center gap-3">
            <AnimatedPressable
              onPress={() => onPlay(activeItem)}
              className="min-w-[124px] flex-row items-center justify-center gap-2 rounded-full bg-brand-red px-5 py-2.5"
              accessibilityLabel={`Play ${activeItem.title}`}
              accessibilityRole="button"
            >
              <Ionicons name="play" size={14} color="#FFFFFF" />
              <Text className="text-[12px] font-bold uppercase tracking-[0.5px] text-white">Watch</Text>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={() => onMoreInfo(activeItem)}
              className="min-w-[124px] flex-row items-center justify-center gap-2 rounded-full border border-white/30 bg-black/45 px-5 py-2.5"
              accessibilityLabel={`More info about ${activeItem.title}`}
              accessibilityRole="button"
            >
              <Ionicons name="information-circle-outline" size={15} color="#FFFFFF" />
              <Text className="text-[12px] font-semibold uppercase tracking-[0.5px] text-white">Details</Text>
            </AnimatedPressable>
          </View>
        </View>

        <View className="mt-5 flex-row items-center justify-center gap-2">
          {items.map((item, index) => (
            <View
              key={`${item.type}:${item.id}`}
              className={`${index === safeIndex ? "h-1.5 w-7 bg-[#ff4b2b]" : "h-1.5 w-1.5 bg-white/45"} rounded-full`}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
