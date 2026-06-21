'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { ContentCard } from '@/components/content';
import { CardGridSkeleton } from '@/components/ui/skeleton';
import { useTopRatedContent } from '@/lib/hooks/use-content';
import { useQuery } from '@tanstack/react-query';
import type { Content } from '@/lib/tmdb/types';

interface BrowseGridProps {
  title: string;
  endpoint: string;
  description?: string;
}

export function BrowseGrid({ title, endpoint, description }: BrowseGridProps) {
  const router = useRouter();

  const contentType = useMemo<'movie' | 'tv'>(() => {
    return endpoint.includes('type=tv') ? 'tv' : 'movie';
  }, [endpoint]);

  // Fetch browse content
  const { data: items = [], isLoading: isItemsLoading, error: itemsError } = useQuery({
    queryKey: ['browse', endpoint],
    queryFn: async () => {
      const response = await fetch(endpoint, { cache: 'default' });
      if (!response.ok) throw new Error('Failed to load content');
      return response.json() as Promise<Content[]>;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Fetch top-rated content in parallel
  const { data: topRatedItems = [], isLoading: isTopRatedLoading } = useTopRatedContent(contentType);

  const isLoading = isItemsLoading || isTopRatedLoading;
  const error = itemsError?.message || null;

  const featured = items.find((item) => Boolean(item.backdropPath)) ?? items[0] ?? null;
  const popularSlice = items.slice(0, 12);
  const topRatedSlice = topRatedItems.slice(0, 12);

  return (
    <main className="relative overflow-hidden pb-16 pt-20">
      <AmbientBackground />

      <div className="relative mx-auto max-w-400 px-4 md:px-8">
        {featured ? (
          <section className="relative mt-4 overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0c] shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
            <div className="relative h-72 w-full md:h-95">
              {featured.backdropPath ? (
                <Image
                  src={featured.backdropPath}
                  alt={featured.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover object-center"
                />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,10,0.92)_0%,rgba(10,10,12,0.66)_45%,rgba(15,15,18,0.2)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.65)_70%,rgba(0,0,0,0.88)_100%)]" />

              <div className="absolute inset-0 flex items-end px-6 pb-8 md:px-10 md:pb-10">
                <div className="max-w-2xl">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/18 bg-black/35 px-3 py-1 text-[0.72rem] uppercase tracking-[0.14em] text-white/86">
                    <Sparkles className="h-3.5 w-3.5 text-[#ffcf5b]" />
                    Featured {contentType === 'movie' ? 'Movie' : 'Series'}
                  </div>
                  <h1 className="text-3xl font-black leading-tight text-white md:text-5xl">{featured.title}</h1>
                  {description ? <p className="mt-3 max-w-xl text-sm leading-7 text-white/75 md:text-base">{description}</p> : null}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      className="h-10 rounded-full bg-[#E50914] px-6 text-sm font-semibold text-white hover:bg-[#f6121d]"
                      onClick={() => router.push(`/player?id=${featured.id}&type=${featured.type}`)}
                    >
                      <Play className="mr-2 h-3.5 w-3.5 fill-current" />
                      Watch Now
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 rounded-full border-white/25 bg-black/45 px-6 text-sm text-white hover:bg-black/65"
                    >
                      Browse Collection
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {isLoading ? (
          <div className="mt-8 space-y-8">
            <div className="h-6 w-44 animate-pulse rounded bg-white/12" />
            <CardGridSkeleton count={12} />
            <div className="h-6 w-38 animate-pulse rounded bg-white/12" />
            <CardGridSkeleton count={12} />
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="mt-8 rounded-md border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">
            Failed to load content: {error}
          </div>
        ) : null}

        {!isLoading && !error ? (
          <>
            <section className="mt-10">
              <h2 className="text-xl font-semibold tracking-tight text-white md:text-2xl">Popular Right Now</h2>
              <p className="mt-1 text-sm text-white/62">What everyone is watching this week</p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {popularSlice.map((item: Content, idx: number) => {
                  const position = idx % 6 === 0 ? 'start' : idx % 6 === 5 ? 'end' : 'middle';
                  return (
                    <ContentCard
                      key={`popular-${item.type}-${item.id}`}
                      content={item}
                      position={position}
                    />
                  );
                })}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="text-xl font-semibold tracking-tight text-white md:text-2xl">Top Rated Picks</h2>
              <p className="mt-1 text-sm text-white/62">Critically loved {contentType === 'movie' ? 'films' : 'shows'}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {topRatedSlice.map((item: Content, idx: number) => {
                  const position = idx % 6 === 0 ? 'start' : idx % 6 === 5 ? 'end' : 'middle';
                  return (
                    <ContentCard
                      key={`top-rated-${item.type}-${item.id}`}
                      content={item}
                      position={position}
                    />
                  );
                })}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
