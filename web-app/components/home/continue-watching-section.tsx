'use client';

import { useState, useEffect } from 'react';
import { ContentCard } from './content-card';

interface WatchProgress {
  id: number;
  title: string;
  poster: string;
  backdrop: string;
  mediaType: 'movie' | 'tv';
  progress: number;
  duration: number;
  season?: number;
  episode?: number;
  updatedAt: number;
}

export function ContinueWatchingSection() {
  const [history, setHistory] = useState<WatchProgress[]>([]);

  useEffect(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem('continue_watching');
      if (stored) {
        const data = JSON.parse(stored);
        // Filter: >30s watched and <90% complete
        const filtered = data.filter((item: WatchProgress) => {
          const percent = (item.progress / item.duration) * 100;
          return item.progress > 30 && percent < 90;
        });
        setHistory(filtered);
      }
    } catch (error) {
      console.error('Failed to load continue watching:', error);
    }
  }, []);

  if (history.length === 0) {
    return null;
  }

  return (
    <section className="py-8 px-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white uppercase tracking-wide">
            Pick up where you left off
          </h2>
          <button className="text-sm text-white/60 hover:text-white transition">
            Clear history
          </button>
        </div>

        {/* Horizontal Scroll */}
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
          {history.map((item) => (
            <ContentCard
              key={`${item.id}-${item.season}-${item.episode}`}
              id={item.id}
              title={item.title}
              poster={item.poster}
              backdrop={item.backdrop}
              mediaType={item.mediaType}
              progress={(item.progress / item.duration) * 100}
              size="large"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
