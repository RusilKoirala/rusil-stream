import { useEffect } from "react";
import type { ViewProps } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface ScreenRevealProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
}

/**
 * Fades the screen in on mount.
 * IMPORTANT: Only animates opacity — no translateY.
 * Wrapping a ScrollView in a view with transform causes the entire scroll
 * content to be composited as one layer on every frame, killing performance.
 */
export function ScreenReveal({ children, delay = 0, style, ...props }: ScreenRevealProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 260,
      delay,
      easing: Easing.out(Easing.quad),
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}
