'use client';

import { ContentCard } from './content-card';

interface Content {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

interface ContentRowProps {
  title: string;
  items: Content[];
  mediaType?: 'movie' | 'tv';
  size?: 'normal' | 'large';
}

export function ContentRow({ title, items, mediaType, size = 'normal' }: ContentRowProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="py-8 px-8">
      <div className="container mx-auto">
        <h2 className="text-xl font-semibold text-white mb-6 uppercase tracking-wide">
          {title}
        </h2>

        {/* Horizontal Scroll */}
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
          {items.map((item) => {
            // Determine media type from item.media_type or use prop
            const type =
              item.media_type === 'tv' || item.media_type === 'movie'
                ? item.media_type
                : mediaType || 'movie';

            return (
              <ContentCard
                key={item.id}
                id={item.id}
                title={item.title || item.name || 'Unknown'}
                poster={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                backdrop={
                  item.backdrop_path
                    ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
                    : undefined
                }
                mediaType={type}
                rating={item.vote_average}
                year={
                  item.release_date
                    ? new Date(item.release_date).getFullYear().toString()
                    : item.first_air_date
                    ? new Date(item.first_air_date).getFullYear().toString()
                    : undefined
                }
                size={size}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
