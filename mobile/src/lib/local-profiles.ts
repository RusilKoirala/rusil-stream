import type { ImageSourcePropType } from "react-native";
import type { UserProfile } from "@/lib/api";

const avatarSourceByName: Record<string, ImageSourcePropType> = {
  "avatar1.png": require("../../assets/avatars/avatar1.png"),
  "avatar2.jpeg": require("../../assets/avatars/avatar2.jpeg"),
  "avatar3.png": require("../../assets/avatars/avatar3.png"),
  "avatar4.png": require("../../assets/avatars/avatar4.png"),
};

function extractFileName(pathOrName: string | null | undefined) {
  if (!pathOrName) return null;
  const clean = pathOrName.split("?")[0]?.trim();
  if (!clean) return null;
  const parts = clean.split("/");
  return parts[parts.length - 1] || null;
}

export function getProfileId(profile: UserProfile) {
  return profile.id || profile._id || "";
}

export function getLocalProfileAvatarSource(profile: UserProfile) {
  const fromExplicitName = extractFileName(profile.avatarImageName);
  const fromUrl = extractFileName(profile.avatarUrl);
  const key = fromExplicitName || fromUrl;

  if (!key) {
    return null;
  }

  return avatarSourceByName[key] || null;
}
