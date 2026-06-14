import { Platform } from "react-native";

function normalizeBaseUrl(url: string) {
  const trimmed = url.replace(/\/$/, "");

  if (Platform.OS === "android" && trimmed.includes("localhost")) {
    return trimmed.replace("localhost", "10.0.2.2");
  }

  return trimmed;
}

export const env = {
  appName: process.env.EXPO_PUBLIC_APP_NAME || "Rusil Stream",
  clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
  apiBaseUrl: normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/api"),
  vidkingBaseUrl: normalizeBaseUrl(process.env.EXPO_PUBLIC_VIDKING_BASE_URL || "https://www.vidking.net"),
};
