import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { AnimatedPressable } from "@/components/ui/animated-pressable";

interface MenuRowProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  rightText?: string;
  external?: boolean;
  showDivider?: boolean;
}

export function MenuRow({ label, icon, onPress, rightText, external = false, showDivider = true }: MenuRowProps) {
  return (
    <>
      <AnimatedPressable
        onPress={onPress}
        className="flex-row items-center justify-between px-4 py-4"
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5">
            <Ionicons name={icon} size={15} color="#B6BFCD" />
          </View>
          <Text className="text-base font-medium text-zinc-100">{label}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          {rightText ? <Text className="text-xs uppercase tracking-[0.8px] text-zinc-500">{rightText}</Text> : null}
          <Ionicons name={external ? "open-outline" : "chevron-forward"} size={14} color="#7C8494" />
        </View>
      </AnimatedPressable>
      {showDivider ? <View className="mx-4 h-px bg-white/10" /> : null}
    </>
  );
}
