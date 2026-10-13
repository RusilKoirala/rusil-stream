'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Content } from '@/lib/tmdb/types';
import { usePlayerSettings } from '@/lib/hooks/use-player-settings';

interface HorizontalContentRowProps {
  title: string;
  items: Content[];
  enableVideoPreview?: boolean;
  videoPreviewDelay?: number;
}

export function HorizontalContentRow({ 
  title, 
  items,
  enableVideoPreview = false,
  videoPreviewDelay = 1500,
}: HorizontalContentRowProps) {
  const router = useRouter();
  const { settings } = usePlayerSettings();
  const shouldPreview = enableVideoPreview && settings.cardPreviews;

  // Ensure items is an array
  if (!items || !Array.isArray(items) || items.length === 0) {
    return null;
  }

  // Debug: log items to see if logos are present
  console.log(`${title} items:`, items.slice(0, 2));

  return (
    <section className="relative px-4 md:px-8 lg:px-14 py-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>

      {/* Horizontal Scrollable Cards */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.slice(0, 12).map((item) => {
          // Cards use the English backdrop with the title logo baked in, and
          // fall back to the plain artwork. Hero/detail keep using backdropPath.
          const backdrop = item.logoBackdropPath || item.backdropPath || item.posterPath;
          if (!backdrop) return null;

          return shouldPreview ? (
            <VideoPreviewCard
              key={`${item.type}-${item.id}`}
              item={item}
              backdrop={backdrop}
              videoPreviewDelay={videoPreviewDelay}
              router={router}
            />
          ) : (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => router.push(`/player?id=${item.id}&type=${item.type}&title=${encodeURIComponent(item.title)}`)}
              className="group relative flex-shrink-0 w-[400px] rounded-xl overflow-hidden bg-[#1a1a1a] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
            >
              {/* Backdrop Image - SAME SIZE AS CONTINUE WATCHING */}
              <div className="relative w-full h-[225px]">
                <Image
                  src={backdrop}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
                
                {/* Gradient overlay - lighter, only darkens on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/80 group-hover:via-black/40 transition-all duration-300" />

                {/* No logo overlay needed - using English backdrops that have logos */}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// Video Preview Card Component
function VideoPreviewCard({ 
  item, 
  backdrop, 
  videoPreviewDelay, 
  router 
}: { 
  item: Content; 
  backdrop: string; 
  videoPreviewDelay: number;
  router: ReturnType<typeof useRouter>;
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  // Fetch trailer on hover
  useEffect(() => {
    if (isHovering && !trailerKey) {
      fetch(`/api/content/${item.type}/${item.id}/videos`)
        .then(res => res.json())
        .then(data => {
          if (data.results?.length > 0) {
            const trailer = data.results.find(
              (v: { type: string; site: string }) => 
                v.type === 'Trailer' && v.site === 'YouTube'
            );
            if (trailer) {
              setTrailerKey(trailer.key);
            }
          }
        })
        .catch(err => console.error('Failed to fetch trailer:', err));
    }
  }, [isHovering, trailerKey, item.type, item.id]);

  // Handle hover delay and start loading progress
  useEffect(() => {
    if (isHovering && trailerKey) {
      hoverTimeoutRef.current = setTimeout(() => {
        setShowVideo(true);
        
        // Start progress animation
        setLoadingProgress(0);
        setVideoLoaded(false);
        let progress = 0;
        progressIntervalRef.current = setInterval(() => {
          progress += 2; // 100% over 5 seconds
          setLoadingProgress(progress);
          
          if (progress >= 100) {
            setVideoLoaded(true);
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
          }
        }, 100);
      }, videoPreviewDelay);
    } else {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setShowVideo(false);
      setVideoLoaded(false);
      setLoadingProgress(0);
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isHovering, trailerKey, videoPreviewDelay]);

  // Initialize YouTube Player
  useEffect(() => {
    if (showVideo && trailerKey && playerRef.current && !player) {
      // Load YouTube IFrame API
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
          initializePlayer();
        };
      } else {
        initializePlayer();
      }
    }

    function initializePlayer() {
      if (!playerRef.current) return;

      const newPlayer = new window.YT.Player(playerRef.current, {
        videoId: trailerKey!,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          fs: 0,
          disablekb: 1,
          loop: 1,
          playlist: trailerKey!,
          playsinline: 1,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
          autohide: 1,
        } as any,
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
            event.target.setPlaybackQuality?.('hd720');
          },
        },
      });

      setPlayer(newPlayer);
    }

    return () => {
      if (player) {
        player.destroy();
        setPlayer(null);
      }
    };
  }, [showVideo, trailerKey]);

  // Cleanup player when not hovering
  useEffect(() => {
    if (!isHovering && player) {
      player.destroy();
      setPlayer(null);
    }
  }, [isHovering, player]);

  const handleClick = useCallback(() => {
    router.push(`/${item.type}/${item.id}`);
  }, [router, item.id, item.type]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!player) return;
    
    try {
      if (isMuted) {
        player.unMute?.();
      } else {
        player.mute?.();
      }
      setIsMuted(!isMuted);
    } catch (err) {
      console.error('Error toggling mute:', err);
    }
  }, [player, isMuted]);

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
      className="group relative flex-shrink-0 w-[400px] rounded-xl overflow-hidden bg-[#1a1a1a] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      {/* Backdrop Image - Always visible */}
      <div className="relative w-full h-[225px]">
        <Image
          src={backdrop}
          alt={item.title}
          fill
          className="object-cover"
          sizes="400px"
        />
        
        {/* Video Player Overlay - Only visible when loaded */}
        {showVideo && trailerKey && (
          <div 
            className="absolute inset-0 z-10 overflow-hidden"
            style={{
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out',
            }}
          >
            <div 
              ref={playerRef} 
              className="w-full h-full"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '150%',
                height: '150%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
            />
          </div>
        )}
        
        {/* Loading indicator - small corner circle */}
        {showVideo && !videoLoaded && (
          <div className="absolute bottom-2 right-2 z-20">
            <div className="relative w-6 h-6">
              {/* Background circle */}
              <svg className="w-6 h-6 transform -rotate-90">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1.5"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="white"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 10}`}
                  strokeDashoffset={`${2 * Math.PI * 10 * (1 - loadingProgress / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                />
              </svg>
            </div>
          </div>
        )}
        
        {/* Mute/Unmute button - appears when video is loaded */}
        {showVideo && videoLoaded && (
          <button
            onClick={toggleMute}
            className="absolute bottom-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors border border-white/20"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            )}
          </button>
        )}
        
        {/* Gradient overlay - lighter, only darkens on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/80 group-hover:via-black/40 transition-all duration-300" />

        {/* No logo overlay needed - using English backdrops that have logos */}
      </div>
    </div>
  );
}
