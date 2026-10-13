'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Play, Plus, Check, Share, Download, ArrowLeft, VolumeX, Volume2, Heart, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAddToWatchlist, useRemoveFromWatchlist, useWatchlist, useSetRating, useRatings } from '@/lib/hooks/use-user-data';
import { useTrailer } from '@/lib/hooks/use-trailer';

interface TVDetailScreenProps {
  id: string;
}

export function TVDetailScreen({ id }: TVDetailScreenProps) {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [backdropFaded, setBackdropFaded] = useState(false);
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

  // Fetch TV show details
  const { data: show, isLoading } = useQuery({
    queryKey: ['tv', id],
    queryFn: async () => {
      const response = await fetch(`/api/content/tv/${id}`);
      if (!response.ok) throw new Error('Failed to fetch TV show');
      return response.json();
    },
  });

  // Fetch logo
  const { data: logoPath } = useQuery({
    queryKey: ['tv-logo', id],
    queryFn: async () => {
      const response = await fetch(`/api/content/logo?id=${id}&type=tv`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.logoPath;
    },
    enabled: !!show,
  });

  // Fetch trailer
  const { data: trailerKey } = useTrailer(
    show ? parseInt(id) : undefined,
    'tv'
  );

  // Start loading player in background immediately when trailerKey is available
  useEffect(() => {
    if (trailerKey) {
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

  // Fetch season details
  const { data: seasonData } = useQuery({
    queryKey: ['tv', id, 'season', selectedSeason],
    queryFn: async () => {
      const response = await fetch(`/api/content/tv/${id}/season/${selectedSeason}`);
      if (!response.ok) throw new Error('Failed to fetch season');
      return response.json();
    },
    enabled: !!show,
  });

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

  const handleWatchlistToggle = async () => {
    if (!profileId) return;
    if (isInWatchlist) {
      await removeFromWatchlist.mutateAsync({ contentId: id, profileId });
    } else {
      await addToWatchlist.mutateAsync({ contentId: id, type: 'tv', profileId });
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

  if (isLoading || !show) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const genres = show.genres?.map((g: any) => g.name).slice(0, 2) || [];
  const year = show.firstAirDate ? new Date(show.firstAirDate).getFullYear() : '';
  const seasons = show.numberOfSeasons || 1;
  const episodes = seasonData?.episodes || [];

  // Filter episodes by search
  const filteredEpisodes = episodes.filter((ep: any) =>
    ep.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.overview?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#141414]">
      {/* ── SECTION 1: Full-screen hero with video/banner ── */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Backdrop Image — fades out after 3s of video playing */}
        {show.backdropPath && (
          <div
            className="absolute inset-0"
            style={{
              opacity: backdropFaded ? 0 : 1,
              transition: 'opacity 1.5s ease-in-out',
            }}
          >
            <Image
              src={show.backdropPath}
              alt={show.name}
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent pointer-events-none" />

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-all backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className="absolute top-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-all backdrop-blur-sm"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>

        {/* Content Info — bottom left, full info */}
        <div className="absolute bottom-16 left-8 md:left-14 max-w-3xl">

          {/* ── COLLAPSIBLE BLOCK: metadata ── */}
          <div
            style={{
              overflow: 'hidden',
              maxHeight: isCollapsed ? '0px' : '80px',
              opacity: isCollapsed ? 0 : 1,
              transition: 'max-height 0.8s cubic-bezier(0.4,0,0.2,1), opacity 0.6s ease-in-out',
            }}
          >
            <div className="flex items-center gap-3 text-sm text-white/70 mb-4">
              <span className="uppercase tracking-wider">SERIES</span>
              {year && <span>{year}</span>}
              <span className="uppercase tracking-wider">TV-MA</span>
              <span>{seasons} SEASON{seasons > 1 ? 'S' : ''}</span>
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
                alt={show.name}
                width={600}
                height={200}
                className="h-auto max-h-32 w-auto max-w-[85vw] object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
              />
            ) : (
              <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
                {show.name}
              </h1>
            )}
          </div>

          {/* ── COLLAPSIBLE BLOCK: genres + description + created by ── */}
          <div
            style={{
              overflow: 'hidden',
              maxHeight: isCollapsed ? '0px' : '300px',
              opacity: isCollapsed ? 0 : 1,
              transition: 'max-height 0.8s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease-in-out',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              {genres.map((genre: string, idx: number) => (
                <span key={idx} className="text-white/90 uppercase text-sm">
                  {genre}
                  {idx < genres.length - 1 && <span className="ml-2">•</span>}
                </span>
              ))}
            </div>

            <p className="text-white/80 text-lg max-w-2xl mb-4 line-clamp-3">
              {show.overview}
            </p>

            {show.createdBy && show.createdBy.length > 0 && (
              <p className="text-white/60 text-sm mb-6">
                <span className="text-white/40">CREATED BY</span>{' '}
                {show.createdBy.map((c: any) => c.name).join(', ')}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push(`/tv/${id}/watch?season=${selectedSeason}&episode=1`)}
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

      {/* ── SECTION 2: Episodes — separate scrollable section below ── */}
      <div className="px-8 md:px-14 py-12">
        <p className="text-white/50 text-sm uppercase tracking-widest font-semibold mb-1">CONTINUE THE STORY</p>
        <h2 className="text-4xl font-bold text-white mb-8">Episodes</h2>

        {/* Season Selector and Search */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="px-6 py-3 bg-[#2a2a2a] border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
          >
            {Array.from({ length: seasons }, (_, i) => i + 1).map((season) => (
              <option key={season} value={season}>
                Season {season}
              </option>
            ))}
          </select>

          <div className="relative flex-1 max-w-md ml-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search episode..."
              className="w-full pl-12 pr-4 py-3 bg-[#2a2a2a] border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
            />
          </div>

          <button className="p-3 bg-[#2a2a2a] border border-white/20 rounded-lg text-white hover:bg-[#333] transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </button>
        </div>

        {/* Episodes List — using div[role=button] to avoid button-in-button hydration error */}
        <div className="space-y-4">
          {filteredEpisodes.map((episode: any) => (
            <div
              key={episode.episodeNumber}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/tv/${id}/watch?season=${selectedSeason}&episode=${episode.episodeNumber}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  router.push(`/tv/${id}/watch?season=${selectedSeason}&episode=${episode.episodeNumber}`);
                }
              }}
              className="group w-full flex gap-4 p-4 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-xl transition-colors border border-white/5 hover:border-white/10 cursor-pointer"
            >
              {/* Episode Thumbnail */}
              <div className="relative w-48 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-[#2a2a2a]">
                {episode.stillPath ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w300${episode.stillPath}`}
                    alt={episode.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#2a2a2a]">
                    <span className="text-6xl font-bold text-white/20">{episode.episodeNumber}</span>
                  </div>
                )}
                {/* Episode Number Badge */}
                <div className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center bg-black/80 rounded text-white text-sm font-bold">
                  {episode.episodeNumber}
                </div>
                {/* Download icon — div not button to avoid nesting error */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle download
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
                  }}
                  className="absolute bottom-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Download className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Episode Info */}
              <div className="flex-1 text-left">
                <h4 className="text-white font-semibold text-lg mb-1">{episode.name}</h4>
                <p className="text-white/50 text-sm mb-2">
                  E{episode.episodeNumber} • {episode.runtime || 23} min
                </p>
                <p className="text-white/70 text-sm line-clamp-2">
                  {episode.overview || 'No description available.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
