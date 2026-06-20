import { Ionicons } from "@expo/vector-icons";
import { ActionSheetIOS, Alert, Platform, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MenuRow } from "@/components/ui/menu-row";
import { ScreenReveal } from "@/components/ui/screen-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { SettingRow } from "@/components/ui/setting-row";
import { clearHeroLogoCache } from "@/components/ui/hero-banner";
import { AppSettings } from "@/lib/app-settings-storage";
import { useAppSettings } from "@/hooks/use-app-settings";
import { colors, space, radius, type as t } from "@/lib/tokens";

const VIDEO_QUALITY_OPTIONS = ["Auto", "Low", "Medium", "High"] as const;
type VideoQualityLabel = (typeof VIDEO_QUALITY_OPTIONS)[number];
const TO_LABEL: Record<AppSettings["videoQuality"], VideoQualityLabel> = {
  auto: "Auto", low: "Low", medium: "Medium", high: "High",
};
const TO_VALUE: Record<VideoQualityLabel, AppSettings["videoQuality"]> = {
  Auto: "auto", Low: "low", Medium: "medium", High: "high",
};

export function AppSettingsScreen() {
  const { settings, updateSetting } = useAppSettings();
  const { autoplayNext, autoplayPreview, downloadOnWifiOnly, notificationsEnabled, videoQuality } = settings;

  const [savedFeedback, setSavedFeedback] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const showFeedback = () => {
    setSavedFeedback(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSavedFeedback(false), 1600);
  };

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    updateSetting(key, value);
    showFeedback();
  };

  const pickQuality = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Cancel", ...VIDEO_QUALITY_OPTIONS], cancelButtonIndex: 0, title: "Video Quality" },
        (i) => { if (i > 0) update("videoQuality", TO_VALUE[VIDEO_QUALITY_OPTIONS[i - 1]]); }
      );
    } else {
      Alert.alert("Video Quality", "Select quality", [
        ...VIDEO_QUALITY_OPTIONS.map((l) => ({ text: l, onPress: () => update("videoQuality", TO_VALUE[l]) })),
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const clearCache = () => {
    Alert.alert("Clear Cache", "Removes all cached content. Data will reload from the network.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear", style: "destructive",
        onPress: async () => {
          clearHeroLogoCache();
          const keys = await AsyncStorage.getAllKeys();
          const cacheKeys = keys.filter((k) => k.startsWith("@rusilstream/cache/"));
          if (cacheKeys.length) await AsyncStorage.multiRemove(cacheKeys);
        },
      },
    ]);
  };

  const clearSearch = () => {
    Alert.alert("Clear Search History", "Your search history will be permanently deleted.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear", style: "destructive",
        onPress: async () => { await AsyncStorage.removeItem("@rusilstream/search-history"); },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ScreenReveal style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <SectionHeader title="App Settings" subtitle="Playback and device preferences" />

          {savedFeedback && (
            <View style={s.savedBanner}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={s.savedText}>Settings saved</Text>
            </View>
          )}

          {/* Playback toggles */}
          <View style={s.card}>
            <SettingRow
              label="Autoplay Next Episode"
              description="Plays the next episode automatically when one ends"
              icon="play-forward-outline"
              rightContent={
                <Switch
                  value={autoplayNext}
                  onValueChange={(v) => update("autoplayNext", v)}
                  trackColor={{ false: colors.bgHighest, true: colors.red }}
                  thumbColor={colors.text100}
                />
              }
            />
            <SettingRow
              label="Autoplay Previews"
              description="Plays previews while browsing the home screen"
              icon="film-outline"
              rightContent={
                <Switch
                  value={autoplayPreview}
                  onValueChange={(v) => update("autoplayPreview", v)}
                  trackColor={{ false: colors.bgHighest, true: colors.red }}
                  thumbColor={colors.text100}
                />
              }
            />
            <SettingRow
              label="Wi-Fi Only Downloads"
              description="Prevents downloads over mobile data"
              icon="wifi-outline"
              rightContent={
                <Switch
                  value={downloadOnWifiOnly}
                  onValueChange={(v) => update("downloadOnWifiOnly", v)}
                  trackColor={{ false: colors.bgHighest, true: colors.red }}
                  thumbColor={colors.text100}
                />
              }
            />
            <SettingRow
              label="Notifications"
              description="Alerts for new content and updates"
              icon="notifications-outline"
              rightContent={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(v) => update("notificationsEnabled", v)}
                  trackColor={{ false: colors.bgHighest, true: colors.red }}
                  thumbColor={colors.text100}
                />
              }
            />
            <SettingRow
              label="Video Quality"
              description="Streaming resolution preference"
              icon="speedometer-outline"
              onPress={pickQuality}
              showDivider={false}
              rightContent={
                <View style={s.qualityRow}>
                  <Text style={s.qualityText}>{TO_LABEL[videoQuality]}</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.text20} />
                </View>
              }
            />
          </View>

          {/* Danger zone */}
          <View style={s.card}>
            <MenuRow label="Clear Cache"          icon="trash-outline"  onPress={clearCache} />
            <MenuRow label="Clear Search History" icon="search-outline" onPress={clearSearch} showDivider={false} />
          </View>
        </ScrollView>
      </ScreenReveal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 48, gap: space[3] },

  savedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
    marginHorizontal: space[4],
    paddingVertical: space[2],
  },
  savedText: {
    fontSize: t.size.sm,
    fontWeight: t.weight.medium,
    color: colors.success,
  },
  card: {
    marginHorizontal: space[4],
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  qualityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
  },
  qualityText: {
    fontSize: t.size.sm,
    color: colors.text40,
    fontWeight: t.weight.medium,
  },
});
