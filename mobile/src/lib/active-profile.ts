import { getProfilesCached } from "@/lib/api";
import { getStoredProfileId, saveStoredProfileId } from "@/lib/watchlist-storage";

export async function resolveActiveProfileId() {
  const stored = await getStoredProfileId();
  if (stored) return stored;

  const profiles = await getProfilesCached();
  const firstProfile = profiles.find((profile) => profile.id || profile._id);
  const resolvedId = firstProfile?.id || firstProfile?._id;

  if (!resolvedId) return null;

  await saveStoredProfileId(resolvedId);
  return resolvedId;
}