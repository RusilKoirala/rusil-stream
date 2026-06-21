'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MonitorSmartphone, Sparkles, Play, ChevronRight, Tv, Smartphone, Laptop } from 'lucide-react';
import { useTrendingContent } from '@/lib/hooks/use-content';
import { isClerkClientConfigured, useOptionalAuth } from '@/lib/auth/use-optional-auth';
import { PublicNav } from '@/components/navigation';
import { BrandLogo } from '@/components/ui/brand-logo';
import type { Content } from '@/lib/tmdb/types';

export function LandingScreen() {
  const hasAuth = isClerkClientConfigured();
  const { isLoaded, userId } = useOptionalAuth();
  const isSignedIn = Boolean(isLoaded && userId);
  const primaryCtaHref = isSignedIn ? '/' : '/sign-in';
  const secondaryCtaHref = isSignedIn ? '/movies' : hasAuth ? '/sign-up' : '/sign-in';

  const { data: content = [] } = useTrendingContent('week');

  const backdrops = content
    .map((item: Content) => item.backdropPath)
    .filter((path: string | null): path is string => Boolean(path))
    .slice(0, 8);

  const primaryBackdrop = backdrops[0];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <PublicNav />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-screen">
        {/* Backdrop image */}
        <div className="absolute inset-0">
          {primaryBackdrop ? (
            <Image
              src={primaryBackdrop}
              alt="Featured content"
              fill
              priority
              sizes="100vw"
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#111] via-[#0d0d0d] to-[#080808]" />
          )}
        </div>

        {/* Gradient overlays — same layering as HeroBanner */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.96)_0%,rgba(5,5,5,0.65)_42%,rgba(5,5,5,0.25)_70%,rgba(5,5,5,0.72)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0)_38%,rgba(5,5,5,0.99)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] items-center px-4 pb-28 pt-28 md:px-10">
          <div className="w-full max-w-2xl">
            {/* Eyebrow */}
            <p className="mb-3.5 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-white/60">
              Unlimited movies · TV shows · more
            </p>

            {/* Heading */}
            <h1 className="text-[2.9rem] font-extrabold leading-[1.04] tracking-[-0.01em] text-white md:text-[4.4rem]">
              Big stories.
              <br />
              <span className="text-primary">Zero</span> compromises.
            </h1>

            {/* Sub */}
            <p className="mt-5 max-w-xl text-[1.02rem] leading-[1.75] text-white/80 md:text-[1.06rem]">
              Watch anywhere. Keep each profile personal. Pick up right where you left off — across every screen.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={primaryCtaHref}
                className="inline-flex h-[2.85rem] items-center justify-center gap-2 rounded-full bg-primary px-7 text-[0.88rem] font-bold tracking-wide text-white transition-colors duration-200 hover:bg-[#f21822] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {isSignedIn ? 'Open Dashboard' : 'Get Started'}
              </Link>
              <Link
                href={secondaryCtaHref}
                className="inline-flex h-[2.85rem] items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/7 px-7 text-[0.88rem] font-semibold text-white/90 transition-colors duration-200 hover:bg-white/12"
              >
                {isSignedIn ? 'Browse Movies' : hasAuth ? 'Create Account' : 'Sign Up'}
                <ChevronRight className="h-4 w-4 text-white/55" />
              </Link>
            </div>

            {/* Pill tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              {['Multiple Profiles', 'Personalized Picks', 'Cross-Device Resume'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-white/72"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-background/60 to-background" />
      </section>

      {/* ── Feature cards ────────────────────────────────── */}
      <section className="relative z-10 mx-auto -mt-10 w-full max-w-[1600px] px-4 pb-20 md:px-10">
        {/* Ambient glow behind cards */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute right-1/4 top-20 h-64 w-64 rounded-full bg-white/4 blur-3xl" />
        </div>

        <div className="relative grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 — Curated */}
          <article className="group rounded-2xl border border-white/8 bg-card/80 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.38)] backdrop-blur-sm transition-colors duration-200 hover:border-white/14 hover:bg-card">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <Sparkles className="h-4.5 w-4.5 text-[#ff8f95]" aria-hidden />
            </div>
            <h3 className="mt-4 text-[0.95rem] font-semibold text-white">Curated For You</h3>
            <p className="mt-2 text-[0.84rem] leading-[1.7] text-muted-foreground">
              Every profile learns your taste and keeps recommendations sharp — no noise, no guesswork.
            </p>
          </article>

          {/* Card 2 — Any screen */}
          <article className="group rounded-2xl border border-white/8 bg-card/80 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.38)] backdrop-blur-sm transition-colors duration-200 hover:border-white/14 hover:bg-card">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <MonitorSmartphone className="h-4.5 w-4.5 text-white/90" aria-hidden />
            </div>
            <h3 className="mt-4 text-[0.95rem] font-semibold text-white">Any Screen, Same Story</h3>
            <p className="mt-2 text-[0.84rem] leading-[1.7] text-muted-foreground">
              Start on TV, continue on your phone, and never lose your place no matter where you are.
            </p>
          </article>

          {/* Card 3 — Download */}
          <article className="group rounded-2xl border border-white/8 bg-card/80 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.38)] backdrop-blur-sm transition-colors duration-200 hover:border-white/14 hover:bg-card sm:col-span-2 lg:col-span-1">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2dd4bf]/12">
              <Smartphone className="h-4.5 w-4.5 text-[#7ce9df]" aria-hidden />
            </div>
            <h3 className="mt-4 text-[0.95rem] font-semibold text-white">Take It Mobile</h3>
            <p className="mt-2 text-[0.84rem] leading-[1.7] text-muted-foreground">
              Download the Android app for a native experience with the same account, profiles, and watchlist.
            </p>
            <Link
              href="/download"
              className="mt-4 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-[#7ce9df] transition-opacity hover:opacity-75"
            >
              Download APK
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </article>
        </div>

        {/* Device row */}
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-white/40">
            Available on every platform
          </p>
          <div className="flex items-center gap-6 text-white/28">
            <Tv className="h-6 w-6" aria-label="TV" />
            <Laptop className="h-6 w-6" aria-label="Laptop" />
            <Smartphone className="h-6 w-6" aria-label="Phone" />
            <MonitorSmartphone className="h-6 w-6" aria-label="Tablet" />
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/6 bg-background">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-10 md:px-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <BrandLogo className="h-9 w-9 shrink-0" />
              <div>
                <p className="text-[0.8rem] font-semibold text-white/90">Rusil Stream</p>
                <p className="text-[0.72rem] text-muted-foreground">Your personal streaming hub</p>
              </div>
            </div>

            {/* Links */}
            <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-8 gap-y-2.5">
              {[
                { label: 'Home', href: '/' },
                { label: 'Movies', href: '/movies' },
                { label: 'TV Shows', href: '/tv' },
                { label: 'Download', href: '/download' },
                { label: 'Help', href: '/help' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-[0.82rem] text-muted-foreground transition-colors duration-150 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Bottom row */}
          <div className="mt-8 flex flex-col items-start gap-2 border-t border-white/6 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.72rem] text-white/30">
              &copy; {new Date().getFullYear()} Rusil Stream. All rights reserved.
            </p>
            <a
              href="https://github.com/RusilKoirala/rusil-stream"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.72rem] text-white/30 transition-colors duration-150 hover:text-white/60"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
