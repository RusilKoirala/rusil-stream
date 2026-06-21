'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentCard } from './content-card';
import { ContinueWatchingCard } from './continue-watching-card';
import { Top10Card } from './top10-card';
import type { Content } from '@/lib/tmdb/types';

type RowVariant = 'default' | 'top10' | 'continue';

interface ContentRowProps {
  title: string;
  items: Content[];
  variant?: RowVariant;
  hideTitle?: boolean;
  watchProgressMap?: Record<number, number>;
  onMoreInfo?: (content: Content) => void;
  onPlay?: (content: Content) => void;
}

export function ContentRow({
  title,
  items,
  variant = 'default',
  hideTitle = false,
  watchProgressMap,
  onMoreInfo,
  onPlay,
}: ContentRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const amount = Math.floor(containerRef.current.clientWidth * 0.8);
    containerRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (!items.length) return null;

  const isTopRankedRow = variant === 'top10';

  return (
    <section className="group/row relative px-4 md:px-6">
      {!hideTitle ? (
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">{title}</h2>
        </div>
      ) : null}

      {!isTopRankedRow ? (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/60 text-white hover:bg-black/80 md:group-hover/row:inline-flex"
          onClick={() => scrollByAmount('left')}
          aria-label={`Scroll ${title} left`}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      ) : null}

      <div
        ref={containerRef}
        className={
          isTopRankedRow
            ? 'no-scrollbar flex gap-3 overflow-x-auto pb-2 md:gap-4'
            : 'no-scrollbar flex gap-2 overflow-x-auto pb-2 md:gap-2.5'
        }
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((item, idx) => {
          const position = idx === 0 ? 'start' : idx === items.length - 1 ? 'end' : 'middle';
          const className =
            variant === 'continue'
              ? 'min-w-[260px] max-w-[260px]'
              : variant === 'top10'
                ? 'min-w-[228px] max-w-[228px]'
                : 'min-w-[170px] max-w-[170px]';

          if (variant === 'top10') {
            return (
              <div key={item.id} className={className}>
                <Top10Card
                  content={item}
                  rank={idx + 1}
                  position={position}
                  onPlay={() => onPlay?.(item)}
                  onMoreInfo={() => onMoreInfo?.(item)}
                />
              </div>
            );
          }

          if (variant === 'continue') {
            return (
              <div key={item.id} className={className}>
                <ContinueWatchingCard
                  content={item}
                  percentageWatched={watchProgressMap?.[item.id] ?? 0}
                  position={position}
                  onResume={() => onPlay?.(item)}
                />
              </div>
            );
          }

          return (
            <div key={item.id} className={className}>
              <ContentCard
                content={item}
                position={position}
                onPlay={() => onPlay?.(item)}
                onMoreInfo={() => onMoreInfo?.(item)}
              />
            </div>
          );
        })}
      </div>

      {!isTopRankedRow ? (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/60 text-white hover:bg-black/80 md:group-hover/row:inline-flex"
          onClick={() => scrollByAmount('right')}
          aria-label={`Scroll ${title} right`}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : null}
    </section>
  );
}
