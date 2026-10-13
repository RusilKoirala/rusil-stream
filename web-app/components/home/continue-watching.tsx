'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ContinueWatchingItem {
  id: number;
  title: string;
  year?: string;
  rating?: number;
  poster?: string;
  backdrop: string;
  mediaType: 'tv' | 'movie';
  season?: number;
  episode?: number;
  progress: number;
  duration: number;
  updatedAt: number;
}

interface WatchProgressDoc {
  contentId: number;
  contentType: 'movie' | 'tv';
  seasonNumber?: number;
  episodeNumber?: number;
  currentTime: number;
  duration: number;
  percentageWatched: number;
  lastWatchedAt: string;
  title?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  year?: string;
  rating?: number;
}

function dedupeKey(item: { id: number; mediaType: string; season?: number; episode?: number }) {
  return `${item.id}-${item.mediaType}-${item.season ?? ''}-${item.episode ?? ''}`;
}

// next/image only allows hosts configured in remotePatterns; legacy cache entries
// (and older rows) may hold a via.placeholder.com URL which would throw at render.
const ALLOWED_IMAGE_HOSTS = ['image.tmdb.org', 'wsrv.nl', 'via.placeholder.com'];

function safeImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return undefined;
    // Treat the placeholder service as “no artwork” so we can render a gradient.
    if (parsed.hostname === 'via.placeholder.com') return undefined;
    return ALLOWED_IMAGE_HOSTS.includes(parsed.hostname) ? url : undefined;
  } catch {
    return undefined;
  }
}

function mapDocToItem(doc: WatchProgressDoc): ContinueWatchingItem {
  const title = doc.title || 'Unknown';
  return {
    id: doc.contentId,
    title,
    year: doc.year,
    rating: doc.rating,
    poster: safeImageUrl(doc.posterPath),
    backdrop: safeImageUrl(doc.backdropPath) || safeImageUrl(doc.posterPath) || '',
    mediaType: doc.contentType,
    season: doc.seasonNumber,
    episode: doc.episodeNumber,
    progress: doc.currentTime,
    duration: doc.duration,
    updatedAt: new Date(doc.lastWatchedAt).getTime() || Date.now(),
  };
}

export function ContinueWatching() {
  const router = useRouter();
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    // 1) Paint instantly from the local cache.
    const readCache = (): ContinueWatchingItem[] => {
      const stored = localStorage.getItem('cinrift_continue_watching');
      if (!stored) return [];
      try {
        const parsed = JSON.parse(stored) as ContinueWatchingItem[];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const cached = readCache()
      .map((item) => ({ ...item, backdrop: safeImageUrl(item.backdrop) || '', poster: safeImageUrl(item.poster) }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    setItems(cached);

    // 2) Reconcile with the database (source of truth across devices).
    const profileId = localStorage.getItem('selectedProfileId');
    if (!profileId) return;

    (async () => {
      try {
        // Always revalidate so a freshly signed-in device sees history saved elsewhere.
        const response = await fetch(`/api/watch-progress?profileId=${profileId}`, { cache: 'no-store' });
        if (!response.ok || cancelled) return;

        const docs = (await response.json()) as WatchProgressDoc[];
        const dbItems = Array.isArray(docs) ? docs.map(mapDocToItem) : [];

        // Merge DB + cache, preferring the most recently updated entry per title.
        const merged = new Map<string, ContinueWatchingItem>();
        for (const item of [...dbItems, ...cached]) {
          const key = dedupeKey(item);
          const existing = merged.get(key);
          if (!existing || item.updatedAt > existing.updatedAt) merged.set(key, item);
        }

        const sorted = [...merged.values()].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 20);
        if (cancelled) return;

        setItems(sorted);
        // Refresh the local cache so offline/next-load stays fast.
        localStorage.setItem('cinrift_continue_watching', JSON.stringify(sorted));
      } catch (error) {
        console.error('Failed to sync continue watching from DB:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const clearHistory = async () => {
    localStorage.removeItem('cinrift_continue_watching');
    setItems([]);

    // Also clear the server-side history for the active profile.
    const profileId = localStorage.getItem('selectedProfileId');
    if (!profileId) return;
    try {
      await fetch(`/api/watch-progress/clear?profileId=${profileId}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to clear watch history on server:', error);
    }
  };

  if (items.length === 0) {
    console.log('No items to display');
    return null;
  }

  console.log('Rendering', items.length, 'items');

  const getProgressPercentage = (item: ContinueWatchingItem) => {
    return Math.round((item.progress / item.duration) * 100);
  };

  const getEpisodeText = (item: ContinueWatchingItem) => {
    if (item.mediaType === 'tv' && item.season && item.episode) {
      return `S${item.season}:E${item.episode}`;
    }
    return null;
  };

  return (
    <section className="relative px-4 md:px-8 lg:px-14 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-white/40 font-semibold mb-1">
            PICK UP WHERE YOU LEFT OFF
          </p>
          <h2 className="text-2xl font-bold text-white">Continue watching</h2>
        </div>
        <button
          onClick={clearHistory}
          className="text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          Clear History
        </button>
      </div>

      {/* Horizontal Scrollable Cards */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => {
          const progressPercent = getProgressPercentage(item);
          const episodeText = getEpisodeText(item);

          return (
            <button
              key={`${item.id}-${item.updatedAt}`}
              onClick={() => {
                const params = new URLSearchParams({
                  id: item.id.toString(),
                  type: item.mediaType,
                  title: item.title,
                  resume: item.progress.toString(),
                });
                
                if (item.season) params.append('season', item.season.toString());
                if (item.episode) params.append('episode', item.episode.toString());
                
                router.push(`/player?${params.toString()}`);
              }}
              className="group relative flex-shrink-0 w-[400px] rounded-xl overflow-hidden bg-[#1a1a1a] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
            >
              {/* Backdrop Image */}
              <div className="relative w-full h-[225px] bg-[#1a1a1a]">
                {item.backdrop ? (
                  <Image
                    src={item.backdrop}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#1a1a1a_0%,#0b0b0d_100%)] px-4">
                    <span className="line-clamp-2 text-center text-sm font-semibold text-white/70">
                      {item.title}
                    </span>
                  </div>
                )}
                
                {/* Gradient overlay - darker on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 group-hover:via-black/60 transition-all duration-300" />

                {/* Content info at bottom-left */}
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="text-white font-semibold text-base mb-1 line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    {episodeText && <span>{episodeText}</span>}
                    {episodeText && <span>·</span>}
                    <span>{progressPercent}%</span>
                  </div>
                </div>
              </div>

              {/* Progress bar - white instead of red */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
