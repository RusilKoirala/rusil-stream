'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Play, Plus, Check, Share, Download, ArrowLeft, VolumeX, Volume2, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAddToWatchlist, useRemoveFromWatchlist, useWatchlist, useSetRating, useRatings } from '@/lib/hooks/use-user-data';
import { useTrailer } from '@/lib/hooks/use-trailer';
import { BufferLoader } from '@/components/ui/buffer-loader';

interface MovieDetailScreenProps {
  id: string;
}

export function MovieDetailScreen({ id }: MovieDetailScreenProps) {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [backdropFaded, setBackdropFaded] = useState(false);
  const [isBackdropLoaded, setIsBackdropLoaded] = useState(false);
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  const playerRef = useRef<any>(null);
  const collapseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setProfileId(localStorage.getItem('selectedProfileId'));

    // Pre-load YouTube IFrame API immediately so it's ready when the player is needed
    if (typeof window !== 'undefined' && !(window as any).YT_loading && !(window as any).YT) {
      (window as any).YT_loading = true;
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Fetch movie details
  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', id],
    queryFn: async () => {
      const response = await fetch(`/api/content/movie/${id}`);
      if (!response.ok) throw new Error('Failed to fetch movie');
      return response.json();
    },
    staleTime: 1000 * 60 * 10,
  });

  // Fetch logo in parallel with movie details (does not wait for movie query)
  const { data: logoPath, isFetched: isLogoFetched } = useQuery({
    queryKey: ['movie-logo', id],
    queryFn: async () => {
      const response = await fetch(`/api/content/logo?id=${id}&type=movie`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.logoPath;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
  });

  // Fast trailer resolution from already-returned movie.videos
  const movieTrailerKey = useMemo(() => {
    if (!movie?.videos || !Array.isArray(movie.videos)) return null;
    const officialTrailer = movie.videos.find(
      (v: any) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
    );
    if (officialTrailer) return officialTrailer.key;
    const anyTrailer = movie.videos.find(
      (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    );
    return anyTrailer?.key || null;
  }, [movie]);

  // Fetch trailer fallback if not in initial movie payload
  const { data: fallbackTrailerKey } = useTrailer(
    movie && !movieTrailerKey ? parseInt(id) : undefined,
    'movie'
  );

  const trailerKey = movieTrailerKey || fallbackTrailerKey || null;

  // Fallback safety timer: dismiss buffer after 2.5s if images are slow to report onLoad
  useEffect(() => {
    if (!movie) return;
    const timer = setTimeout(() => {
      setIsBackdropLoaded(true);
      setIsLogoLoaded(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [movie]);

  // Watchlist status
  const { data: watchlist = [] } = useWatchlist(profileId || '', { enabled: !!profileId });
  const isInWatchlist = watchlist.some((item: any) => 
    String(item.contentId) === id || String(item.id) === id
  );
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  // Rating (like/unlike)
  const { data: ratings = [] } = useRatings(profileId || '', { enabled: !!profileId });
  const rating = ratings.find((r: any) => String(r.contentId) === id);
  const setRating = useSetRating();
  const isLiked = rating && rating.rating > 0;

  // Auto-collapse info after 5s; mouse movement resets the timer
  useEffect(() => {
    const startTimer = () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = setTimeout(() => setIsCollapsed(true), 5000);
    };

    const handleMouseMove = () => {
      setIsCollapsed(false);
      startTimer();
    };

    startTimer();
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    };
  }, []);

  // Start loading player immediately in background when trailerKey is available
  useEffect(() => {
    if (trailerKey) {
      // Show the hidden player container immediately so it can load in background
      setShowVideo(true);
    }

    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [trailerKey]);

  // Initialize YouTube Player
  useEffect(() => {
    if (showVideo && trailerKey && !playerRef.current) {
      // Load YouTube IFrame API if not already loaded
      if (!(window as any).YT || !(window as any).YT.Player) {
        if (!(window as any).YT_loading) {
          (window as any).YT_loading = true;
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        const originalCallback = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
          if (originalCallback) originalCallback();
          initializePlayer();
        };
      } else {
        initializePlayer();
      }
    }
  }, [showVideo, trailerKey]);

  const initializePlayer = () => {
    if (!trailerKey || playerRef.current || !showVideo) return;

    try {
      const playerElement = document.getElementById(`detail-player-${id}`);
      if (!playerElement) return;

      playerRef.current = new (window as any).YT.Player(`detail-player-${id}`, {
        videoId: trailerKey,
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
          playlist: trailerKey,
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
            // State 1 = playing — wait 3s then crossfade backdrop → video
            if (event.data === 1 && !backdropFaded) {
              setVideoPlaying(true);
              if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
              fadeTimerRef.current = setTimeout(() => {
                setBackdropFaded(true);
              }, 4000);
            }
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

  const handleWatchlistToggle = async () => {
    if (!profileId) return;
    
    if (isInWatchlist) {
      await removeFromWatchlist.mutateAsync({ contentId: id, profileId });
    } else {
      await addToWatchlist.mutateAsync({ contentId: id, type: 'movie', profileId });
    }
  };

  const handleLikeToggle = async () => {
    if (!profileId) return;
    
    await setRating.mutateAsync({
      contentId: id,
      rating: isLiked ? 0 : 10,
      updatedAt: new Date().toISOString(),
      profileId,
    });
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  if (isLoading || !movie) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const genres = movie.genres?.map((g: any) => g.name).slice(0, 2) || [];
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '';

  return (
    <div className="h-screen bg-[#141414] overflow-hidden">
      {/* Hero Section with Backdrop */}
      <div className="relative h-full w-full overflow-hidden">
        {/* Backdrop Image - fades out after 3s of video playing */}
        {movie.backdropPath && (
          <div
            className="absolute inset-0"
            style={{
              opacity: backdropFaded ? 0 : 1,
              transition: 'opacity 1.5s ease-in-out',
            }}
          >
            <Image
              src={movie.backdropPath}
              alt={movie.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Video Player — loads silently in background, fades in after 3s delay */}
        {trailerKey && (
          <div
            className="absolute inset-0"
            style={{
              transform: 'scale(1.5)',
              transformOrigin: 'center center',
              opacity: backdropFaded ? 1 : 0,
              visibility: videoPlaying ? 'visible' : 'hidden',
              transition: 'opacity 1.5s ease-in-out, visibility 0s linear ' + (videoPlaying ? '0s' : '1.5s'),
            }}
          >
            <div
              id={`detail-player-${id}`}
              className="w-full h-full"
              style={{ pointerEvents: 'none' }}
            />
          </div>
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className="absolute top-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>

        {/* Content Info - bottom left */}
        <div className="absolute bottom-16 left-8 md:left-14 max-w-3xl">

          {/* ── COLLAPSIBLE BLOCK: metadata + description ── */}
          <div
            style={{
              overflow: 'hidden',
              maxHeight: isCollapsed ? '0px' : '300px',
              opacity: isCollapsed ? 0 : 1,
              marginBottom: isCollapsed ? '0px' : '0px',
              transition: 'max-height 0.8s cubic-bezier(0.4,0,0.2,1), opacity 0.6s ease-in-out',
            }}
          >
            {/* Metadata */}
            <div className="flex items-center gap-3 text-sm text-white/70 mb-4">
              <span className="uppercase tracking-wider">MOVIE</span>
              {year && <span>{year}</span>}
              {movie.runtime && <span>{movie.runtime} min</span>}
              <span className="px-2 py-0.5 rounded border border-white/30 text-xs">HD</span>
            </div>
          </div>

          {/* Title or Logo — always visible, slides down as content above collapses */}
          <div
            style={{
              marginBottom: '1rem',
              transform: isCollapsed ? 'translateY(4px)' : 'translateY(0)',
              transition: 'transform 0.8s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {logoPath ? (
              <Image
                src={logoPath}
                alt={movie.title}
                width={600}
                height={200}
                className="h-auto max-h-32 w-auto max-w-[85vw] object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
              />
            ) : (
              <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
                {movie.title}
              </h1>
            )}
          </div>

          {/* ── COLLAPSIBLE BLOCK: genres + description + director ── */}
          <div
            style={{
              overflow: 'hidden',
              maxHeight: isCollapsed ? '0px' : '300px',
              opacity: isCollapsed ? 0 : 1,
              transition: 'max-height 0.8s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease-in-out',
            }}
          >
            {/* Genres */}
            <div className="flex items-center gap-2 mb-4">
              {genres.map((genre: string, idx: number) => (
                <span key={idx} className="text-white/90 uppercase text-sm">
                  {genre}
                  {idx < genres.length - 1 && <span className="ml-2">•</span>}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-white/80 text-lg max-w-2xl mb-4 line-clamp-3">
              {movie.overview}
            </p>

            {/* Created by */}
            {movie.director && (
              <p className="text-white/60 text-sm mb-6">
                <span className="text-white/40">CREATED BY</span> {movie.director}
              </p>
            )}
          </div>

          {/* Action Buttons — always visible */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push(`/movie/${id}/watch`)}
              className="flex items-center gap-2 px-8 py-3.5 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-colors"
            >
              <Play className="h-5 w-5 fill-current" />
              Play
            </button>

            <button
              onClick={handleWatchlistToggle}
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/40 bg-black/40 text-white hover:border-white hover:bg-black/60 transition-all backdrop-blur-sm hover:scale-110"
            >
              {isInWatchlist ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>

            <button
              onClick={handleLikeToggle}
              className={`flex h-11 w-11 items-center justify-center rounded-full border-2 backdrop-blur-sm transition-all hover:scale-110 ${
                isLiked
                  ? 'border-red-500 bg-red-500/20 text-red-500'
                  : 'border-white/40 bg-black/40 text-white hover:border-white hover:bg-black/60'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            <button className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/40 bg-black/40 text-white hover:border-white hover:bg-black/60 transition-all backdrop-blur-sm hover:scale-110">
              <Share className="h-5 w-5" />
            </button>

            <button className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/40 bg-black/40 text-white hover:border-white hover:bg-black/60 transition-all backdrop-blur-sm hover:scale-110">
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
