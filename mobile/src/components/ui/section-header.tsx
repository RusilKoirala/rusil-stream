import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightLabel?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

export function SectionHeader({
  title,
  subtitle,
  rightLabel,
  rightIcon = "chevron-forward",
  onRightPress,
}: SectionHeaderProps) {
  return (
    <View className="mb-2.5 flex-row items-end justify-between px-4">
      <View className="flex-1 pr-3">
        <Text className="text-[20px] font-bold tracking-tight text-white">{title}</Text>
        {subtitle ? <Text className="mt-1 text-sm text-zinc-400">{subtitle}</Text> : null}
      </View>
      {rightLabel && onRightPress ? (
        <AnimatedPressable
          onPress={onRightPress}
          className="flex-row items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5"
          accessibilityRole="button"
          accessibilityLabel={rightLabel}
        >
          <Text className="text-xs font-semibold uppercase tracking-[0.7px] text-zinc-300">{rightLabel}</Text>
          <Ionicons name={rightIcon} size={12} color="#A1A1AA" />
        </AnimatedPressable>
      ) : null}
    </View>
  );
}
