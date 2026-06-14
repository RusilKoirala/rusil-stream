import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BrandLogo } from "@/components/ui/brand-logo";

interface StartupAnimationProps {
  onDone: () => void;
}

export function StartupAnimation({ onDone }: StartupAnimationProps) {
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(18);
  const logoScale = useSharedValue(0.96);
  const ringScale = useSharedValue(0.94);
  const ringOpacity = useSharedValue(0.26);
  const progress = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [0, 176]),
  }));

  useEffect(() => {
    cardOpacity.value = withTiming(1, {
      duration: 520,
      easing: Easing.out(Easing.ease),
    });
    cardTranslateY.value = withTiming(0, {
      duration: 520,
      easing: Easing.out(Easing.cubic),
    });

    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.045, { duration: 780, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.985, { duration: 920, easing: Easing.inOut(Easing.quad) })
      ),
      -1
    );

    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.13, { duration: 1150, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.94, { duration: 1150, easing: Easing.inOut(Easing.quad) })
      ),
      -1
    );

    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.46, { duration: 1150, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.22, { duration: 1150, easing: Easing.inOut(Easing.quad) })
      ),
      -1
    );

    progress.value = withTiming(1, {
      duration: 1650,
      easing: Easing.out(Easing.cubic),
    });

    const timeout = setTimeout(() => {
      onDone();
    }, 1950);

    return () => {
      clearTimeout(timeout);
    };
  }, [cardOpacity, cardTranslateY, logoScale, onDone, progress, ringOpacity, ringScale]);

  return (
    <View className="flex-1 bg-brand-bg">
      <LinearGradient
        colors={["#06080E", "#0A111D", "#110D15"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 items-center justify-center px-6"
      >
        <View className="pointer-events-none absolute -top-24 right-[-84px] h-72 w-72 rounded-full bg-brand-red/20" />
        <View className="pointer-events-none absolute bottom-[-110px] left-[-92px] h-80 w-80 rounded-full bg-cyan-400/10" />

        <Animated.View style={cardStyle} className="w-full max-w-sm rounded-[30px] border border-white/15 bg-brand-card/80 px-7 py-8">
          <View className="items-center">
            <Animated.View style={ringStyle} className="absolute h-32 w-32 rounded-full border border-white/20" />

            <Animated.View style={logoStyle}>
              <BrandLogo size="lg" styleVariant="web-navbar" className="h-24 w-24" />
            </Animated.View>

            <Text className="mt-5 text-center text-[10px] font-semibold uppercase tracking-[3.8px] text-white/60">
              Rusil Stream
            </Text>
            <Text className="mt-2 text-center text-sm tracking-[1.1px] text-brand-text/90">Preparing your watchlist</Text>

            <View className="mt-5 h-1.5 w-44 overflow-hidden rounded-full bg-white/12">
              <Animated.View style={progressStyle} className="h-full rounded-full bg-brand-red" />
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}
