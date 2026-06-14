import { useEffect } from "react";
import type { ViewProps } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface ScreenRevealProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
}

export function ScreenReveal({ children, delay = 0, style, ...props }: ScreenRevealProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(14);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 320, delay, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 360, delay, easing: Easing.out(Easing.cubic) });
  }, [delay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}
