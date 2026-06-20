import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { BrandLogo } from "@/components/ui/brand-logo";
import { colors } from "@/lib/tokens";

interface StartupAnimationProps {
  onDone: () => void;
}

export function StartupAnimation({ onDone }: StartupAnimationProps) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.88)).current;
  const barWidth    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Logo fades + scales in
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Progress bar sweeps across
    Animated.timing(barWidth, {
      toValue: 1,
      duration: 900,
      delay: 200,
      useNativeDriver: false, // width % can't use native driver
    }).start();

    // 3. Done after bar finishes
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [onDone, logoOpacity, logoScale, barWidth]);

  const barWidthInterpolated = barWidth.interpolate({
    inputRange:  [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={s.root}>
      {/* Logo */}
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <BrandLogo size="lg" styleVariant="web-navbar" style={s.logo} />
      </Animated.View>

      {/* Single thin red bar at the bottom */}
      <View style={s.trackWrap}>
        <View style={s.track}>
          <Animated.View style={[s.bar, { width: barWidthInterpolated }]} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 56,
    height: 56,
  },
  trackWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  track: {
    height: 2,
    backgroundColor: colors.bgRaised,
    overflow: "hidden",
  },
  bar: {
    height: 2,
    backgroundColor: colors.red,
  },
});
