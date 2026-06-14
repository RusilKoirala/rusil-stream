import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { PremiumBackground } from "@/components/ui/premium-background";
import { ScreenReveal } from "@/components/ui/screen-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { StateView } from "@/components/ui/state-view";
import { useNetworkStatus } from "@/hooks/use-network-status";

export function DownloadsScreen() {
  const { isOffline } = useNetworkStatus();

  return (
    <SafeAreaView className="flex-1 bg-brand-bg" edges={["top"]}>
      <PremiumBackground />
      <OfflineBanner visible={isOffline} />
      <ScreenReveal className="flex-1">
        <SectionHeader title="Downloads" subtitle="Offline viewing, coming soon" />

        {isOffline ? (
          <StateView
            icon="wifi-off-outline"
            title="No connection"
            description="Connect to the internet to browse titles before downloading them."
          />
        ) : (
          <StateView
            icon="download-outline"
            title="Downloads coming soon"
            description="You will be able to save movies and shows for offline playback in a future release."
          />
        )}
      </ScreenReveal>
    </SafeAreaView>
  );
}
