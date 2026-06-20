import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { colors, space, radius, type as t } from "@/lib/tokens";

interface MenuRowProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  rightText?: string;
  external?: boolean;
  showDivider?: boolean;
  destructive?: boolean;
}

export function MenuRow({
  label,
  icon,
  onPress,
  rightText,
  external = false,
  showDivider = true,
  destructive = false,
}: MenuRowProps) {
  return (
    <>
      <AnimatedPressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={s.row}
      >
        {/* Icon */}
        <View style={s.iconWrap}>
          <Ionicons name={icon} size={16} color={destructive ? colors.error : colors.text60} />
        </View>

        {/* Label */}
        <Text style={[s.label, destructive && { color: colors.error }]}>{label}</Text>

        {/* Right side */}
        <View style={s.right}>
          {rightText ? <Text style={s.rightText}>{rightText}</Text> : null}
          <Ionicons
            name={external ? "open-outline" : "chevron-forward"}
            size={14}
            color={colors.text20}
          />
        </View>
      </AnimatedPressable>

      {showDivider && <View style={s.divider} />}
    </>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: space[4],
    paddingHorizontal: space[4],
    gap: space[3],
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.bgHighest,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    fontSize: t.size.base,
    fontWeight: t.weight.medium,
    color: colors.text80,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
  },
  rightText: {
    fontSize: t.size.xs,
    color: colors.text40,
    fontWeight: t.weight.medium,
    textTransform: "uppercase",
    letterSpacing: t.tracking.wide,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: space[4],
  },
});
