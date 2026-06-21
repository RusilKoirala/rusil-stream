'use client';

import Link from 'next/link';
import { Download, ShieldCheck, Sparkles, WifiOff } from 'lucide-react';
import { ContentCard } from '@/components/content';
import { CardGridSkeleton } from '@/components/ui/skeleton';
import { useTrendingContent } from '@/lib/hooks/use-content';
import type { Content } from '@/lib/tmdb/types';

const downloadModes = [
  {
    title: 'Smart Downloads',
    description: 'Episodes are replaced automatically so storage stays clean without manual work.',
  },
  {
    title: 'Quality Control',
    description: 'Switch between Data Saver, Balanced, and Best Quality before each download.',
  },
  {
    title: 'Secure Offline',
    description: 'Saved titles remain encrypted and tied to your profile for private playback.',
  },
];

export function DownloadsScreen() {
  const { data: trending = [], isLoading, error } = useTrendingContent('week');

  const suggested = trending
    .filter((item: Content) => Boolean(item.posterPath))
    .slice(0, 12);

  return (
    <main className="mx-auto max-w-400 px-4 pb-16 pt-24 md:px-8">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,#18181f_0%,#101014_55%,#0a0a0d_100%)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.45)] md:p-8">
        <div className="absolute -right-12 -top-20 h-52 w-52 rounded-full bg-[#E50914]/20 blur-3xl" />
        <div className="absolute -left-14 -bottom-24 h-60 w-60 rounded-full bg-white/7 blur-3xl" />

        <div className="relative grid gap-7 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.2em] text-white/82">
              <Download className="h-3.5 w-3.5 text-[#ff636b]" />
              Downloads
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
              Offline viewing is almost here.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
              We are preparing device-aware downloads so you can save titles for flights, commutes, and low-network zones.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/download"
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/6 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                Download for Android
              </Link>
              <Link
                href="/movies"
                className="inline-flex items-center justify-center rounded-full bg-[#E50914] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#f21822]"
              >
                Explore Movies
              </Link>
              <Link
                href="/tv"
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/6 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                Explore TV Shows
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/12 bg-black/28 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-white/60">Status</p>
            <div className="mt-3 space-y-2.5 text-sm text-white/82">
              <div className="flex items-center justify-between rounded-xl border border-white/12 bg-white/5 px-3 py-2">
                <span>Device sync</span>
                <span className="text-emerald-300">Active</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/12 bg-white/5 px-3 py-2">
                <span>Offline license</span>
                <span className="text-amber-300">In rollout</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/12 bg-white/5 px-3 py-2">
                <span>Queue manager</span>
                <span className="text-white/70">Coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {downloadModes.map((mode) => (
          <article
            key={mode.title}
            className="rounded-2xl border border-white/10 bg-[#151518]/82 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.28)]"
          >
            <p className="text-sm font-semibold text-white">{mode.title}</p>
            <p className="mt-2 text-sm leading-6 text-white/68">{mode.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-9 rounded-2xl border border-white/10 bg-[#111217]/85 p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-white/80">
          <WifiOff className="h-4 w-4 text-[#ffab6c]" />
          Planning your next offline session? Add titles to My List now and download when this feature goes live.
        </div>
      </section>

      {isLoading ? (
        <div className="mt-8">
          <CardGridSkeleton count={12} />
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="mt-8 rounded-md border border-amber-500/40 bg-amber-950/30 p-4 text-sm text-amber-200">
          {error instanceof Error ? error.message : 'Failed to load suggestions'}
        </div>
      ) : null}

      {!isLoading && !error ? (
        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#ffda80]" />
            <h2 className="text-xl font-semibold tracking-tight text-white md:text-2xl">Save These For Later</h2>
          </div>
          <p className="mb-5 text-sm text-white/62">Popular picks this week that are ideal for offline marathons.</p>

          {suggested.length === 0 ? (
            <div className="rounded-md border border-white/10 bg-white/5 p-5 text-sm text-white/70">
              No suggestions available right now. Check back in a moment.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {suggested.map((item: Content, idx: number) => {
                const position = idx % 6 === 0 ? 'start' : idx % 6 === 5 ? 'end' : 'middle';
                return (
                  <ContentCard
                    key={`download-suggestion-${item.type}-${item.id}`}
                    content={item}
                    position={position}
                  />
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      <section className="mt-10 rounded-2xl border border-white/10 bg-[linear-gradient(120deg,rgba(229,9,20,0.16),rgba(255,255,255,0.04))] p-5">
        <div className="flex items-center gap-2 text-sm text-white/80">
          <ShieldCheck className="h-4 w-4 text-[#ffd58f]" />
          Downloads will follow profile restrictions and content licensing per region.
        </div>
      </section>
    </main>
  );
}
