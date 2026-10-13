'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProfiles, useUpdateProfile } from './use-user-data';

export interface PlayerSettings {
  // VidRift Playback Options
  quality: 'Auto' | '1080p' | '720p' | '480p' | '360p';
  preferDub: boolean; // ?dub=1 (English dub vs original)
  autoplay: boolean; // autoplay=1 vs 0
  startMuted: boolean; // muted=1 vs 0
  autoplayNext: boolean; // Auto next episode countdown
  skipIntros: boolean; // Auto-skip intro & recaps
  playerLayout: 'default' | 'labeled'; // layout=labeled (worded controls)
  uiScale: '0.85' | '1.0' | '1.5'; // uiScale (TV-sized vs compact)

  // VidRift Appearance & Branding
  brandColor: string; // Hex color without # (e.g. e50914)
  watermark: boolean; // watermark=1 (small corner brand bug)
  controlBg: 'gradient' | 'solid'; // controlBg=solid (dark strip for contrast)
  font: string; // Google font name (e.g. Inter, Bebas Neue, Outfit)
  showTitle: boolean; // showTitle=1 (keeps title visible in windowed)

  // VidRift Control Toggles (hide=...)
  hideLock: boolean; // hide=lock
  hideCast: boolean; // hide=cast
  hidePip: boolean; // hide=pip
  hideServer: boolean; // hide=server

  // Platform Experience
  heroTrailer: boolean; // Autoplay trailer on home banner
  cardPreviews: boolean; // Autoplay video preview on hover
}

export const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
  quality: 'Auto',
  preferDub: false,
  autoplay: true,
  startMuted: true,
  autoplayNext: true,
  skipIntros: true,
  playerLayout: 'labeled',
  uiScale: '1.0',
  brandColor: 'e50914',
  watermark: true,
  controlBg: 'gradient',
  font: 'Inter',
  showTitle: true,
  hideLock: false,
  hideCast: false,
  hidePip: false,
  hideServer: false,
  heroTrailer: true,
  cardPreviews: true,
};

const STORAGE_KEY = 'rusil_stream_player_settings';
const SETTINGS_EVENT = 'rusil-stream-settings-change';

export function getStoredPlayerSettings(): PlayerSettings {
  if (typeof window === 'undefined') return DEFAULT_PLAYER_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PLAYER_SETTINGS;
    return { ...DEFAULT_PLAYER_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PLAYER_SETTINGS;
  }
}

export function usePlayerSettings() {
  const [settings, setSettings] = useState<PlayerSettings>(DEFAULT_PLAYER_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const { data: profiles = [] } = useProfiles();
  const updateProfile = useUpdateProfile();

  // Load from localStorage on mount
  useEffect(() => {
    const local = getStoredPlayerSettings();
    setSettings(local);
    setIsLoaded(true);

    const onStorage = () => {
      setSettings(getStoredPlayerSettings());
    };

    window.addEventListener(SETTINGS_EVENT, onStorage);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SETTINGS_EVENT, onStorage);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Sync with current profile preferences from DB if available
  useEffect(() => {
    if (!isLoaded || profiles.length === 0) return;
    const currentProfileId = localStorage.getItem('selectedProfileId');
    const profile = profiles.find((p) => (p.id || p._id) === currentProfileId) || profiles[0];

    const dbSettings = (profile?.preferences as any)?.playerSettings;
    if (dbSettings && typeof dbSettings === 'object') {
      const merged = { ...DEFAULT_PLAYER_SETTINGS, ...getStoredPlayerSettings(), ...dbSettings };
      setSettings(merged);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
  }, [profiles, isLoaded]);

  const updateSetting = useCallback(
    async <K extends keyof PlayerSettings>(key: K, value: PlayerSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          window.dispatchEvent(new CustomEvent(SETTINGS_EVENT));
        }

        // Persist to MongoDB profile in background
        const currentProfileId = localStorage.getItem('selectedProfileId');
        const profile = profiles.find((p) => (p.id || p._id) === currentProfileId) || profiles[0];
        const profileId = profile?.id || profile?._id;

        if (profileId) {
          const currentPrefs = profile.preferences || ({} as any);
          updateProfile.mutate({
            id: profileId,
            data: {
              preferences: {
                ...currentPrefs,
                playerSettings: next,
              } as any,
            },
          });
        }

        return next;
      });
    },
    [profiles, updateProfile]
  );

  return {
    settings,
    updateSetting,
    isLoaded,
  };
}
