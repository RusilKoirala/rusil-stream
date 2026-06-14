import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

interface OfflineBannerProps {
  visible: boolean;
}

export function OfflineBanner({ visible }: OfflineBannerProps) {
  const translateY = useSharedValue(-44);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : -44, {
      duration: visible ? 280 : 220,
    });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[{ backgroundColor: "#111827", overflow: "hidden" }, animatedStyle]}
      className="mx-4 mt-2 flex-row items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5"
    >
      <Ionicons name="cloud-offline-outline" size={14} color="#A3A3A3" />
      <Text className="text-xs font-medium text-brand-muted">
        No internet connection
      </Text>
    </Animated.View>
  );
}
