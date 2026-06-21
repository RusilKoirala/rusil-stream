'use client';

import { useEffect, useState } from 'react';
import { useWatchlist } from '@/lib/hooks/use-user-data';
import { ContentCard } from '@/components/content';
import { CardGridSkeleton } from '@/components/ui/skeleton';
import type { Content } from '@/lib/tmdb/types';

export function MyListScreen() {
  const [profileId, setProfileId] = useState<string | null>(null);
  
  // Get profileId from localStorage
  useEffect(() => {
    const id = localStorage.getItem('selectedProfileId');
    setProfileId(id);
  }, []);

  // Use React Query hook for watchlist
  const { data: items = [], isLoading, error } = useWatchlist(profileId || '');

  return (
    <main className="mx-auto max-w-400 px-4 pb-16 pt-24 md:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">My List</h1>
        <p className="text-white/70">Titles you saved to watch later.</p>
      </div>

      {isLoading ? (
        <div className="mt-8">
          <CardGridSkeleton count={12} />
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="mt-8 rounded-md border border-amber-500/40 bg-amber-950/30 p-4 text-sm text-amber-200">
          {error instanceof Error ? error.message : 'Failed to load watchlist'}
        </div>
      ) : null}

      {!isLoading && !error && items.length === 0 ? (
        <div className="mt-8 rounded-md border border-white/10 bg-white/5 p-5 text-sm text-white/70">
          Your list is empty. Add titles from cards or the detail view.
        </div>
      ) : null}

      {!isLoading && !error && items.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((content: Content, idx: number) => {
            const contentId = (content as any).id ?? (content as any).contentId;
            const contentType = (content as any).type ?? (content as any).contentType;

            if (contentId === undefined || !contentType) {
              return null;
            }

            const position = idx % 6 === 0 ? 'start' : idx % 6 === 5 ? 'end' : 'middle';
            return (
              <ContentCard
                key={`${contentType}-${contentId}`}
                content={content}
                position={position}
              />
            );
          })}
        </div>
      ) : null}
    </main>
  );
}
