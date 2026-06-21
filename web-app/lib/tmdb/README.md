# TMDB API Integration

Complete integration with The Movie Database (TMDB) API v3 for fetching movie and TV show metadata.

## Features

✅ **Complete TMDB API Coverage**
- Trending content (day/week)
- Popular movies and TV shows
- Top-rated content
- New releases (last 30 days)
- Genre lists
- Content details with cast, crew, videos
- Season and episode details
- Recommendations and similar content
- Multi-type search (movies, TV shows, people)
- Genre-based discovery

✅ **Image Optimization**
- Automatic wsrv.nl optimization for all images
- WebP format conversion
- Configurable width parameters
- Fallback to direct TMDB URLs

✅ **Error Handling**
- Comprehensive error messages
- Automatic caching fallback on API failures
- 1-hour cache TTL for all responses
- Graceful degradation

✅ **Type Safety**
- Full TypeScript support with strict mode
- Comprehensive type definitions for all TMDB responses
- Application-level types for parsed data
- Type guards for content discrimination

## Requirements Validation

This implementation satisfies the following requirements:

- **Requirement 3.1**: All content metadata from TMDB API v3 ✓
- **Requirement 3.2**: Trending content ✓
- **Requirement 3.3**: Popular movies and TV shows ✓
- **Requirement 3.4**: Top-rated titles ✓
- **Requirement 3.5**: New releases ✓
- **Requirement 3.6**: Content by genre ✓
- **Requirement 3.7**: Title details (synopsis, cast, crew, metadata) ✓
- **Requirement 3.8**: Trailers and video clips ✓
- **Requirement 3.9**: Recommendations and similar titles ✓
- **Requirement 3.10**: Season and episode details ✓
- **Requirement 3.11**: TMDB image CDN with size variants ✓
- **Requirement 3.12**: wsrv.nl image optimization ✓
- **Requirement 30.1**: Valid response parsing ✓
- **Requirement 30.2**: Error handling for invalid responses ✓
- **Requirement 30.3**: Image URL transformation ✓
- **Requirement 31.5**: Backend API handles TMDB calls ✓

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TMDB Integration Layer                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   types.ts   │  │  client.ts   │  │ parsers.ts   │    │
│  │              │  │              │  │              │    │
│  │ • TMDB types │  │ • API client │  │ • Response   │    │
│  │ • App types  │  │ • Error      │  │   parsing    │    │
│  │              │  │   handling   │  │ • Type       │    │
│  │              │  │ • Image URLs │  │   conversion │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────────┐     │
│  │              service.ts                          │     │
│  │                                                  │     │
│  │  • getTrending()      • getSeasonDetails()      │     │
│  │  • getPopular()       • getRecommendations()    │     │
│  │  • getTopRated()      • getSimilar()            │     │
│  │  • getNewReleases()   • search()                │     │
│  │  • getGenres()        • getByGenre()            │     │
│  │  • getDetails()                                 │     │
│  │                                                  │     │
│  │  • Caching with 1-hour TTL                      │     │
│  │  • Automatic fallback on failures               │     │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │   TMDB API v3    │
                  │ api.themoviedb   │
                  │     .org/3       │
                  └──────────────────┘
```

## Usage

See [USAGE.md](./USAGE.md) for detailed usage examples.

### Quick Start

```typescript
import {
  getTrending,
  getPopular,
  getDetails,
  getOptimizedImageUrl,
} from '@/lib/tmdb';

// Fetch trending content
const trending = await getTrending('day');

// Fetch popular movies
const movies = await getPopular('movie');

// Get content details
const details = await getDetails(550, 'movie');

// Optimize image URL
const imageUrl = getOptimizedImageUrl(details.posterPath, 500);
```

## Configuration

Set the following environment variables:

```env
TMDB_API_KEY=your_api_key_here
TMDB_API_BASE_URL=https://api.themoviedb.org/3
```

## Error Handling

All functions throw descriptive errors on failure:

```typescript
try {
  const content = await getTrending('day');
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to fetch trending:', error.message);
  }
}
```

The service automatically falls back to cached data when available:

```typescript
// If TMDB API fails, returns cached data if available
const trending = await getTrending('day');
// Returns cached data with console warning if API fails
```

## Testing

A test endpoint is available at `/api/tmdb-test` that validates:

- All service functions
- Image URL transformation
- Error handling
- Response parsing

Run the test:

```bash
curl http://localhost:3000/api/tmdb-test
```

## Cache Strategy

- **TTL**: 1 hour (3600000ms)
- **Storage**: In-memory Map
- **Fallback**: Automatic on API failures
- **Keys**: Function name + parameters

## Image Optimization

Images are automatically optimized using wsrv.nl:

```typescript
// Input: /abc123.jpg
// Output: https://wsrv.nl/?url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Foriginal%2Fabc123.jpg&w=500&output=webp
```

Benefits:
- WebP format (smaller file size)
- Configurable width
- Automatic resizing
- CDN delivery

## Type Safety

All responses are fully typed:

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

## Performance

- **Caching**: 1-hour TTL reduces API calls
- **Next.js Cache**: Automatic revalidation every hour
- **Lazy Loading**: Images loaded on demand
- **Optimized Images**: WebP format via wsrv.nl

## Limitations

- TMDB API rate limits apply (check TMDB documentation)
- Cache is in-memory (resets on server restart)
- No persistent cache layer (can be added if needed)

## Future Enhancements

- [ ] Redis cache for persistent storage
- [ ] Rate limiting with exponential backoff
- [ ] Request deduplication
- [ ] Batch requests for multiple items
- [ ] Webhook support for content updates
