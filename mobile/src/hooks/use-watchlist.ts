import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToWatchlist, getWatchlist, removeFromWatchlist } from "@/lib/api";
import { resolveActiveProfileId } from "@/lib/active-profile";
import {
  getStoredWatchlist,
  saveStoredWatchlist,
} from "@/lib/watchlist-storage";
import { getCacheFirst, writeCache, WATCHLIST_CACHE_TTL_MS } from "@/lib/persistent-cache";
import type { Content } from "@/types/content";

const WATCHLIST_KEY = ["watchlist"];

export function useWatchlist() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: WATCHLIST_KEY,
    queryFn: async () => {
      const local = await getStoredWatchlist();

      try {
        const profileId = await resolveActiveProfileId();
        if (!profileId) {
          return local;
        }

        const cachedOrRemote = await getCacheFirst<Content[]>({
          key: `watchlist/${profileId}`,
          maxAgeMs: WATCHLIST_CACHE_TTL_MS,
          fetcher: () => getWatchlist(profileId),
          onBackgroundUpdate: (fresh) => {
            queryClient.setQueryData(WATCHLIST_KEY, fresh);
            void saveStoredWatchlist(fresh);
          },
        });

        await saveStoredWatchlist(cachedOrRemote);
        return cachedOrRemote;
      } catch {
        return local;
      }
    },
    staleTime: Infinity,
  });
}

export function useToggleWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: Content) => {
      const current = await getStoredWatchlist();

      try {
        const profileId = await resolveActiveProfileId();

        if (!profileId) {
          throw new Error("No active profile");
        }

        const remoteCurrent = await getWatchlist(profileId);
        const exists = remoteCurrent.some((item) => item.id === content.id && item.type === content.type);

        if (exists) {
          await removeFromWatchlist(profileId, content);
        } else {
          await addToWatchlist(profileId, content);
        }

        const nextRemote = await getWatchlist(profileId);
        await writeCache(`watchlist/${profileId}`, nextRemote);
        await saveStoredWatchlist(nextRemote);
        return nextRemote;
      } catch {
        const exists = current.some((item) => item.id === content.id && item.type === content.type);
        const nextLocal = exists
          ? current.filter((item) => !(item.id === content.id && item.type === content.type))
          : [content, ...current];

        await saveStoredWatchlist(nextLocal);
        return nextLocal;
      }
    },
    onSuccess: (next) => {
      queryClient.setQueryData(WATCHLIST_KEY, next);
    },
  });
}
