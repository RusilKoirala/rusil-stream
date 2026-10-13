'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Play, Info, Volume2, VolumeX } from 'lucide-react'
import { usePopularContent, useTrendingContent } from '@/lib/hooks/use-content'
import { usePlayerSettings } from '@/lib/hooks/use-player-settings'
interface Content {
  id: number
  type: 'movie' | 'tv'
  title: string
  posterPath: string | null
  backdropPath: string | null
  overview: string
  releaseDate: string
  voteAverage: number
  genreIds: number[]
}

const logoCache = new Map<string, string | null>()
const logoRequestCache = new Map<string, Promise<string | null>>()

async function getContentLogo(id: number, type: 'movie' | 'tv'): Promise<string | null> {
  const cacheKey = `${type}:${id}`

  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey) ?? null
  }

  const inFlight = logoRequestCache.get(cacheKey)
  if (inFlight) {
    return inFlight
  }

  const request = fetch(`/api/content/logo?id=${id}&type=${type}`, {
    cache: 'force-cache',
  })
    .then(async (response) => {
      if (!response.ok) return null
      const data = (await response.json()) as { logoPath: string | null }
      return data.logoPath
    })
    .catch(() => null)
    .finally(() => {
      logoRequestCache.delete(cacheKey)
    })

  logoRequestCache.set(cacheKey, request)

  const logoPath = await request
  logoCache.set(cacheKey, logoPath)
  return logoPath
}

interface HeroBannerProps {
  onReady?: (ready: boolean) => void
  /** Limit featured titles to movies or TV (home keeps mixed). */
  contentType?: 'movie' | 'tv'
  /** When false (inactive tab), stop and tear down the background trailer. */
  isActive?: boolean
}

export function HeroBanner({ onReady, contentType, isActive = true }: HeroBannerProps = {}) {
  const router = useRouter()
  const { settings } = usePlayerSettings()
  const [randomContent, setRandomContent] = useState<Content | null>(null)
  const [titleLogoPath, setTitleLogoPath] = useState<string | null>(null)
  const [isLogoFetched, setIsLogoFetched] = useState(false)
  const [isBackdropLoaded, setIsBackdropLoaded] = useState(false)
  const [isLogoLoaded, setIsLogoLoaded] = useState(false)
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [showVideo, setShowVideo] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const playerRef = useRef<any>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const playerElementId = contentType ? `hero-player-${contentType}` : 'hero-player'

  const { data: trendingData = [], isLoading: isTrendingLoading } = useTrendingContent('day')
  const { data: popularFallback = [], isLoading: isPopularLoading } = usePopularContent(
    contentType || 'movie',
    { enabled: Boolean(contentType) }
  )
  const isLoading = isTrendingLoading || (Boolean(contentType) && isPopularLoading)

  const trendingContent = useMemo(() => {
    const withBackdrop = (item: Content) => Boolean(item.backdropPath)
    const matchesType = (item: Content) => !contentType || item.type === contentType

    const fromTrending = (trendingData as Content[])
      .filter((item) => withBackdrop(item) && matchesType(item))
      .slice(0, 10)

    if (fromTrending.length > 0) return fromTrending

    if (contentType) {
      return (popularFallback as Content[])
        .filter(withBackdrop)
        .slice(0, 10)
    }

    return []
  }, [trendingData, popularFallback, contentType])

  useEffect(() => {
    if (trendingContent.length > 0 && !randomContent) {
      const random = trendingContent[Math.floor(Math.random() * trendingContent.length)]
      // Immediately set randomContent for 0-delay display
      setRandomContent(random)

      // Optionally upgrade to original backdrop in background
      if (process.env.NEXT_PUBLIC_TMDB_API_KEY) {
        fetch(`https://api.themoviedb.org/3/${random.type}/${random.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`)
          .then(res => res.json())
          .then(data => {
            if (data.backdrop_path) {
              const originalBackdrop = `https://image.tmdb.org/t/p/original${data.backdrop_path}`
              setRandomContent(prev => prev ? { ...prev, backdropPath: originalBackdrop } : prev)
            }
          })
          .catch(() => {})
      }
    }
  }, [trendingContent, randomContent])

  // Safety fallback: if images take longer than 2.5s, reveal hero
  useEffect(() => {
    if (!randomContent) return
    const timer = setTimeout(() => {
      setIsBackdropLoaded(true)
      setIsLogoLoaded(true)
    }, 2500)
    return () => clearTimeout(timer)
  }, [randomContent])

  useEffect(() => {
    if (!randomContent) return

    let active = true

    // Fetch logo
    ;(async () => {
      const logoPath = await getContentLogo(randomContent.id, randomContent.type)
      if (!active) return
      setTitleLogoPath(logoPath)
      setIsLogoFetched(true)
      if (!logoPath) {
        setIsLogoLoaded(true)
      }
    })()

    // Fetch trailer
    ;(async () => {
      try {
        const response = await fetch(`/api/content/${randomContent.type}/${randomContent.id}/videos`)
        if (!response.ok) return
        const data = await response.json()
        
        const trailer = data.results?.find((v: any) => 
          v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        )
        
        if (active && trailer) {
          setTrailerKey(trailer.key)
        }
      } catch (error) {
        console.error('Failed to fetch trailer:', error)
      }
    })()

    return () => {
      active = false
    }
  }, [randomContent])

  // Auto-play video after 3 seconds, start loading immediately with progress
  useEffect(() => {
    if (!trailerKey || !settings.heroTrailer || !isActive) return

    const timer = setTimeout(() => {
      setShowVideo(true)

      // Start progress animation
      setLoadingProgress(0)
      let progress = 0
      progressIntervalRef.current = setInterval(() => {
        progress += 2 // 100% over 5 seconds (50 steps * 2 = 100)
        setLoadingProgress(progress)
        
        if (progress >= 100) {
          setVideoLoaded(true)
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
          }
        }
      }, 100) // Update every 100ms
    }, 3000)

    return () => {
      clearTimeout(timer)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [trailerKey, isActive])

  // Tear down the background trailer whenever this tab is not the active one
  // (visited tabs stay mounted, so otherwise the video keeps playing in the background)
  useEffect(() => {
    if (isActive) return

    setShowVideo(false)
    setVideoLoaded(false)
    setLoadingProgress(0)
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    if (playerRef.current) {
      try {
        playerRef.current.pauseVideo?.()
        playerRef.current.stopVideo?.()
        playerRef.current.destroy?.()
      } catch (e) {}
      playerRef.current = null
    }
  }, [isActive])

  // Initialize YouTube Player
  useEffect(() => {
    if (!showVideo || !trailerKey) return

    // Clean up previous player
    if (playerRef.current) {
      try {
        playerRef.current.destroy()
        playerRef.current = null
      } catch (e) {}
    }

    const initPlayer = () => {
      if (!(window as any).YT?.Player) return

      try {
        const playerElement = document.getElementById(playerElementId)
        if (!playerElement) return

        playerRef.current = new (window as any).YT.Player(playerElementId, {
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
            enablejsapi: 1,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
            cc_load_policy: 0,
            autohide: 1,
          },
          events: {
            onReady: (event: any) => {
              console.log('YouTube player ready')
              event.target.playVideo()
              event.target.mute()
              event.target.setPlaybackQuality('hd720')
            },
            onStateChange: (event: any) => {
              console.log('Player state:', event.data)
              // State 1 = playing
              if (event.data === 1) {
                console.log('Video is playing')
              }
            },
          },
        })
      } catch (error) {
        console.error('Failed to initialize YouTube player:', error)
      }
    }

    if (!(window as any).YT) {
      if (!(window as any).YT_loading) {
        (window as any).YT_loading = true
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
      }

      const originalCallback = (window as any).onYouTubeIframeAPIReady
      ;(window as any).onYouTubeIframeAPIReady = () => {
        if (originalCallback) originalCallback()
        initPlayer()
      }
    } else {
      initPlayer()
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
          playerRef.current = null
        } catch (e) {}
      }
    }
  }, [showVideo, trailerKey, playerElementId])

  const toggleMute = () => {
    if (!playerRef.current) return
    
    try {
      if (isMuted) {
        playerRef.current.unMute?.()
      } else {
        playerRef.current.mute?.()
      }
      setIsMuted(!isMuted)
    } catch (e) {
      console.error('Error toggling mute:', e)
    }
  }

  const isHeroReady = Boolean(randomContent) && isBackdropLoaded && (isLogoLoaded || (isLogoFetched && !titleLogoPath))

  useEffect(() => {
    onReady?.(isHeroReady)
  }, [isHeroReady, onReady])

  useEffect(() => {
    return () => onReady?.(false)
  }, [onReady])

  if (isLoading || !randomContent) {
    return <div className="relative h-[88vh] min-h-155 w-full bg-[#070709]" />
  }

  if (!randomContent.backdropPath) {
    return null
  }

  return (
    <section
      className="relative h-[88vh] min-h-150 w-full overflow-hidden bg-[#070709]"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          <Image
            src={randomContent.backdropPath}
            alt={randomContent.title}
            fill
            priority
            onLoad={() => setIsBackdropLoaded(true)}
            className="object-cover object-center"
            sizes="100vw"
          />

          {showVideo && trailerKey && (
            <div
              className="absolute inset-0 w-full h-full youtube-player-container"
              style={{
                opacity: videoLoaded ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out',
              }}
            >
              <div
                id={playerElementId}
                className="w-full h-full"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '120vw',
                  height: '120vh',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          )}

          {showVideo && !videoLoaded && (
            <div className="absolute bottom-3 right-3 z-20">
              <div className="relative w-6 h-6">
                <svg className="w-6 h-6 transform -rotate-90">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1.5"
                    fill="none"
                  />
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
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,8,0.92)_0%,rgba(6,6,9,0.55)_36%,rgba(9,8,10,0.15)_64%,rgba(10,9,11,0.75)_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0)_35%,rgba(0,0,0,0.96)_100%)] pointer-events-none" />

        <div className="absolute bottom-32 left-8 md:bottom-36 md:left-14">
          <div className="space-y-5">
            {titleLogoPath ? (
              <div>
                <Image
                  src={titleLogoPath}
                  alt={randomContent.title}
                  width={600}
                  height={200}
                  onLoad={() => setIsLogoLoaded(true)}
                  onError={() => setIsLogoLoaded(true)}
                  className="h-auto max-h-28 w-auto max-w-[85vw] md:max-h-32 object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
                  priority
                />
              </div>
            ) : (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] max-w-2xl">
                {randomContent.title}
              </h1>
            )}

            <div className="flex items-center gap-3 text-sm text-white/90">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <svg className="h-4 w-4 fill-[#ffd24d]" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {randomContent.voteAverage.toFixed(1)}
              </span>
              {randomContent.releaseDate && (
                <span className="text-white/80">
                  {new Date(randomContent.releaseDate).getFullYear()}
                </span>
              )}
              <span className="uppercase text-white/80 text-xs font-medium tracking-wider">
                {randomContent.type}
              </span>
              <span className="px-2 py-0.5 rounded border border-white/30 text-[0.7rem] font-medium text-white/85">
                HD
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/player?id=${randomContent.id}&type=${randomContent.type}`)}
                className="group relative overflow-hidden rounded-2xl px-8 py-3.5 bg-white text-black font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_30px_rgba(255,255,255,0.3)]"
              >
                <div className="flex items-center gap-2.5">
                  <Play className="h-4 w-4 fill-current" />
                  <span className="tracking-wide">WATCH</span>
                </div>
              </button>

              <button
                onClick={() => router.push(`/${randomContent.type}/${randomContent.id}`)}
                className="group relative overflow-hidden rounded-2xl px-8 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-sm transition-all duration-300 hover:bg-white/15 hover:scale-105 active:scale-95 shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
              >
                <div className="flex items-center gap-2.5">
                  <Info className="h-4 w-4" />
                  <span className="tracking-wide">DETAILS</span>
                </div>
              </button>

              {showVideo && trailerKey && (
                <button
                  onClick={toggleMute}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors border border-white/20"
                  title={isMuted ? 'Click to unmute' : 'Click to mute'}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
