'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { config } from '@/lib/config';
import { LoadingSpinner } from '@/components/ui/skeleton';

function PlayerContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const id = searchParams.get('id');
  const type = searchParams.get('type');
  const season = searchParams.get('season') ?? '1';
  const episode = searchParams.get('episode') ?? '1';

  const src = useMemo(() => {
    if (!id) return null;

    const baseUrl = config.vidkingBaseUrl.replace(/\/$/, '');

    if (type === 'tv') {
      return `${baseUrl}/embed/tv/${id}/${season}/${episode}`;
    }

    return `${baseUrl}/embed/movie/${id}`;
  }, [episode, id, season, type]);

  if (!src) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/70">No content selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-white/70">Loading player...</p>
          </div>
        </div>
      )}
      <iframe
        src={src}
        title="VidKing Player"
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense
      fallback={
        <main className="h-screen w-full bg-black flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-white/70">Loading...</p>
          </div>
        </main>
      }
    >
      <main>
        <PlayerContent />
      </main>
    </Suspense>
  );
}
