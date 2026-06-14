import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";

interface SettingRowProps {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  rightContent: React.ReactNode;
  onPress?: () => void;
  showDivider?: boolean;
}

export function SettingRow({ label, description, icon, rightContent, onPress, showDivider = true }: SettingRowProps) {
  const content = (
    <View className="flex-row items-center justify-between px-4 py-4">
      <View className="flex-1 flex-row items-center pr-4">
        <View className="mr-3 h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5">
          <Ionicons name={icon} size={15} color="#B6BFCD" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-zinc-100">{label}</Text>
          <Text className="mt-1 text-xs text-zinc-400">{description}</Text>
        </View>
      </View>
      {rightContent}
    </View>
  );

  return (
    <>
      {onPress ? (
        <AnimatedPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
          {content}
        </AnimatedPressable>
      ) : (
        content
      )}
      {showDivider ? <View className="mx-4 h-px bg-white/10" /> : null}
    </>
  );
}
