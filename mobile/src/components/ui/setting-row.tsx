import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { colors, space, radius, type as t } from "@/lib/tokens";

interface SettingRowProps {
  label: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  rightContent: React.ReactNode;
  onPress?: () => void;
  showDivider?: boolean;
}

export function SettingRow({
  label,
  description,
  icon,
  rightContent,
  onPress,
  showDivider = true,
}: SettingRowProps) {
  const content = (
    <View style={s.row}>
      <View style={s.iconWrap}>
        <Ionicons name={icon} size={16} color={colors.text60} />
      </View>
      <View style={s.textBlock}>
        <Text style={s.label}>{label}</Text>
        {description ? <Text style={s.desc}>{description}</Text> : null}
      </View>
      <View style={s.right}>{rightContent}</View>
    </View>
  );

  return (
    <>
      {onPress ? (
        <AnimatedPressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          {content}
        </AnimatedPressable>
      ) : (
        content
      )}
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
  textBlock: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: t.size.base,
    fontWeight: t.weight.medium,
    color: colors.text80,
  },
  desc: {
    fontSize: t.size.xs,
    color: colors.text40,
    lineHeight: t.size.xs * 1.5,
  },
  right: {
    alignItems: "flex-end",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: space[4],
  },
});
