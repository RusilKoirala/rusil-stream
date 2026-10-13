'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/skeleton';
import { X } from 'lucide-react';

interface VidriftProgressData {
  type: 'vidrift:progress';
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  currentTime: number;
  duration: number;
}

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

import { usePlayerSettings } from '@/lib/hooks/use-player-settings';

function PlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastSyncRef = useRef<Record<string, number>>({});
  const pendingSyncRef = useRef<{
    data: VidriftProgressData;
    percent: number;
    meta: Partial<ContinueWatchingItem>;
  } | null>(null);
  const { settings } = usePlayerSettings();

  const id = searchParams.get('id');
  const type = searchParams.get('type') as 'movie' | 'tv';
  const season = searchParams.get('season') ?? '1';
  const episode = searchParams.get('episode') ?? '1';
  const title = searchParams.get('title');
  const resumeTime = searchParams.get('resume'); // Time in seconds to resume from

  const src = useMemo(() => {
    if (!id) return null;

    const baseUrl = 'https://embed.vidrift.net/embed';
    const params = new URLSearchParams();

    params.set('exit', '1');
    if (title) params.set('title', title);
    params.set('brand', 'Rusil Stream');
    params.set('brandLogo', 'https://rusil.me/logo.png');
    params.set('brandColor', settings.brandColor || 'e50914');
    if (settings.watermark) params.set('watermark', '1');
    if (settings.showTitle) params.set('showTitle', '1');
    if (settings.playerLayout === 'labeled') params.set('layout', 'labeled');
    if (settings.uiScale && settings.uiScale !== '1.0') params.set('uiScale', settings.uiScale);
    if (settings.controlBg === 'solid') params.set('controlBg', 'solid');
    if (settings.font && settings.font !== 'Default') params.set('font', settings.font);
    if (settings.preferDub) params.set('dub', '1');
    if (!settings.autoplay) params.set('autoplay', '0');
    if (!settings.startMuted) params.set('muted', '0');

    // Controls to hide
    const hidden: string[] = [];
    if (settings.hideLock) hidden.push('lock');
    if (settings.hideCast) hidden.push('cast');
    if (settings.hidePip) hidden.push('pip');
    if (settings.hideServer) hidden.push('server');
    if (hidden.length > 0) params.set('hide', hidden.join(','));

    const query = params.toString();

    if (type === 'tv') {
      return `${baseUrl}/tv/${id}/${season}/${episode}?${query}`;
    }

    return `${baseUrl}/movie/${id}?${query}`;
  }, [episode, id, season, type, title, settings]);

  // Handle messages from Vidrift player
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://embed.vidrift.net') return;

      switch (event.data.type) {
        case 'vidrift:progress': {
          const data = event.data as VidriftProgressData;
          saveContinueWatching(data);
          break;
        }
        
        case 'vidrift:exit': {
          router.back();
          break;
        }

        case 'vidrift:ended': {
          // Mark as watched and remove from continue watching
          const stored = localStorage.getItem('cinrift_continue_watching');
          if (stored) {
            try {
              const items: ContinueWatchingItem[] = JSON.parse(stored);
              const filtered = items.filter(item => 
                !(item.id === Number(id) && 
                  item.mediaType === type &&
                  (type === 'movie' || (item.season === Number(season) && item.episode === Number(episode))))
              );
              localStorage.setItem('cinrift_continue_watching', JSON.stringify(filtered));
            } catch (error) {
              console.error('Failed to remove from continue watching:', error);
            }
          }

          // Mark finished server-side so it also drops out of Continue Watching on other devices
          const endedDuration = Number(event.data?.duration) || 0;
          syncProgressToDb(
            {
              type: 'vidrift:progress',
              tmdbId: Number(id),
              mediaType: type,
              season: Number(season),
              episode: Number(episode),
              currentTime: endedDuration,
              duration: endedDuration || 1,
            },
            100,
            { title: title || undefined },
          );

          // If TV show and autoplayNext is enabled, auto advance to next episode
          if (type === 'tv' && settings.autoplayNext && id) {
            const nextEp = Number(episode) + 1;
            router.replace(`/player?id=${id}&type=tv&season=${season}&episode=${nextEp}${title ? `&title=${encodeURIComponent(title)}` : ''}`);
          }
          break;
        }
        
        case 'vidrift:paused': {
          // Optional: Show custom UI when paused
          console.log('Player paused at:', event.data.currentTime);
          break;
        }
        
        case 'vidrift:unpaused': {
          // Optional: Hide custom UI when resumed
          console.log('Player resumed at:', event.data.currentTime);
          break;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [id, type, season, episode, router]);

  // Resume playback if coming from continue watching
  useEffect(() => {
    if (resumeTime && iframeRef.current && !isLoading) {
      const timer = setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: 'vidrift:resume',
            currentTime: parseFloat(resumeTime),
          },
          'https://embed.vidrift.net'
        );
      }, 1000); // Wait 1 second for player to be ready

      return () => clearTimeout(timer);
    }
  }, [resumeTime, isLoading]);

  // Send quality preference to VidRift when loaded
  useEffect(() => {
    if (!isLoading && iframeRef.current && settings.quality && settings.quality !== 'Auto') {
      const timer = setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: 'vidrift:quality-preference',
            label: settings.quality,
          },
          'https://embed.vidrift.net'
        );
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isLoading, settings.quality]);

  const saveContinueWatching = async (data: VidriftProgressData) => {
    try {
      const stored = localStorage.getItem('cinrift_continue_watching');
      let items: ContinueWatchingItem[] = stored ? JSON.parse(stored) : [];

      // Remove existing entry for this content
      items = items.filter(item => 
        !(item.id === data.tmdbId && 
          item.mediaType === data.mediaType &&
          (data.mediaType === 'movie' || (item.season === data.season && item.episode === data.episode)))
      );

      // Don't save if almost finished (>95%)
      const progressPercent = (data.currentTime / data.duration) * 100;
      if (progressPercent > 95) {
        localStorage.setItem('cinrift_continue_watching', JSON.stringify(items));
        // Flush a finished marker so other devices also drop it from Continue Watching
        syncProgressToDb(data, progressPercent, { title: title || undefined });
        return;
      }

      // Fetch title data from TMDB
      let contentData: any = null;
      try {
        const tmdbUrl = data.mediaType === 'movie' 
          ? `https://api.themoviedb.org/3/movie/${data.tmdbId}`
          : `https://api.themoviedb.org/3/tv/${data.tmdbId}`;
        
        const response = await fetch(`${tmdbUrl}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY || ''}`);
        if (response.ok) {
          contentData = await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch TMDB data:', error);
      }

      const titleFromData = contentData?.title || contentData?.name || title || 'Unknown';
      const poster = contentData?.poster_path
        ? `https://image.tmdb.org/t/p/w500${contentData.poster_path}`
        : undefined;
      // Fall back to the poster, then to an empty string. Never use an external
      // placeholder host — next/image only allows hosts from remotePatterns.
      const backdrop = contentData?.backdrop_path
        ? `https://image.tmdb.org/t/p/w780${contentData.backdrop_path}`
        : poster ?? '';
      const year = contentData?.release_date?.split('-')[0] || contentData?.first_air_date?.split('-')[0];
      const rating = contentData?.vote_average;

      // Add new entry
      const newItem: ContinueWatchingItem = {
        id: data.tmdbId,
        title: titleFromData,
        year,
        rating,
        poster,
        backdrop,
        mediaType: data.mediaType,
        season: data.season,
        episode: data.episode,
        progress: data.currentTime,
        duration: data.duration,
        updatedAt: Date.now(),
      };

      items.unshift(newItem);

      // Keep only last 20 items
      items = items.slice(0, 20);

      localStorage.setItem('cinrift_continue_watching', JSON.stringify(items));

      // Mirror to the database for cross-device Continue Watching (throttled)
      syncProgressToDb(data, progressPercent, newItem);
    } catch (error) {
      console.error('Failed to save continue watching:', error);
    }
  };

  // Persist watch history to the database so it syncs across devices.
  // Requires an active profile; throttled per-title to avoid spamming on timeupdate.
  const syncProgressToDb = async (
    data: VidriftProgressData,
    progressPercent: number,
    meta: Partial<ContinueWatchingItem>,
    options?: { force?: boolean },
  ) => {
    const profileId = typeof window !== 'undefined' ? localStorage.getItem('selectedProfileId') : null;
    if (!profileId) return;

    // Always keep the newest snapshot so leaving the page can flush it.
    pendingSyncRef.current = { data, percent: progressPercent, meta };

    const contentId = Number(data.tmdbId);
    const duration = Number(data.duration);
    const currentTime = Number(data.currentTime);

    // Vidrift broadcasts progress before the track metadata resolves (duration 0),
    // which the API schema rejects, so wait until we have real numbers.
    if (!Number.isFinite(contentId) || contentId <= 0) return;
    if (!Number.isFinite(duration) || duration <= 0) return;

    const safeCurrent = Number.isFinite(currentTime) && currentTime > 0 ? currentTime : 0;
    const percent = Number.isFinite(progressPercent)
      ? progressPercent
      : (safeCurrent / duration) * 100;
    const isFinished = percent > 95;

    const key = `${contentId}-${data.mediaType}-${data.season ?? ''}-${data.episode ?? ''}`;
    const now = Date.now();
    // Throttle frequent timeupdate posts to every 10s, but always flush on finish/leave.
    if (!options?.force && !isFinished && now - (lastSyncRef.current[key] ?? 0) < 10000) return;
    lastSyncRef.current[key] = now;

    const seasonNumber = Number(data.season);
    const episodeNumber = Number(data.episode);
    const rating = Number(meta.rating);

    try {
      const response = await fetch('/api/watch-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Survive navigating away from the player mid-save.
        keepalive: true,
        cache: 'no-store',
        body: JSON.stringify({
          profileId,
          contentId,
          contentType: data.mediaType,
          ...(data.mediaType === 'tv'
            ? {
                episodeId: `${Number.isFinite(seasonNumber) ? seasonNumber : 1}-${
                  Number.isFinite(episodeNumber) ? episodeNumber : 1
                }`,
                ...(Number.isFinite(seasonNumber) ? { seasonNumber } : {}),
                ...(Number.isFinite(episodeNumber) ? { episodeNumber } : {}),
              }
            : {}),
          currentTime: Math.floor(safeCurrent),
          duration: Math.floor(duration),
          percentageWatched: Math.min(100, Math.max(0, Math.round(percent))),
          title: meta.title,
          posterPath: meta.poster ?? null,
          backdropPath: meta.backdrop ?? null,
          year: meta.year,
          ...(Number.isFinite(rating) ? { rating } : {}),
        }),
      });

      if (!response.ok) {
        // Reset the throttle so the next progress tick retries right away.
        lastSyncRef.current[key] = 0;
        console.error(
          'Watch progress sync failed:',
          response.status,
          await response.text().catch(() => ''),
        );
        return;
      }

      pendingSyncRef.current = null;
    } catch (error) {
      lastSyncRef.current[key] = 0;
      console.error('Failed to sync watch progress to DB:', error);
    }
  };

  // Flush the latest position when leaving or hiding the player so short sessions
  // still reach the database and show up on other devices.
  useEffect(() => {
    const flush = () => {
      const pending = pendingSyncRef.current;
      if (!pending) return;
      void syncProgressToDb(pending.data, pending.percent, pending.meta, { force: true });
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!src) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/70">No content selected</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-white/70">Loading player...</p>
          </div>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
        aria-label="Go back"
      >
        <X className="h-5 w-5" />
      </button>

      <iframe
        ref={iframeRef}
        src={src}
        title="Vidrift Player"
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense
      fallback={
        <main className="h-screen w-full bg-black flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-white/70">Loading...</p>
          </div>
        </main>
      }
    >
      <main>
        <PlayerContent />
      </main>
    </Suspense>
  );
}
