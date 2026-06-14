import { useClerk, useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { PremiumBackground } from "@/components/ui/premium-background";
import { ScreenReveal } from "@/components/ui/screen-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { getApiHealthInfo } from "@/lib/api";

export function SettingsScreen() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { data: apiHealth, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["api-health", "settings"],
    queryFn: getApiHealthInfo,
    staleTime: 30_000,
  });

  return (
    <SafeAreaView className="flex-1 bg-brand-bg px-4" edges={["top"]}>
      <PremiumBackground />
      <ScreenReveal className="flex-1">
        <SectionHeader title="Settings" subtitle="Account and playback preferences" />

        <View className="mt-2 rounded-2xl border border-white/10 bg-brand-card p-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="person-circle-outline" size={18} color="#D1D5DB" />
            <Text className="text-xs uppercase tracking-[2px] text-brand-muted">Signed in as</Text>
          </View>
          <Text className="mt-2 text-base font-semibold text-white">{user?.primaryEmailAddress?.emailAddress || "Unknown user"}</Text>
        </View>

        <View className="mt-4 rounded-2xl border border-white/10 bg-brand-card p-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="cloud-done-outline" size={18} color="#D1D5DB" />
            <Text className="text-xs uppercase tracking-[2px] text-brand-muted">API Status</Text>
          </View>
          {isLoading ? (
            <Text className="mt-2 text-sm text-brand-muted">Checking API connection...</Text>
          ) : isError ? (
            <Text className="mt-2 text-sm text-red-300">Unable to verify backend status.</Text>
          ) : (
            <Text className="mt-2 text-sm text-white">
              {apiHealth?.status === "healthy"
                ? `Connected${typeof apiHealth.collections === "number" ? ` | ${apiHealth.collections} collections` : ""}`
                : `Status: ${apiHealth?.status || "unknown"}`}
            </Text>
          )}

          <AnimatedPressable onPress={() => void refetch()} className="mt-3 self-start rounded-full border border-white/20 px-4 py-2" accessibilityRole="button" accessibilityLabel="Refresh Status">
            <Text className="text-xs font-semibold text-white">{isFetching ? "Refreshing..." : "Refresh Status"}</Text>
          </AnimatedPressable>
        </View>

        <View className="mt-4 rounded-2xl border border-white/10 bg-brand-card p-4">
          <View className="mb-2 flex-row items-center gap-2">
            <Ionicons name="shield-checkmark-outline" size={18} color="#D1D5DB" />
            <Text className="text-xs uppercase tracking-[2px] text-brand-muted">Security</Text>
          </View>
          <Text className="text-sm leading-6 text-brand-muted">
            Ad redirect protection is active in player mode. External browser and app redirects are blocked.
          </Text>
        </View>

        <AnimatedPressable onPress={() => void signOut()} className="mt-8 flex-row items-center justify-center gap-2 rounded-full bg-brand-red px-4 py-3" accessibilityRole="button" accessibilityLabel="Sign Out">
          <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
          <Text className="text-center text-base font-bold text-white">Sign Out</Text>
        </AnimatedPressable>
      </ScreenReveal>
    </SafeAreaView>
  );
}
