'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState, useRef } from 'react';
import { Play, Info, Volume2, VolumeX, ChevronRight } from 'lucide-react';
import { useTrendingContent, usePopularContent, useTopRatedContent } from '@/lib/hooks/use-content';
import { isClerkClientConfigured, useOptionalAuth } from '@/lib/auth/use-optional-auth';
import { HorizontalContentRow } from '@/components/home';
import { BrandLogo } from '@/components/ui/brand-logo';
import { useQuery } from '@tanstack/react-query';
import type { Content } from '@/lib/tmdb/types';
import { CardGridSkeleton } from '@/components/ui/skeleton';

// ── Logo helpers (mirrored from HeroBanner) ────────────────────────────────
const logoCache = new Map<string, string | null>();
const logoRequestCache = new Map<string, Promise<string | null>>();

async function getContentLogo(id: number, type: 'movie' | 'tv'): Promise<string | null> {
  const cacheKey = `${type}:${id}`;
  if (logoCache.has(cacheKey)) return logoCache.get(cacheKey) ?? null;
  const inFlight = logoRequestCache.get(cacheKey);
  if (inFlight) return inFlight;
  const request = fetch(`/api/content/logo?id=${id}&type=${type}`, { cache: 'force-cache' })
    .then(async (r) => {
      if (!r.ok) return null;
      const d = (await r.json()) as { logoPath: string | null };
      return d.logoPath;
    })
    .catch(() => null)
    .finally(() => { logoRequestCache.delete(cacheKey); });
  logoRequestCache.set(cacheKey, request);
  const logoPath = await request;
  logoCache.set(cacheKey, logoPath);
  return logoPath;
}

// ── LandingNav ────────────────────────────────────────────────────────────
function LandingNav({ hasAuth, isSignedIn }: { hasAuth: boolean; isSignedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-black/90 backdrop-blur-xl border-b border-white/5'
          : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1800px] items-center justify-between px-5 md:px-10">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <BrandLogo className="h-10 w-10 transition-transform duration-200 group-hover:scale-105" />
          <span className="hidden text-[0.72rem] font-bold uppercase tracking-[0.28em] text-white/80 sm:inline select-none">
            Rusil Stream
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* GitHub */}
          <a
            href="https://github.com/RusilKoirala/rusil-stream"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex text-white/40 transition-colors hover:text-white/80"
            aria-label="GitHub"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
            </svg>
          </a>

          <Link
            href="/download"
            className="hidden sm:inline text-[0.82rem] font-medium text-white/60 transition-colors hover:text-white"
          >
            Download
          </Link>

          {/* Sign in pill */}
          <Link
            href={isSignedIn ? '/' : '/sign-in'}
            className={`inline-flex h-9 items-center justify-center rounded-full px-5 text-[0.82rem] font-semibold transition-all duration-200 ${
              isSignedIn
                ? 'border border-white/20 bg-white/8 text-white hover:bg-white/14'
                : hasAuth
                  ? 'bg-white text-black hover:bg-white/90 shadow-[0_4px_20px_rgba(255,255,255,0.2)]'
                  : 'border border-white/20 bg-white/8 text-white hover:bg-white/14'
            }`}
          >
            {isSignedIn ? 'Dashboard' : 'Sign In'}
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── Landing Hero Banner ───────────────────────────────────────────────────
function LandingHero({
  hasAuth,
  isSignedIn,
}: {
  hasAuth: boolean;
  isSignedIn: boolean;
}) {
  const [randomContent, setRandomContent] = useState<Content | null>(null);
  const [titleLogoPath, setTitleLogoPath] = useState<string | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: trendingData = [], isLoading } = useTrendingContent('day');

  const trendingContent = useMemo(
    () => (trendingData as Content[]).filter((i) => i.backdropPath !== null).slice(0, 10),
    [trendingData]
  );

  // Pick a random trending item and get its hi-res backdrop
  useEffect(() => {
    if (trendingContent.length > 0 && !randomContent) {
      const pick = trendingContent[Math.floor(Math.random() * trendingContent.length)];
      fetch(
        `https://api.themoviedb.org/3/${pick.type}/${pick.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
      )
        .then((r) => r.json())
        .then((d) => {
          setRandomContent({
            ...pick,
            backdropPath: d.backdrop_path
              ? `https://image.tmdb.org/t/p/original${d.backdrop_path}`
              : pick.backdropPath,
          });
        })
        .catch(() => setRandomContent(pick));
    }
  }, [trendingContent, randomContent]);

  // Fetch logo + trailer
  useEffect(() => {
    if (!randomContent) return;
    let active = true;

    (async () => {
      const logo = await getContentLogo(randomContent.id, randomContent.type);
      if (active) setTitleLogoPath(logo);
    })();

    (async () => {
      try {
        const r = await fetch(`/api/content/${randomContent.type}/${randomContent.id}/videos`);
        if (!r.ok) return;
        const d = await r.json();
        const trailer = d.results?.find(
          (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );
        if (active && trailer) setTrailerKey(trailer.key);
      } catch {}
    })();

    return () => { active = false; };
  }, [randomContent]);

  // Auto-play video after 3s with progress animation
  useEffect(() => {
    if (!trailerKey) return;
    const timer = setTimeout(() => {
      setShowVideo(true);
      setIsHovering(true);
      setLoadingProgress(0);
      let p = 0;
      progressIntervalRef.current = setInterval(() => {
        p += 2;
        setLoadingProgress(p);
        if (p >= 100) {
          setVideoLoaded(true);
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        }
      }, 100);
    }, 3000);
    return () => {
      clearTimeout(timer);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [trailerKey]);

  // Stop video when not hovering
  useEffect(() => {
    if (!isHovering && showVideo) {
      setShowVideo(false);
      setVideoLoaded(false);
      setLoadingProgress(0);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      try { playerRef.current?.pauseVideo?.(); } catch {}
    }
  }, [isHovering, showVideo]);

  // YouTube player init
  useEffect(() => {
    if (!showVideo || !trailerKey) return;
    if (playerRef.current) {
      try { playerRef.current.destroy(); playerRef.current = null; } catch {}
    }
    const initPlayer = () => {
      if (!(window as any).YT?.Player) return;
      try {
        const el = document.getElementById('landing-hero-player');
        if (!el) return;
        playerRef.current = new (window as any).YT.Player('landing-hero-player', {
          videoId: trailerKey,
          playerVars: { autoplay: 1, controls: 0, disablekb: 1, modestbranding: 1, rel: 0, showinfo: 0, fs: 0, iv_load_policy: 3, playsinline: 1, mute: 1, loop: 1, playlist: trailerKey, enablejsapi: 1, origin: typeof window !== 'undefined' ? window.location.origin : '', cc_load_policy: 0 },
          events: {
            onReady: (e: any) => { e.target.playVideo(); e.target.mute(); },
          },
        });
      } catch {}
    };
    if (!(window as any).YT) {
      if (!(window as any).YT_loading) {
        (window as any).YT_loading = true;
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      const orig = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => { if (orig) orig(); initPlayer(); };
    } else {
      initPlayer();
    }
    return () => {
      try { playerRef.current?.destroy(); playerRef.current = null; } catch {}
    };
  }, [showVideo, trailerKey]);

  const toggleMute = () => {
    try {
      if (isMuted) { playerRef.current?.unMute?.(); } else { playerRef.current?.mute?.(); }
      setIsMuted(!isMuted);
    } catch {}
  };

  const primaryCta = isSignedIn ? '/' : hasAuth ? '/sign-up' : '/sign-in';
  const secondaryCta = isSignedIn ? '/movies' : '/sign-in';

  if (isLoading || !randomContent) {
    return (
      <div className="relative h-[90vh] min-h-[600px] w-full animate-pulse bg-[#111]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
      </div>
    );
  }

  return (
    <section
      className="relative h-[90vh] min-h-[600px] w-full overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0">
        {randomContent.backdropPath && (
          <Image
            src={randomContent.backdropPath}
            alt={randomContent.title}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        )}

        {/* Video overlay */}
        {showVideo && trailerKey && isHovering && (
          <div
            className="absolute inset-0 w-full h-full"
            style={{ opacity: videoLoaded ? 1 : 0, transition: 'opacity 0.8s ease-in-out' }}
          >
            <div
              id="landing-hero-player"
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

        {/* Small loading ring */}
        {showVideo && !videoLoaded && (
          <div className="absolute bottom-36 right-8 z-20 md:bottom-44 md:right-14">
            <svg className="w-6 h-6 -rotate-90">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" fill="none"
                strokeDasharray={`${2 * Math.PI * 10}`}
                strokeDashoffset={`${2 * Math.PI * 10 * (1 - loadingProgress / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.1s linear' }}
              />
            </svg>
          </div>
        )}
      </div>

      {/* Cinematic gradient overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,8,0.94)_0%,rgba(6,6,9,0.52)_40%,rgba(9,8,10,0.14)_65%,rgba(10,9,11,0.70)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.30)_0%,rgba(0,0,0,0)_32%,rgba(0,0,0,0.96)_100%)] pointer-events-none" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 pb-16 md:pb-24 px-6 md:px-14">
        <div className="max-w-[600px] space-y-5">
          {/* Title logo or text */}
          {titleLogoPath ? (
            <Image
              src={titleLogoPath}
              alt={randomContent.title}
              width={600}
              height={200}
              className="h-auto max-h-32 w-auto max-w-[80vw] object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]"
              priority
            />
          ) : (
            <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] leading-[1.05]">
              {randomContent.title}
            </h1>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 text-sm text-white/80">
            <span className="flex items-center gap-1.5 font-semibold">
              <svg className="h-3.5 w-3.5 fill-[#ffd24d]" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {randomContent.voteAverage.toFixed(1)}
            </span>
            {randomContent.releaseDate && (
              <span>{new Date(randomContent.releaseDate).getFullYear()}</span>
            )}
            <span className="uppercase text-xs font-medium tracking-wider">{randomContent.type}</span>
            <span className="px-2 py-0.5 rounded border border-white/25 text-[0.68rem] font-medium">HD</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={primaryCta}
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-7 py-3.5 text-[0.88rem] font-bold text-black shadow-[0_8px_30px_rgba(255,255,255,0.25)] transition-all duration-200 hover:scale-[1.03] hover:bg-white/92 active:scale-95"
            >
              <Play className="h-4 w-4 fill-current" />
              <span className="tracking-wide">{isSignedIn ? 'BROWSE NOW' : 'GET STARTED'}</span>
            </Link>

            <Link
              href={secondaryCta}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/12 px-7 py-3.5 text-[0.88rem] font-semibold text-white backdrop-blur-md border border-white/20 transition-all duration-200 hover:bg-white/18 hover:scale-[1.02] active:scale-95"
            >
              {isSignedIn ? (
                <><Info className="h-4 w-4" /><span className="tracking-wide">MOVIES</span></>
              ) : (
                <><span className="tracking-wide">SIGN IN</span><ChevronRight className="h-4 w-4 text-white/60" /></>
              )}
            </Link>

            {/* Mute toggle */}
            {showVideo && trailerKey && (
              <button
                onClick={toggleMute}
                className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            )}
          </div>

          {/* Sign-up nudge (only if not signed in) */}
          {!isSignedIn && (
            <p className="text-[0.78rem] text-white/45">
              Free to explore · Sign up to watch in full
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ── LandingContentRows ─────────────────────────────────────────────────────
function LandingContentRows({ isSignedIn }: { isSignedIn: boolean }) {
  const { data: trendingAll = [], isLoading: t1 } = useTrendingContent('week');
  const { data: popularMovies = [], isLoading: t2 } = usePopularContent('movie');
  const { data: topRatedMovies = [], isLoading: t3 } = useTopRatedContent('movie');
  const { data: popularTV = [], isLoading: t4 } = usePopularContent('tv');

  const { data: actionMovies = [], isLoading: t5 } = useQuery({
    queryKey: ['genre-movie', 28],
    queryFn: async () => {
      const r = await fetch('/api/content/discover?type=movie&genre=28');
      if (!r.ok) throw new Error('Failed');
      const d = await r.json();
      return (d.results || []) as Content[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: dramaTV = [], isLoading: t6 } = useQuery({
    queryKey: ['genre-tv', 18],
    queryFn: async () => {
      const r = await fetch('/api/content/discover?type=tv&genre=18');
      if (!r.ok) throw new Error('Failed');
      const d = await r.json();
      return (d.results || []) as Content[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const isLoading = t1 || t2 || t3 || t4 || t5 || t6;

  if (isLoading) {
    return (
      <div className="mt-2 space-y-8 px-4 md:px-8">
        <CardGridSkeleton count={6} />
        <CardGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="relative space-y-2 pb-8">
      <HorizontalContentRow title="Trending This Week" items={trendingAll} enableVideoPreview />
      <HorizontalContentRow title="Popular Movies" items={popularMovies} enableVideoPreview />
      <HorizontalContentRow title="Top Rated" items={topRatedMovies} enableVideoPreview />
      <HorizontalContentRow title="Popular TV Shows" items={popularTV} enableVideoPreview />
      <HorizontalContentRow title="Action Movies" items={actionMovies} enableVideoPreview />
      <HorizontalContentRow title="Drama Series" items={dramaTV} enableVideoPreview />
    </div>
  );
}

// ── Floating CTA Banner ─────────────────────────────────────────────────────
function FloatingCtaBanner({ hasAuth, isSignedIn }: { hasAuth: boolean; isSignedIn: boolean }) {
  if (isSignedIn) return null;

  return (
    <div className="sticky bottom-0 z-40 px-4 py-3 md:px-10 md:py-4">
      <div className="mx-auto max-w-[1200px] flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/80 px-5 py-4 shadow-[0_-8px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <div>
          <p className="text-[0.95rem] font-semibold text-white">
            Ready to start watching?
          </p>
          <p className="text-[0.78rem] text-white/50">
            Create an account to unlock the full library in HD
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/sign-in"
            className="inline-flex h-10 items-center rounded-full border border-white/20 bg-white/8 px-5 text-[0.82rem] font-semibold text-white transition-colors hover:bg-white/14"
          >
            Sign In
          </Link>
          {hasAuth && (
            <Link
              href="/sign-up"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-5 text-[0.82rem] font-bold text-black shadow-[0_4px_20px_rgba(255,255,255,0.2)] transition-all hover:bg-white/90 hover:scale-[1.02]"
            >
              Get Started
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── LandingScreen (root) ───────────────────────────────────────────────────
export function LandingScreen() {
  const hasAuth = isClerkClientConfigured();
  const { isLoaded, userId } = useOptionalAuth();
  const isSignedIn = Boolean(isLoaded && userId);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Nav */}
      <LandingNav hasAuth={hasAuth} isSignedIn={isSignedIn} />

      {/* Hero — full cinematic banner with trailer auto-play */}
      <LandingHero hasAuth={hasAuth} isSignedIn={isSignedIn} />

      {/* Content rows — exactly like the home screen */}
      <LandingContentRows isSignedIn={isSignedIn} />

      {/* Floating sign-up CTA */}
      <FloatingCtaBanner hasAuth={hasAuth} isSignedIn={isSignedIn} />

      {/* Footer */}
      <footer className="border-t border-white/6 bg-black/80 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-[1600px] px-5 py-8 md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo className="h-8 w-8 shrink-0" />
              <div>
                <p className="text-[0.82rem] font-semibold text-white/90">Rusil Stream</p>
                <p className="text-[0.72rem] text-white/40">Your personal streaming hub</p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-x-7 gap-y-2">
              {[
                { label: 'Home', href: '/' },
                { label: 'Movies', href: '/movies' },
                { label: 'TV Shows', href: '/tv' },
                { label: 'Download', href: '/download' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-[0.82rem] text-white/40 transition-colors hover:text-white/80"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/6 pt-5">
            <p className="text-[0.70rem] text-white/25">
              © {new Date().getFullYear()} Rusil Stream. All rights reserved.
            </p>
            <a
              href="https://github.com/RusilKoirala/rusil-stream"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.70rem] text-white/25 transition-colors hover:text-white/55"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
