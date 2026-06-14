import { useEffect, useState } from "react";
import {
  AppSettings,
  DEFAULT_APP_SETTINGS,
  getStoredAppSettings,
  saveStoredAppSettings,
} from "@/lib/app-settings-storage";

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    void getStoredAppSettings().then((stored) => {
      if (!cancelled) setSettings(stored);
    });
    return () => { cancelled = true; };
  }, []);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      void saveStoredAppSettings(next);
      return next;
    });
  };

  return { settings, updateSetting };
}
