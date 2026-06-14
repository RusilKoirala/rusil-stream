import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useState } from "react";
import { Linking, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuRow } from "@/components/ui/menu-row";
import { PremiumBackground } from "@/components/ui/premium-background";
import { ScreenReveal } from "@/components/ui/screen-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { getApiHealthInfo } from "@/lib/api";

async function openExternal(url: string): Promise<string | null> {
  const supported = await Linking.canOpenURL(url);
  if (!supported) {
    return `Cannot open this link on your device`;
  }
  await Linking.openURL(url);
  return null;
}

function ApiStatusDot({ status }: { status: "healthy" | "unhealthy" | "unknown" }) {
  const color =
    status === "healthy" ? "#22C55E" : status === "unhealthy" ? "#EF4444" : "#EAB308";
  return (
    <View
      style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }}
    />
  );
}

function ApiStatusLabel({ status }: { status: "healthy" | "unhealthy" | "unknown" }) {
  const label =
    status === "healthy" ? "Healthy" : status === "unhealthy" ? "Unhealthy" : "Unknown";
  const color =
    status === "healthy" ? "#22C55E" : status === "unhealthy" ? "#EF4444" : "#EAB308";
  return <Text style={{ color, fontSize: 14 }}>{label}</Text>;
}

export function HelpScreen() {
  const [linkErrors, setLinkErrors] = useState<Record<string, string>>({});

  const { data: healthData } = useQuery({
    queryKey: ["api-health"],
    queryFn: getApiHealthInfo,
    staleTime: 30_000,
  });

  const apiStatus = healthData?.status ?? "unknown";
  const appVersion = Constants.expoConfig?.version ?? "—";

  async function handleLink(key: string, url: string) {
    const error = await openExternal(url);
    setLinkErrors((prev) => {
      if (error) return { ...prev, [key]: error };
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-bg" edges={["top"]}>
      <PremiumBackground />
      <ScreenReveal className="flex-1">
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 24 }}>
          <SectionHeader title="Help" subtitle="Get support or open help resources" />

          <View className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0D12]">
            <MenuRow label="Open Help Website" icon="globe-outline" external onPress={() => void handleLink("help-website", "https://rusil.me")} />
            {linkErrors["help-website"] ? <Text className="px-4 pb-2 text-xs text-red-400">{linkErrors["help-website"]}</Text> : null}

            <MenuRow label="Contact Support" icon="mail-outline" external onPress={() => void handleLink("contact-support", "mailto:support@rusil.me")} />
            {linkErrors["contact-support"] ? <Text className="px-4 pb-2 text-xs text-red-400">{linkErrors["contact-support"]}</Text> : null}

            <MenuRow label="FAQ and Documentation" icon="document-text-outline" external onPress={() => void handleLink("faq", "https://rusil.me/faq")} />
            {linkErrors["faq"] ? <Text className="px-4 pb-2 text-xs text-red-400">{linkErrors["faq"]}</Text> : null}

            <MenuRow label="Send Feedback" icon="chatbubble-outline" external onPress={() => void handleLink("send-feedback", "mailto:support@rusil.me?subject=Rusil%20Stream%20Feedback")} />
            {linkErrors["send-feedback"] ? <Text className="px-4 pb-2 text-xs text-red-400">{linkErrors["send-feedback"]}</Text> : null}

            <MenuRow label="Privacy Policy" icon="shield-checkmark-outline" external onPress={() => void handleLink("privacy-policy", "https://rusil.me/privacy")} showDivider={false} />
            {linkErrors["privacy-policy"] ? <Text className="px-4 pb-2 text-xs text-red-400">{linkErrors["privacy-policy"]}</Text> : null}
          </View>

          <View className="mt-4 rounded-2xl border border-white/10 bg-[#0B0D12]">
            <View className="flex-row items-center justify-between border-b border-white/10 px-4 py-4">
              <View className="flex-row items-center gap-3">
                <Ionicons name="pulse-outline" size={18} color="#A1A1AA" />
                <Text className="text-base text-zinc-200">API Status</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <ApiStatusDot status={apiStatus} />
                <ApiStatusLabel status={apiStatus} />
              </View>
            </View>

            <View className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-row items-center gap-3">
                <Ionicons name="information-circle-outline" size={18} color="#A1A1AA" />
                <Text className="text-base text-zinc-200">App Version</Text>
              </View>
              <Text className="text-sm text-zinc-400">{appVersion}</Text>
            </View>
          </View>
        </ScrollView>
      </ScreenReveal>
    </SafeAreaView>
  );
}
