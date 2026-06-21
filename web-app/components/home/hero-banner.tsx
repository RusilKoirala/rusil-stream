'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Play, Star, Plus, Info, X } from 'lucide-react'
import { getGenreLabel } from '@/lib/tmdb/genre-labels'
import { useTrendingContent } from '@/lib/hooks/use-content'

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

export function HeroBanner() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [titleLogoPath, setTitleLogoPath] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [selectedTitleLogoPath, setSelectedTitleLogoPath] = useState<string | null>(null)
  const { data: trendingData = [], isLoading, error } = useTrendingContent('day')

  const trendingContent = useMemo(
    () =>
      (trendingData as Content[])
        .filter((item) => item.backdropPath !== null)
        .slice(0, 5),
    [trendingData]
  )
  const safeCurrentIndex = trendingContent.length > 0 ? currentIndex % trendingContent.length : 0

  useEffect(() => {
    if (trendingContent.length === 0) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % trendingContent.length)
        setIsTransitioning(false)
      }, 800)
    }, 6000)

    return () => clearInterval(interval)
  }, [trendingContent.length])

  useEffect(() => {
    const current = trendingContent[safeCurrentIndex]
    if (!current) {
      return
    }

    let active = true

    ;(async () => {
      const logoPath = await getContentLogo(current.id, current.type)
      if (!active) return
      setTitleLogoPath(logoPath)
    })()

    return () => {
      active = false
    }
  }, [safeCurrentIndex, trendingContent])

  useEffect(() => {
    if (!selectedContent) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedContent(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [selectedContent])

  if (isLoading) {
    return (
      <div className="relative h-[88vh] min-h-155 w-full animate-pulse bg-[#141414]">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#141414]" />
      </div>
    )
  }

  if (error || trendingContent.length === 0) {
    return null
  }

  const currentContent = trendingContent[safeCurrentIndex]
  const displayRating = Number.isFinite(currentContent.voteAverage)
    ? currentContent.voteAverage.toFixed(1)
    : '6.8'
  const releaseYear = currentContent.releaseDate ? new Date(currentContent.releaseDate).getFullYear() : null

  // Safety check for backdrop path
  if (!currentContent.backdropPath) {
    return null
  }

  const openDetails = () => {
    setSelectedContent(currentContent)
    setSelectedTitleLogoPath(titleLogoPath)
  }

  const selectedReleaseYear = selectedContent?.releaseDate
    ? new Date(selectedContent.releaseDate).getFullYear()
    : null

  const selectedRating = selectedContent && Number.isFinite(selectedContent.voteAverage)
    ? selectedContent.voteAverage.toFixed(1)
    : '6.8'

  return (
    <section className="relative h-[88vh] min-h-150 w-full overflow-hidden" onClick={openDetails}>
      <div
        className={`absolute inset-0 transition-opacity duration-800 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <Image
          src={currentContent.backdropPath}
          alt={currentContent.title}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,8,0.95)_0%,rgba(6,6,9,0.68)_36%,rgba(9,8,10,0.3)_64%,rgba(10,9,11,0.86)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.36)_0%,rgba(0,0,0,0)_40%,rgba(0,0,0,0.98)_100%)]" />

      <div className="absolute inset-0">
        <div className="flex h-full items-end px-6 pb-28 pt-20 md:px-12 md:pb-34 lg:px-14">
          <div
            className={`max-w-4xl transition-opacity duration-800 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="mb-5 flex items-center gap-3 text-sm text-white/85 md:text-base">
              <span className="inline-flex items-center gap-1 text-[#ffd24d]">
                <Star className="h-4 w-4 fill-current" />
                {displayRating}
              </span>
              {releaseYear ? <span>{releaseYear}</span> : null}
              <span className="uppercase">{currentContent.type}</span>
              <span className="rounded border border-white/35 px-1.5 py-0.5 text-[0.68rem] tracking-wide text-white/80">HD</span>
              <span className="rounded border border-white/35 px-1.5 py-0.5 text-[0.68rem] tracking-wide text-white/80">CC</span>
            </div>

            {titleLogoPath ? (
              <div className="mb-6">
                <Image
                  src={titleLogoPath}
                  alt={currentContent.title}
                  width={760}
                  height={220}
                  className="h-auto max-h-36 w-auto max-w-[90%] object-contain md:max-h-40"
                  priority
                />
              </div>
            ) : (
              <h1 className="mb-6 text-4xl font-extrabold leading-[1.02] tracking-[0.02em] text-white md:text-5xl lg:text-6xl">
                {currentContent.title}
              </h1>
            )}

            <p className="mb-8 max-w-2xl text-[0.98rem] leading-7 text-white/86 line-clamp-3 md:text-[1.02rem] md:leading-8">
              {currentContent.overview}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="h-10 rounded-full bg-[#E50914] px-6 text-sm font-bold tracking-wide text-white hover:bg-[#f6121d]"
                onClick={(event) => {
                  event.stopPropagation()
                  router.push(`/player?id=${currentContent.id}&type=${currentContent.type}`)
                }}
              >
                <Play className="mr-2 h-3.5 w-3.5 fill-current" />
                WATCH
              </Button>
              <Button
                size="lg"
                className="h-10 rounded-full border border-white/25 bg-black/50 px-6 text-sm font-semibold tracking-wide text-white hover:bg-black/70"
                onClick={(event) => {
                  event.stopPropagation()
                  openDetails()
                }}
              >
                <Info className="mr-2 h-4 w-4" />
                DETAILS
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center gap-2.5">
        {trendingContent.map((item, index) => (
          <span
            key={item.id}
            className={
              index === safeCurrentIndex
                ? 'h-1.5 w-8 rounded-full bg-[#ff4b2b]'
                : 'h-1.5 w-1.5 rounded-full bg-white/45'
            }
          />
        ))}
      </div>

      {selectedContent ? (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/78 px-4 py-6 backdrop-blur-sm"
          onClick={() => setSelectedContent(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedContent.title} details`}
        >
          <article
            className="relative w-full max-w-190 overflow-hidden rounded-[28px] border border-white/10 bg-[#121010] shadow-[0_26px_70px_rgba(0,0,0,0.72)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-65 w-full md:h-80">
              {selectedContent.backdropPath ? (
                <Image
                  src={selectedContent.backdropPath}
                  alt={selectedContent.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 760px"
                  className="object-cover object-center"
                />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.25)_40%,rgba(12,9,9,0.96)_100%)]" />

              <button
                type="button"
                className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/80"
                onClick={() => setSelectedContent(null)}
                aria-label="Close details"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                {selectedTitleLogoPath ? (
                  <Image
                    src={selectedTitleLogoPath}
                    alt={selectedContent.title}
                    width={520}
                    height={180}
                    className="mb-4 h-auto max-h-24 w-auto max-w-[88%] object-contain"
                  />
                ) : (
                  <h2 className="mb-4 text-3xl font-black leading-tight text-white md:text-4xl">{selectedContent.title}</h2>
                )}

                <div className="flex flex-wrap gap-2.5">
                  <Button
                    type="button"
                    className="h-10 rounded-full bg-[#E50914] px-6 text-sm font-semibold text-white hover:bg-[#f6121d]"
                    onClick={(event) => {
                      event.stopPropagation()
                      setSelectedContent(null)
                      router.push(`/player?id=${selectedContent.id}&type=${selectedContent.type}`)
                    }}
                  >
                    <Play className="mr-2 h-4 w-4 fill-current" />
                    Watch
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 rounded-full border-white/25 bg-white/5 px-5 text-sm text-white hover:bg-white/12"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    My List
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-6 pb-7 pt-5 text-white md:px-8 md:pb-8">
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/86">
                <span className="inline-flex items-center gap-1 text-[#ffd24d]">
                  <Star className="h-4 w-4 fill-current" />
                  {selectedRating}
                </span>
                {selectedReleaseYear ? <span>{selectedReleaseYear}</span> : null}
                <span className="uppercase">{selectedContent.type}</span>
                <span className="rounded border border-white/35 px-1.5 py-0.5 text-[0.68rem] tracking-wide text-white/80">HD</span>
                <span>100m</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedContent.genreIds.slice(0, 3).map((genreId) => (
                  <span
                    key={genreId}
                    className="rounded-full border border-white/20 bg-white/6 px-3 py-1 text-xs text-white/82"
                  >
                    {getGenreLabel(genreId, selectedContent.type)}
                  </span>
                ))}
              </div>

              <p className="text-base leading-8 text-white/75 md:text-lg">
                {selectedContent.overview}
              </p>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  )
}
