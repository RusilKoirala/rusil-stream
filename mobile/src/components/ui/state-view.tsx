import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { colors, space, radius, type as t } from "@/lib/tokens";

interface StateViewProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function StateView({ icon, title, description, actionLabel, onAction }: StateViewProps) {
  return (
    <View style={s.root}>
      <View style={s.iconBox}>
        <Ionicons name={icon} size={26} color={colors.text40} />
      </View>
      <Text style={s.title}>{title}</Text>
      <Text style={s.desc}>{description}</Text>
      {actionLabel && onAction ? (
        <AnimatedPressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={s.btn}
        >
          <Text style={s.btnText}>{actionLabel}</Text>
        </AnimatedPressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    marginHorizontal: space[4],
    marginTop: space[6],
    alignItems: "center",
    paddingHorizontal: space[6],
    paddingVertical: space[8],
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xxl,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: space[4],
    fontSize: t.size.lg,
    fontWeight: t.weight.bold,
    color: colors.text80,
    textAlign: "center",
    letterSpacing: t.tracking.tight,
  },
  desc: {
    marginTop: space[2],
    fontSize: t.size.sm,
    color: colors.text40,
    textAlign: "center",
    lineHeight: t.size.sm * 1.65,
  },
  btn: {
    marginTop: space[5],
    paddingHorizontal: space[6],
    paddingVertical: space[3],
    backgroundColor: colors.red,
    borderRadius: radius.full,
  },
  btnText: {
    fontSize: t.size.sm,
    fontWeight: t.weight.bold,
    color: colors.text100,
  },
});
