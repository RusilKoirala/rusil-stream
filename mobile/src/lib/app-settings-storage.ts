import AsyncStorage from "@react-native-async-storage/async-storage";

const APP_SETTINGS_KEY = "@rusilstream/app-settings";

export interface AppSettings {
  autoplayNext: boolean;
  autoplayPreview: boolean;
  downloadOnWifiOnly: boolean;
  videoQuality: "auto" | "low" | "medium" | "high";
  notificationsEnabled: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  autoplayNext: true,
  autoplayPreview: false,
  downloadOnWifiOnly: true,
  videoQuality: "auto",
  notificationsEnabled: true,
};

export async function getStoredAppSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(APP_SETTINGS_KEY);
  if (!raw) {
    return DEFAULT_APP_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;

    return {
      autoplayNext: parsed.autoplayNext ?? DEFAULT_APP_SETTINGS.autoplayNext,
      autoplayPreview: parsed.autoplayPreview ?? DEFAULT_APP_SETTINGS.autoplayPreview,
      downloadOnWifiOnly: parsed.downloadOnWifiOnly ?? DEFAULT_APP_SETTINGS.downloadOnWifiOnly,
      videoQuality: parsed.videoQuality ?? DEFAULT_APP_SETTINGS.videoQuality,
      notificationsEnabled: parsed.notificationsEnabled ?? DEFAULT_APP_SETTINGS.notificationsEnabled,
    };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export async function saveStoredAppSettings(settings: AppSettings) {
  await AsyncStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
}
