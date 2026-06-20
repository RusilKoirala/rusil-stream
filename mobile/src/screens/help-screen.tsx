import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuRow } from "@/components/ui/menu-row";
import { ScreenReveal } from "@/components/ui/screen-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { getApiHealthInfo } from "@/lib/api";
import { colors, space, radius, type as t } from "@/lib/tokens";

async function openLink(url: string): Promise<string | null> {
  const ok = await Linking.canOpenURL(url);
  if (!ok) return "Cannot open this link on your device";
  await Linking.openURL(url);
  return null;
}

export function HelpScreen() {
  const [linkErrors, setLinkErrors] = useState<Record<string, string>>({});

  const { data: health } = useQuery({
    queryKey: ["api-health"],
    queryFn: getApiHealthInfo,
    staleTime: 30_000,
  });

  const apiStatus = health?.status ?? "unknown";
  const appVersion = Constants.expoConfig?.version ?? "—";

  async function handleLink(key: string, url: string) {
    const err = await openLink(url);
    setLinkErrors((prev) => {
      if (err) return { ...prev, [key]: err };
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  const statusColor =
    apiStatus === "healthy" ? colors.success :
    apiStatus === "unhealthy" ? colors.error : "#EAB308";

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ScreenReveal style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <SectionHeader title="Help" subtitle="Support and resources" />

          {/* Links */}
          <View style={s.card}>
            {[
              { key: "help",     label: "Help Website",       icon: "globe-outline" as const,          url: "https://rusil.me" },
              { key: "support",  label: "Contact Support",    icon: "mail-outline" as const,           url: "mailto:support@rusil.me" },
              { key: "faq",      label: "FAQ & Docs",         icon: "document-text-outline" as const,  url: "https://rusil.me/faq" },
              { key: "feedback", label: "Send Feedback",      icon: "chatbubble-outline" as const,     url: "mailto:support@rusil.me?subject=Rusil%20Stream%20Feedback" },
              { key: "privacy",  label: "Privacy Policy",     icon: "shield-checkmark-outline" as const, url: "https://rusil.me/privacy" },
            ].map(({ key, label, icon, url }, i, arr) => (
              <View key={key}>
                <MenuRow
                  label={label}
                  icon={icon}
                  external
                  onPress={() => void handleLink(key, url)}
                  showDivider={i < arr.length - 1}
                />
                {linkErrors[key] ? (
                  <Text style={s.linkError}>{linkErrors[key]}</Text>
                ) : null}
              </View>
            ))}
          </View>

          {/* Status info */}
          <View style={s.card}>
            {/* API */}
            <View style={s.infoRow}>
              <View style={s.iconBox}>
                <Ionicons name="pulse-outline" size={16} color={colors.text60} />
              </View>
              <Text style={s.infoLabel}>API Status</Text>
              <View style={s.infoRight}>
                <View style={[s.dot, { backgroundColor: statusColor }]} />
                <Text style={[s.infoValue, { color: statusColor }]}>
                  {apiStatus.charAt(0).toUpperCase() + apiStatus.slice(1)}
                </Text>
              </View>
            </View>

            <View style={s.divider} />

            {/* Version */}
            <View style={s.infoRow}>
              <View style={s.iconBox}>
                <Ionicons name="information-circle-outline" size={16} color={colors.text60} />
              </View>
              <Text style={s.infoLabel}>App Version</Text>
              <Text style={s.infoValue}>{appVersion}</Text>
            </View>
          </View>
        </ScrollView>
      </ScreenReveal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 48, gap: space[3] },

  card: {
    marginHorizontal: space[4],
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  linkError: {
    fontSize: t.size.xs,
    color: colors.error,
    paddingHorizontal: space[4],
    paddingBottom: space[2],
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[3],
    paddingVertical: space[4],
    paddingHorizontal: space[4],
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.bgRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    flex: 1,
    fontSize: t.size.base,
    fontWeight: t.weight.medium,
    color: colors.text80,
  },
  infoRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  infoValue: {
    fontSize: t.size.sm,
    fontWeight: t.weight.medium,
    color: colors.text40,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: space[4],
  },
});
