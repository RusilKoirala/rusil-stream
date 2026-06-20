import { StyleSheet, View } from "react-native";

interface SkeletonBoxProps {
  width?: number | string;
  height: number;
  borderRadius?: number;
}

/**
 * Static skeleton placeholder.
 *
 * The shimmer animation was removed. A repeating Reanimated withRepeat()
 * driving a LinearGradient inside every skeleton box means N continuous
 * animation loops all fighting for the UI thread simultaneously. On a screen
 * with 20+ skeletons this drops frame rate dramatically.
 *
 * A static muted rectangle is imperceptible to the user but costs zero CPU.
 */
export function SkeletonBox({ width = "100%", height, borderRadius = 8 }: SkeletonBoxProps) {
  return (
    <View
      style={[
        s.box,
        {
          width: width as any,
          height,
          borderRadius,
        },
      ]}
    />
  );
}

const s = StyleSheet.create({
  box: {
    backgroundColor: "#1A1F2B",
  },
});
