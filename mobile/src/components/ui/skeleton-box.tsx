import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

interface SkeletonBoxProps {
  width?: number | string;
  height: number;
  borderRadius?: number;
  className?: string;
}

export function SkeletonBox({
  width = "100%",
  height,
  borderRadius = 8,
  className,
}: SkeletonBoxProps) {
  // Resolve numeric width for shimmer travel distance; fall back to 300 for "100%"
  const numericWidth = typeof width === "number" ? width : 300;
  const translateX = useSharedValue(-numericWidth);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(numericWidth, {
        duration: 1200,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [numericWidth]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      className={`bg-brand-card overflow-hidden ${className ?? ""}`}
      style={{ width, height, borderRadius }}
    >
      {/* Shimmer sweep */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            width: numericWidth,
          },
          shimmerStyle,
        ]}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.07)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}
