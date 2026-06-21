'use client';

import { ContentCard, Top10Card, ContinueWatchingCard } from '@/components/content';
import { PublicNav } from '@/components/navigation';

// Mock content data for demonstration
const mockContent = {
  id: 550,
  type: 'movie' as const,
  title: 'Fight Club',
  posterPath: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  backdropPath: 'https://image.tmdb.org/t/p/w1280/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
  overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
  releaseDate: '1999-10-15',
  voteAverage: 8.4,
  genreIds: [18, 53, 35],
};

const mockContent2 = {
  id: 238,
  type: 'movie' as const,
  title: 'The Godfather',
  posterPath: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
  backdropPath: 'https://image.tmdb.org/t/p/w1280/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
  overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
  releaseDate: '1972-03-14',
  voteAverage: 8.7,
  genreIds: [18, 80],
};

const mockContent3 = {
  id: 424,
  type: 'movie' as const,
  title: 'Schindler\'s List',
  posterPath: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
  backdropPath: 'https://image.tmdb.org/t/p/w1280/loRmRzQXZeqG78TqZuyvSlEQfZb.jpg',
  overview: 'The true story of how businessman Oskar Schindler saved over a thousand Jewish lives during the Holocaust.',
  releaseDate: '1993-12-15',
  voteAverage: 8.6,
  genreIds: [18, 36, 10752],
};

export default function ContentCardsDemo() {
  return (
    <div className="min-h-screen bg-[#141414] p-8 pt-24">
      <PublicNav />
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Content Cards Demo</h1>
          <p className="text-[#B3B3B3]">
            Hover over cards to see the expansion animations and interactions
          </p>
        </div>

        {/* ContentCard Row */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">ContentCard</h2>
          <p className="text-sm text-[#B3B3B3]">
            Base content card with poster image and hover expansion
          </p>
          <div className="flex gap-4 overflow-x-auto pb-4">
            <div className="flex-shrink-0 w-48">
              <ContentCard
                content={mockContent}
                position="start"
                onPlay={() => console.log('Play:', mockContent.title)}
                onMoreInfo={() => console.log('More Info:', mockContent.title)}
              />
            </div>
            <div className="flex-shrink-0 w-48">
              <ContentCard
                content={mockContent2}
                position="middle"
                onPlay={() => console.log('Play:', mockContent2.title)}
                onMoreInfo={() => console.log('More Info:', mockContent2.title)}
              />
            </div>
            <div className="flex-shrink-0 w-48">
              <ContentCard
                content={mockContent3}
                position="end"
                onPlay={() => console.log('Play:', mockContent3.title)}
                onMoreInfo={() => console.log('More Info:', mockContent3.title)}
              />
            </div>
          </div>
        </section>

        {/* Top10Card Row */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Top10Card</h2>
          <p className="text-sm text-[#B3B3B3]">
            Content card with large rank number overlay
          </p>
          <div className="flex gap-4 overflow-x-auto pb-4">
            <div className="flex-shrink-0 w-48">
              <Top10Card
                content={mockContent}
                rank={1}
                position="start"
                onPlay={() => console.log('Play:', mockContent.title)}
                onMoreInfo={() => console.log('More Info:', mockContent.title)}
              />
            </div>
            <div className="flex-shrink-0 w-48">
              <Top10Card
                content={mockContent2}
                rank={2}
                position="middle"
                onPlay={() => console.log('Play:', mockContent2.title)}
                onMoreInfo={() => console.log('More Info:', mockContent2.title)}
              />
            </div>
            <div className="flex-shrink-0 w-48">
              <Top10Card
                content={mockContent3}
                rank={3}
                position="end"
                onPlay={() => console.log('Play:', mockContent3.title)}
                onMoreInfo={() => console.log('More Info:', mockContent3.title)}
              />
            </div>
          </div>
        </section>

        {/* ContinueWatchingCard Row */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">ContinueWatchingCard</h2>
          <p className="text-sm text-[#B3B3B3]">
            Backdrop image with progress bar and resume functionality
          </p>
          <div className="flex gap-4 overflow-x-auto pb-4">
            <div className="flex-shrink-0 w-80">
              <ContinueWatchingCard
                content={mockContent}
                percentageWatched={25.5}
                position="start"
                onResume={() => console.log('Resume:', mockContent.title)}
                onRemove={() => console.log('Remove:', mockContent.title)}
              />
            </div>
            <div className="flex-shrink-0 w-80">
              <ContinueWatchingCard
                content={mockContent2}
                percentageWatched={67.3}
                position="middle"
                onResume={() => console.log('Resume:', mockContent2.title)}
                onRemove={() => console.log('Remove:', mockContent2.title)}
              />
            </div>
            <div className="flex-shrink-0 w-80">
              <ContinueWatchingCard
                content={mockContent3}
                percentageWatched={92.1}
                position="end"
                onResume={() => console.log('Resume:', mockContent3.title)}
                onRemove={() => console.log('Remove:', mockContent3.title)}
              />
            </div>
          </div>
        </section>

        {/* Features List */}
        <section className="space-y-4 border-t border-white/10 pt-8">
          <h2 className="text-2xl font-semibold text-white">Features Implemented</h2>
          <ul className="space-y-2 text-sm text-[#B3B3B3]">
            <li>✓ Lazy loading with Next.js Image component</li>
            <li>✓ Shimmer skeleton loading animation</li>
            <li>✓ 400ms hover delay before expansion</li>
            <li>✓ Scale to 1.2x and translate upward by 8px</li>
            <li>✓ Smooth 200ms ease-out animation</li>
            <li>✓ Expansion direction based on position (start/middle/end)</li>
            <li>✓ Action buttons: Play, Add to List, Like, Dislike, More Info</li>
            <li>✓ Top 10 rank number overlay with semi-transparent styling</li>
            <li>✓ Continue Watching with backdrop image and progress bar</li>
            <li>✓ Resume button and remove menu on Continue Watching cards</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
