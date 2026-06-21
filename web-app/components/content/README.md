# Content Components

This directory contains content card components for displaying movies and TV shows in the Netflix-style streaming platform.

## Components

### ContentCard

Base content card component with poster image, lazy loading, and hover expansion.

**Features:**
- Displays poster image with lazy loading using Next.js Image
- Shows shimmer skeleton while loading
- Hover expansion with 400ms delay
- Scales to 1.2x and translates upward by 8px on hover
- Reveals panel with title, rating, genre chips, and action buttons
- Expands to right if at row start, left if at row end, symmetrically if in middle
- Prevents clipping outside row visible area

**Props:**
```typescript
interface ContentCardProps {
  content: Content;
  position?: 'start' | 'middle' | 'end';
  onPlay?: () => void;
  onMoreInfo?: () => void;
  onAddToList?: () => void;
  isInWatchlist?: boolean;
  className?: string;
}
```

**Requirements:** 22.1, 22.2, 22.3, 23.1, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8

**Example:**
```tsx
<ContentCard
  content={movieData}
  position="start"
  onPlay={() => console.log('Play clicked')}
  onMoreInfo={() => console.log('More info clicked')}
  onAddToList={() => console.log('Add to list clicked')}
  isInWatchlist={false}
/>
```

### Top10Card

Extends ContentCard with large semi-transparent rank number overlay on left edge.

**Features:**
- All ContentCard features
- Large rank number overlay (1-10) on left edge
- Semi-transparent styling matching Netflix Top 10 design
- Stroke outline for better visibility

**Props:**
```typescript
interface Top10CardProps {
  content: Content;
  rank: number;
  position?: 'start' | 'middle' | 'end';
  onPlay?: () => void;
  onMoreInfo?: () => void;
  onAddToList?: () => void;
  isInWatchlist?: boolean;
  className?: string;
}
```

**Requirements:** 4.5, 4.11

**Example:**
```tsx
<Top10Card
  content={movieData}
  rank={1}
  position="start"
  onPlay={() => console.log('Play clicked')}
/>
```

### ContinueWatchingCard

Displays backdrop image with red progress bar showing watch progress.

**Features:**
- Displays backdrop image instead of poster
- Red progress bar at bottom showing percentageWatched
- Shows "Resume" button on hover
- Three-dot menu with "Remove from Continue Watching" option
- Shimmer skeleton while loading
- Hover expansion with same animations as ContentCard

**Props:**
```typescript
interface ContinueWatchingCardProps {
  content: Content;
  percentageWatched: number;
  position?: 'start' | 'middle' | 'end';
  onResume?: () => void;
  onRemove?: () => void;
  className?: string;
}
```

**Requirements:** 10.3, 10.4, 10.5

**Example:**
```tsx
<ContinueWatchingCard
  content={movieData}
  percentageWatched={45.5}
  onResume={() => console.log('Resume clicked')}
  onRemove={() => console.log('Remove clicked')}
/>
```

## Content Type

All components use the following Content interface:

```typescript
interface Content {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
}
```

## Design System

### Colors
- Background: `#141414`
- Cards: `#181818`
- Elevated: `#232323`
- Highest: `#2F2F2F`
- Brand/Accent: `#E50914`
- Primary Text: `white`
- Secondary Text: `#B3B3B3`
- Muted Text: `#737373`
- Borders: `white` at 10% opacity

### Animations
- Hover delay: 400ms
- Scale animation: 200ms ease-out
- Shimmer animation: 2s infinite linear
- All animations use smooth transitions for premium feel

### Typography
- Font: Netflix Sans with Inter fallback
- Bold and large text for headings
- Clean and legible text at small sizes

## Usage in Rows

These components are designed to be used in horizontally scrollable rows:

```tsx
<div className="flex gap-2 overflow-x-auto">
  <ContentCard content={content1} position="start" />
  <ContentCard content={content2} position="middle" />
  <ContentCard content={content3} position="middle" />
  <ContentCard content={content4} position="end" />
</div>
```

The `position` prop controls the expansion direction to prevent clipping outside the visible area.

## Accessibility

- All images have proper alt text
- Interactive elements are keyboard accessible
- Focus states are visible
- ARIA labels are provided where needed

## Performance

- Images are lazy-loaded using Next.js Image component
- Shimmer skeletons provide immediate visual feedback
- Hover timeouts prevent accidental expansions
- Cleanup functions prevent memory leaks
