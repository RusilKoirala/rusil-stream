import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { AnimatedPressable } from "@/components/ui/animated-pressable";

interface StateViewProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function StateView({ icon, title, description, actionLabel, onAction }: StateViewProps) {
  return (
    <View className="mx-4 mt-6 items-center rounded-3xl border border-white/10 bg-[#0E1420]/95 px-6 py-8">
      <View className="h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/5">
        <Ionicons name={icon} size={24} color="#C4CBD8" />
      </View>
      <Text className="mt-4 text-center text-xl font-bold text-white">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-6 text-zinc-400">{description}</Text>
      {actionLabel && onAction ? (
        <AnimatedPressable
          onPress={onAction}
          className="mt-5 rounded-full bg-brand-red px-6 py-3"
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text className="text-sm font-bold text-white">{actionLabel}</Text>
        </AnimatedPressable>
      ) : null}
    </View>
  );
}
