# TMDB Integration Usage Examples

## API Route Examples

### Example 1: Trending Content Endpoint

```typescript
// app/api/content/trending/route.ts
import { NextResponse } from 'next/server';
import { getTrending } from '@/lib/tmdb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeWindow = (searchParams.get('timeWindow') as 'day' | 'week') || 'day';

    const content = await getTrending(timeWindow);

    return NextResponse.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('Failed to fetch trending:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trending content',
      },
      { status: 502 }
    );
  }
}
```

### Example 2: Content Details Endpoint

```typescript
// app/api/content/[id]/route.ts
import { NextResponse } from 'next/server';
import { getDetails } from '@/lib/tmdb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') as 'movie' | 'tv') || 'movie';
    const contentId = parseInt(params.id);

    if (isNaN(contentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid content ID' },
        { status: 400 }
      );
    }

    const details = await getDetails(contentId, type);

    return NextResponse.json({
      success: true,
      data: details,
    });
  } catch (error) {
    console.error('Failed to fetch content details:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch content details',
      },
      { status: 502 }
    );
  }
}
```

### Example 3: Search Endpoint

```typescript
// app/api/content/search/route.ts
import { NextResponse } from 'next/server';
import { search } from '@/lib/tmdb';
import type { SearchFilters } from '@/lib/tmdb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Parse filters
    const filters: SearchFilters = {};

    const type = searchParams.get('type');
    if (type === 'movie' || type === 'tv' || type === 'person') {
      filters.type = type;
    }

    const genres = searchParams.get('genres');
    if (genres) {
      filters.genres = genres.split(',').map(Number);
    }

    const minYear = searchParams.get('minYear');
    const maxYear = searchParams.get('maxYear');
    if (minYear && maxYear) {
      filters.yearRange = {
        min: parseInt(minYear),
        max: parseInt(maxYear),
      };
    }

    const minRating = searchParams.get('minRating');
    if (minRating) {
      filters.minRating = parseFloat(minRating);
    }

    const results = await search(query, filters);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      },
      { status: 502 }
    );
  }
}
```

### Example 4: Season Details Endpoint

```typescript
// app/api/content/[id]/season/[seasonNumber]/route.ts
import { NextResponse } from 'next/server';
import { getSeasonDetails } from '@/lib/tmdb';

export async function GET(
  request: Request,
  { params }: { params: { id: string; seasonNumber: string } }
) {
  try {
    const tvId = parseInt(params.id);
    const seasonNumber = parseInt(params.seasonNumber);

    if (isNaN(tvId) || isNaN(seasonNumber)) {
      return NextResponse.json(
        { success: false, error: 'Invalid TV ID or season number' },
        { status: 400 }
      );
    }

    const season = await getSeasonDetails(tvId, seasonNumber);

    return NextResponse.json({
      success: true,
      data: season,
    });
  } catch (error) {
    console.error('Failed to fetch season details:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch season details',
      },
      { status: 502 }
    );
  }
}
```

## React Component Examples

### Example 5: Using TMDB Data in Server Components

```typescript
// app/browse/page.tsx
import { getTrending, getPopular, getOptimizedImageUrl } from '@/lib/tmdb';
import Image from 'next/image';

export default async function BrowsePage() {
  const trending = await getTrending('day');
  const popular = await getPopular('movie');

  return (
    <div>
      <h1>Trending Now</h1>
      <div className="grid grid-cols-5 gap-4">
        {trending.slice(0, 10).map((item) => (
          <div key={item.id}>
            {item.posterPath && (
              <Image
                src={getOptimizedImageUrl(item.posterPath, 342) || ''}
                alt={item.title}
                width={342}
                height={513}
              />
            )}
            <h3>{item.title}</h3>
          </div>
        ))}
      </div>

      <h1>Popular Movies</h1>
      <div className="grid grid-cols-5 gap-4">
        {popular.slice(0, 10).map((item) => (
          <div key={item.id}>
            {item.posterPath && (
              <Image
                src={getOptimizedImageUrl(item.posterPath, 342) || ''}
                alt={item.title}
                width={342}
                height={513}
              />
            )}
            <h3>{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Example 6: Client-Side Data Fetching

```typescript
// components/SearchResults.tsx
'use client';

import { useState, useEffect } from 'react';
import type { SearchResults } from '@/lib/tmdb';

export function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/content/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data.success) {
          setResults(data.data);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  if (loading) return <div>Loading...</div>;
  if (!results) return null;

  return (
    <div>
      <h2>Movies ({results.movies.length})</h2>
      {/* Render movies */}

      <h2>TV Shows ({results.tvShows.length})</h2>
      {/* Render TV shows */}

      <h2>People ({results.people.length})</h2>
      {/* Render people */}
    </div>
  );
}
```

## Error Handling Best Practices

### Always handle TMDB errors gracefully

```typescript
try {
  const content = await getTrending('day');
  return NextResponse.json({ success: true, data: content });
} catch (error) {
  // Log the error for debugging
  console.error('TMDB API error:', error);

  // Return user-friendly error with 502 status (Bad Gateway)
  return NextResponse.json(
    {
      success: false,
      error: 'Failed to fetch content from TMDB. Please try again later.',
    },
    { status: 502 }
  );
}
```

### Leverage automatic caching fallback

The TMDB service automatically caches responses and returns cached data when the API fails. This provides a better user experience during API outages.

## Image Optimization

### Always use optimized images

```typescript
import { getOptimizedImageUrl } from '@/lib/tmdb';

// For posters (portrait)
const posterUrl = getOptimizedImageUrl(content.posterPath, 342);

// For backdrops (landscape)
const backdropUrl = getOptimizedImageUrl(content.backdropPath, 1280);

// For profile images
const profileUrl = getOptimizedImageUrl(person.profilePath, 185);
```

### Recommended image widths

- Poster cards: 342px
- Backdrop hero: 1280px
- Profile avatars: 185px
- Episode stills: 300px
- Thumbnails: 154px

## Testing

Test your TMDB integration:

```bash
# Start the dev server
npm run dev

# Test the TMDB integration
curl http://localhost:3000/api/tmdb-test

# Test trending endpoint
curl http://localhost:3000/api/content/trending?timeWindow=day

# Test search
curl "http://localhost:3000/api/content/search?query=inception"
```
