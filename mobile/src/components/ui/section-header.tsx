import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, space, radius, type as t } from "@/lib/tokens";

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
    <View style={s.root}>
      <View style={s.left}>
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>

      {rightLabel && onRightPress ? (
        <Pressable
          onPress={onRightPress}
          accessibilityRole="button"
          accessibilityLabel={rightLabel}
          style={({ pressed }) => [s.rightBtn, pressed && { opacity: 0.8 }]}
        >
          <Text style={s.rightLabel}>{rightLabel}</Text>
          <Ionicons name={rightIcon} size={12} color={colors.text20} />
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: space[4],
    paddingTop: space[2],
    marginBottom: space[3],
  },
  left: {
    flex: 1,
    paddingRight: space[3],
  },
  title: {
    fontSize: t.size.lg,
    fontWeight: t.weight.bold,
    color: colors.text100,
    letterSpacing: t.tracking.tight,
  },
  subtitle: {
    fontSize: t.size.xs,
    color: colors.text40,
    marginTop: space[1],
    lineHeight: t.size.xs * 1.5,
  },
  rightBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: space[1],
    paddingHorizontal: space[3],
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    backgroundColor: "transparent",
  },
  rightLabel: {
    fontSize: 10,
    fontWeight: t.weight.semibold,
    color: colors.text40,
    letterSpacing: t.tracking.wider,
    textTransform: "uppercase",
  },
});
