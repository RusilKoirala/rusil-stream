'use client';

import { useEffect, useMemo, useState } from 'react';
import { HorizontalContentRow } from '@/components/home';
import { useWatchlist } from '@/lib/hooks/use-user-data';
import { CardGridSkeleton } from '@/components/ui/skeleton';
import type { Content } from '@/lib/tmdb/types';

function normalizeWatchlistItem(item: Content | Record<string, unknown>): Content | null {
  const contentId = (item as any).id ?? (item as any).contentId;
  const contentType = (item as any).type ?? (item as any).contentType;

  if (contentId === undefined || !contentType) return null;

  return {
    ...(item as Content),
    id: Number(contentId),
    type: contentType as 'movie' | 'tv',
    title: (item as Content).title || 'Untitled',
    posterPath: (item as Content).posterPath ?? null,
    backdropPath: (item as Content).backdropPath ?? null,
    overview: (item as Content).overview || '',
    releaseDate: (item as Content).releaseDate || '',
    voteAverage: (item as Content).voteAverage ?? 0,
    genreIds: (item as Content).genreIds || [],
  };
}

export function MyListTab() {
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('selectedProfileId');
    setProfileId(id);
  }, []);

  const { data: items = [], isLoading, error } = useWatchlist(profileId || '');

  const normalizedItems = useMemo(
    () =>
      items
        .map((item) => normalizeWatchlistItem(item))
        .filter((item): item is Content => Boolean(item)),
    [items]
  );

  const movies = useMemo(
    () => normalizedItems.filter((item) => item.type === 'movie'),
    [normalizedItems]
  );
  const shows = useMemo(
    () => normalizedItems.filter((item) => item.type === 'tv'),
    [normalizedItems]
  );

  return (
    <div className="relative pb-10 pt-24">
      <div className="px-4 md:px-8 lg:px-14 mb-4 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">My List</h1>
        <p className="text-white/70">Titles you saved to watch later.</p>
      </div>

      {isLoading ? (
        <div className="relative space-y-8 px-4 md:px-8">
          <CardGridSkeleton count={6} />
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="mx-4 md:mx-8 lg:mx-14 mt-4 rounded-md border border-amber-500/40 bg-amber-950/30 p-4 text-sm text-amber-200">
          {error instanceof Error ? error.message : 'Failed to load watchlist'}
        </div>
      ) : null}

      {!isLoading && !error && normalizedItems.length === 0 ? (
        <div className="mx-4 md:mx-8 lg:mx-14 mt-4 rounded-md border border-white/10 bg-white/5 p-5 text-sm text-white/70">
          Your list is empty. Add titles from cards or the detail view.
        </div>
      ) : null}

      {!isLoading && !error && normalizedItems.length > 0 ? (
        <div className="relative space-y-2">
          {movies.length > 0 && shows.length > 0 ? (
            <>
              <HorizontalContentRow title="Movies" items={movies} enableVideoPreview />
              <HorizontalContentRow title="TV Shows" items={shows} enableVideoPreview />
            </>
          ) : (
            <HorizontalContentRow
              title="My List"
              items={normalizedItems}
              enableVideoPreview
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
