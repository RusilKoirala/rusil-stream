import { Ionicons } from "@expo/vector-icons";
import { ActionSheetIOS, Alert, Platform, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MenuRow } from "@/components/ui/menu-row";
import { PremiumBackground } from "@/components/ui/premium-background";
import { ScreenReveal } from "@/components/ui/screen-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { SettingRow } from "@/components/ui/setting-row";
import { clearHeroLogoCache } from "@/components/ui/hero-banner";
import { AppSettings } from "@/lib/app-settings-storage";
import { useAppSettings } from "@/hooks/use-app-settings";

const VIDEO_QUALITY_OPTIONS = ["Auto", "Low", "Medium", "High"] as const;
type VideoQualityLabel = (typeof VIDEO_QUALITY_OPTIONS)[number];

const QUALITY_LABEL_MAP: Record<AppSettings["videoQuality"], VideoQualityLabel> = {
  auto: "Auto",
  low: "Low",
  medium: "Medium",
  high: "High",
};

const QUALITY_VALUE_MAP: Record<VideoQualityLabel, AppSettings["videoQuality"]> = {
  Auto: "auto",
  Low: "low",
  Medium: "medium",
  High: "high",
};

export function AppSettingsScreen() {
  const { settings, updateSetting } = useAppSettings();
  const { autoplayNext, autoplayPreview, downloadOnWifiOnly, notificationsEnabled, videoQuality } = settings;
  const [savedFeedback, setSavedFeedback] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const showSavedFeedback = () => {
    setSavedFeedback(true);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setSavedFeedback(false), 1500);
  };

  const handleAutoplayNextChange = (value: boolean) => {
    updateSetting("autoplayNext", value);
    showSavedFeedback();
  };

  const handleAutoplayPreviewChange = (value: boolean) => {
    updateSetting("autoplayPreview", value);
    showSavedFeedback();
  };

  const handleDownloadOnWifiOnlyChange = (value: boolean) => {
    updateSetting("downloadOnWifiOnly", value);
    showSavedFeedback();
  };

  const handleNotificationsChange = (value: boolean) => {
    updateSetting("notificationsEnabled", value);
    showSavedFeedback();
  };

  const handleVideoQualityPress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", ...VIDEO_QUALITY_OPTIONS],
          cancelButtonIndex: 0,
          title: "Video Quality",
        },
        (buttonIndex) => {
          if (buttonIndex === 0) return;
          const label = VIDEO_QUALITY_OPTIONS[buttonIndex - 1];
          updateSetting("videoQuality", QUALITY_VALUE_MAP[label]);
          showSavedFeedback();
        }
      );
    } else {
      Alert.alert(
        "Video Quality",
        "Select your preferred video quality",
        [
          ...VIDEO_QUALITY_OPTIONS.map((label) => ({
            text: label,
            onPress: () => {
              updateSetting("videoQuality", QUALITY_VALUE_MAP[label]);
              showSavedFeedback();
            },
          })),
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will remove all cached content. The app will reload data from the network.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            clearHeroLogoCache();
            const allKeys = await AsyncStorage.getAllKeys();
            const cacheKeys = allKeys.filter((k) => k.startsWith("@rusilstream/cache/"));
            if (cacheKeys.length > 0) {
              await AsyncStorage.multiRemove(cacheKeys);
            }
          },
        },
      ]
    );
  };

  const handleClearSearchHistory = () => {
    Alert.alert(
      "Clear Search History",
      "Your search history will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("@rusilstream/search-history");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-bg" edges={["top"]}>
      <PremiumBackground />
      <ScreenReveal className="flex-1">
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 24 }}>
          <SectionHeader title="App Settings" subtitle="Playback and app preferences for this device" />

          {savedFeedback && (
            <Text className="mb-2 text-sm font-medium text-[#E50914]">Settings saved</Text>
          )}

          <View className="mt-2 rounded-2xl border border-white/10 bg-[#0B0D12]">
            <SettingRow
              label="Autoplay Next Episode"
              description="Play the next episode automatically"
              icon="play-forward-outline"
              rightContent={
                <Switch
                  value={autoplayNext}
                  onValueChange={handleAutoplayNextChange}
                  trackColor={{ false: "#3f3f46", true: "#E50914" }}
                />
              }
            />

            <SettingRow
              label="Autoplay Previews"
              description="Play previews while browsing"
              icon="film-outline"
              rightContent={
                <Switch
                  value={autoplayPreview}
                  onValueChange={handleAutoplayPreviewChange}
                  trackColor={{ false: "#3f3f46", true: "#E50914" }}
                />
              }
            />

            <SettingRow
              label="Wi-Fi Only Downloads"
              description="Avoid mobile data for downloads"
              icon="wifi-outline"
              rightContent={
                <Switch
                  value={downloadOnWifiOnly}
                  onValueChange={handleDownloadOnWifiOnlyChange}
                  trackColor={{ false: "#3f3f46", true: "#E50914" }}
                />
              }
            />

            <SettingRow
              label="Notifications"
              description="Receive alerts for new content and updates"
              icon="notifications-outline"
              rightContent={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationsChange}
                  trackColor={{ false: "#3f3f46", true: "#E50914" }}
                />
              }
            />

            <SettingRow
              label="Video Quality"
              description="Adjust streaming resolution"
              icon="speedometer-outline"
              onPress={handleVideoQualityPress}
              showDivider={false}
              rightContent={
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm text-zinc-400">{QUALITY_LABEL_MAP[videoQuality]}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                </View>
              }
            />
          </View>

          <View className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0D12]">
            <MenuRow label="Clear Cache" icon="trash-outline" onPress={handleClearCache} />
            <MenuRow label="Clear Search History" icon="search-outline" onPress={handleClearSearchHistory} showDivider={false} />
          </View>
        </ScrollView>
      </ScreenReveal>
    </SafeAreaView>
  );
}
