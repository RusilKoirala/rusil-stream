'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Plus, Heart, Volume2, VolumeX } from 'lucide-react';
import { useWatchlist, useRatings, useAddToWatchlist, useRemoveFromWatchlist, useSetRating } from '@/lib/hooks/use-user-data';
import { ContentDetailsModal } from './content-details-modal';

interface Content {
  id?: number;
  contentId?: number;
  type?: 'movie' | 'tv';
  contentType?: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
  trailerKey?: string; // YouTube video key for preview
}

interface VideoPreviewCardProps {
  content: Content;
  position?: 'start' | 'middle' | 'end';
  onPlay?: () => void;
  onMoreInfo?: () => void;
  className?: string;
  hoverDelay?: number; // Delay before showing video preview (default: 1500ms)
}

/**
 * VideoPreviewCard Component
 * 
 * Enhanced content card with video preview on hover.
 * Shows a YouTube trailer preview after hovering for a specified duration.
 * Implements Netflix-style hover interactions with smooth animations.
 */
export function VideoPreviewCard({
  content,
  position = 'middle',
  onPlay,
  onMoreInfo,
  className,
  hoverDelay = 1500, // 1.5 seconds default hover delay
}: VideoPreviewCardProps) {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: watchlist = [] } = useWatchlist(profileId || '');
  const { data: ratings = [] } = useRatings(profileId || '');
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();
  const setRating = useSetRating();
  const [isLiked, setIsLiked] = useState(false);
  
  const resolvedContentId = content.id ?? content.contentId;
  const resolvedContentType = content.type ?? content.contentType;
  const resolvedContentIdString = resolvedContentId !== undefined ? String(resolvedContentId) : '';

  useEffect(() => {
    setProfileId(localStorage.getItem('selectedProfileId'));
  }, []);

  useEffect(() => {
    if (!resolvedContentIdString) {
      setIsLiked(false);
      return;
    }

    const userRating = ratings.find((r) => r.contentId === resolvedContentIdString);
    setIsLiked((userRating?.rating ?? 0) > 0);
  }, [ratings, resolvedContentIdString]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (videoTimeoutRef.current) {
        clearTimeout(videoTimeoutRef.current);
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, []);

  // Initialize YouTube Player
  useEffect(() => {
    if (showVideo && content.trailerKey && !playerRef.current) {
      // Load YouTube IFrame API if not already loaded
      if (!(window as any).YT || !(window as any).YT.Player) {
        // Check if script is already being loaded
        if (!(window as any).YT_loading) {
          (window as any).YT_loading = true;
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        // Set up callback or wait for existing callback
        const originalCallback = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
          if (originalCallback) originalCallback();
          initializePlayer();
        };
      } else {
        initializePlayer();
      }
    }
  }, [showVideo, content.trailerKey]);

  const initializePlayer = () => {
    if (!content.trailerKey || playerRef.current || !showVideo) return;

    try {
      const playerElement = document.getElementById(`player-${resolvedContentId}`);
      if (!playerElement) return;

      playerRef.current = new (window as any).YT.Player(`player-${resolvedContentId}`, {
        videoId: content.trailerKey,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 0,
          iv_load_policy: 3,
          playsinline: 1,
          mute: 1,
          loop: 1,
          playlist: content.trailerKey, // Required for looping
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
            if (isMuted) {
              event.target.mute();
            } else {
              event.target.unMute();
            }
          },
          onStateChange: (event: any) => {
            // If video ends, replay it
            if (event.data === (window as any).YT.PlayerState.ENDED) {
              event.target.playVideo();
            }
          },
        },
      });
    } catch (error) {
      console.error('Failed to initialize YouTube player:', error);
    }
  };

  const handleMouseEnter = () => {
    // Quick expansion
    hoverTimeoutRef.current = setTimeout(() => {
      setIsExpanded(true);
    }, 250);

    // Delayed video preview
    if (content.trailerKey) {
      videoTimeoutRef.current = setTimeout(() => {
        setShowVideo(true);
      }, hoverDelay);
    }
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    setShowVideo(false);
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    if (videoTimeoutRef.current) {
      clearTimeout(videoTimeoutRef.current);
      videoTimeoutRef.current = null;
    }

    if (playerRef.current) {
      try {
        playerRef.current.stopVideo();
        playerRef.current.destroy();
        playerRef.current = null;
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const getOriginClass = () => {
    if (position === 'start') return 'origin-left';
    if (position === 'end') return 'origin-right';
    return 'origin-center';
  };

  const handleAddToList = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profileId || !resolvedContentIdString || !resolvedContentType) return;
    try {
      if (isInWatchlist) {
        await removeFromWatchlist.mutateAsync({
          contentId: resolvedContentIdString,
          profileId,
        });
      } else {
        await addToWatchlist.mutateAsync({
          contentId: resolvedContentIdString,
          type: resolvedContentType,
          profileId,
        });
      }
    } catch (error) {
      console.error('Failed to update watchlist:', error);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profileId || !resolvedContentIdString) return;
    try {
      await setRating.mutateAsync({
        contentId: resolvedContentIdString,
        rating: isLiked ? 0 : 10,
        updatedAt: new Date().toISOString(),
        profileId,
      });
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to update rating:', error);
    }
  };

  const isInWatchlist = resolvedContentId !== undefined
    ? watchlist.some((item: any) => item.id === resolvedContentId || item.contentId === resolvedContentId)
    : false;

  if (!content.posterPath) {
    return null;
  }

  return (
    <>
      <article
        ref={containerRef}
        className={cn(
          'relative cursor-pointer transition-transform duration-220 ease-out',
          getOriginClass(),
          isExpanded && 'z-40',
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          onMoreInfo?.();
          setIsDetailsOpen(true);
        }}
        style={{
          transform: isExpanded ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)',
        }}
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-[20px] bg-[#1a1a1a] shadow-[0_10px_24px_rgba(0,0,0,0.42)] transition-shadow duration-220',
            isExpanded && 'shadow-[0_14px_28px_rgba(0,0,0,0.5)]'
          )}
        >
          <div className="relative h-63.75 w-full">
            {/* Poster Image */}
            <Image
              src={content.posterPath}
              alt={content.title}
              fill
              sizes="220px"
              className={cn(
                'object-cover transition-opacity duration-500',
                showVideo && content.trailerKey ? 'opacity-0' : 'opacity-100'
              )}
              loading="lazy"
            />

            {/* Video Preview */}
            {content.trailerKey && (
              <div
                className={cn(
                  'absolute inset-0 transition-opacity duration-500',
                  showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
              >
                <div
                  id={`player-${resolvedContentId}`}
                  className="w-full h-full"
                  style={{
                    pointerEvents: 'none',
                  }}
                />
              </div>
            )}

            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/0 transition-colors duration-200"
              style={{
                backgroundColor: isExpanded ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)',
              }}
            />

            {/* Mute Button (only show when video is playing) */}
            {showVideo && content.trailerKey && (
              <button
                onClick={toggleMute}
                className="absolute top-3 right-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
            )}

            {/* Info Overlay */}
            <div
              className={cn(
                'absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/40 to-transparent p-3 transition-opacity duration-200',
                isExpanded ? 'opacity-100' : 'opacity-0'
              )}
            >
              <div className="mb-2 line-clamp-1 text-xs font-semibold text-white">
                {content.title}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                    isLiked
                      ? 'bg-red-500/80 text-white hover:bg-red-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  )}
                  title="Like"
                >
                  <Heart className={cn('h-3.5 w-3.5', isLiked && 'fill-current')} />
                </button>
                <button
                  onClick={handleAddToList}
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                    isInWatchlist
                      ? 'bg-white/40 text-white hover:bg-white/50'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  )}
                  title={isInWatchlist ? 'Remove from list' : 'Add to list'}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <ContentDetailsModal
        content={{
          ...content,
          id: resolvedContentId ?? 0,
          type: resolvedContentType ?? 'movie',
        }}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onWatch={() => {
          setIsDetailsOpen(false);
          onPlay?.();
          if (!resolvedContentId || !resolvedContentType) {
            return;
          }
          router.push(`/player?id=${resolvedContentId}&type=${resolvedContentType}`);
        }}
        isInWatchlist={isInWatchlist}
        isLiked={isLiked}
      />
    </>
  );
}
