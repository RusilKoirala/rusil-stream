'use client';

import { useEffect, useRef } from 'react';

interface VidriftPlayerProps {
  tmdbId: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title?: string;
  color?: string;
  autoPlay?: boolean;
  onProgressUpdate?: (progress: any) => void;
}

export function VidriftPlayer({
  tmdbId,
  type,
  season,
  episode,
  title,
  color = 'e50914',
  autoPlay = false,
  onProgressUpdate,
}: VidriftPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Listen for player events
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://vidrift.net') return;

      const { type: eventType, data } = event.data;

      if (eventType === 'PLAYER_EVENT') {
        // Handle play, pause, timeupdate, seeked, ended events
        console.log('Player event:', data.event, data);

        // Save progress to localStorage
        if (data.event === 'timeupdate') {
          saveProgress(data);
        }

        if (onProgressUpdate) {
          onProgressUpdate(data);
        }
      }

      if (eventType === 'MEDIA_DATA') {
        // Full progress data with metadata
        console.log('Media data:', data);
        saveProgress(data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onProgressUpdate]);

  const saveProgress = (data: any) => {
    try {
      const progressData = {
        id: parseInt(tmdbId),
        title: title || 'Unknown',
        mediaType: type,
        season: season,
        episode: episode,
        progress: data.currentTime,
        duration: data.duration,
        poster: '', // TODO: Add poster
        backdrop: '', // TODO: Add backdrop
        updatedAt: Date.now(),
      };

      // Get existing history
      const stored = localStorage.getItem('continue_watching');
      let history = stored ? JSON.parse(stored) : [];

      // Remove old entry for same content
      history = history.filter((item: any) => {
        if (item.id !== progressData.id) return true;
        if (type === 'tv') {
          return !(item.season === season && item.episode === episode);
        }
        return false;
      });

      // Add new entry at front
      history.unshift(progressData);

      // Keep only last 50
      localStorage.setItem('continue_watching', JSON.stringify(history.slice(0, 50)));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  // Build embed URL
  let embedUrl = '';
  if (type === 'movie') {
    embedUrl = `https://vidrift.net/embed/movie/${tmdbId}`;
  } else {
    embedUrl = `https://vidrift.net/embed/tv/${tmdbId}/${season}/${episode}`;
  }

  // Add parameters
  const params = new URLSearchParams();
  params.set('color', color);
  params.set('autoPlay', autoPlay.toString());
  if (type === 'tv') {
    params.set('nextEpisode', 'true');
    params.set('episodeSelector', 'true');
  }

  const fullUrl = `${embedUrl}?${params.toString()}`;

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        ref={iframeRef}
        src={fullUrl}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        style={{ border: 'none' }}
      />
    </div>
  );
}
