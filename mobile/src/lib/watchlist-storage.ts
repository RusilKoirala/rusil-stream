import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Content } from "@/types/content";

const WATCHLIST_KEY = "@rusilstream/watchlist";
const PROFILE_KEY = "@rusilstream/selected-profile-id";

export async function getStoredWatchlist(): Promise<Content[]> {
  const raw = await AsyncStorage.getItem(WATCHLIST_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Content[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveStoredWatchlist(items: Content[]) {
  await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(items));
}

export async function getStoredProfileId(): Promise<string | null> {
  return AsyncStorage.getItem(PROFILE_KEY);
}

export async function saveStoredProfileId(profileId: string) {
  await AsyncStorage.setItem(PROFILE_KEY, profileId);
}

export async function clearStoredProfileId() {
  await AsyncStorage.removeItem(PROFILE_KEY);
}
