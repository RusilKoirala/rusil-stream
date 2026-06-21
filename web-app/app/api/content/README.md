# Content API Routes

This directory contains all TMDB proxy API routes for fetching content metadata.

## Routes

### GET /api/content/trending
Fetches trending content from TMDB.

**Query Parameters:**
- `timeWindow` (optional): `'day'` | `'week'` (default: `'day'`)

**Response:** Array of `Content` objects

**Requirements:** 3.2, 4.2

---

### GET /api/content/popular
Fetches popular content from TMDB.

**Query Parameters:**
- `type` (required): `'movie'` | `'tv'`

**Response:** Array of `Content` objects

**Requirements:** 3.3, 4.7

---

### GET /api/content/top-rated
Fetches top-rated content from TMDB.

**Query Parameters:**
- `type` (required): `'movie'` | `'tv'`

**Response:** Array of `Content` objects

**Requirements:** 3.4

---

### GET /api/content/new-releases
Fetches new releases from TMDB.

**Response:** Array of `Content` objects

**Requirements:** 3.5, 4.6

---

### GET /api/content/genres
Fetches genre list from TMDB.

**Query Parameters:**
- `type` (required): `'movie'` | `'tv'`

**Response:** Array of `Genre` objects

**Requirements:** 3.6, 4.10

---

### GET /api/content/:id
Fetches detailed content information from TMDB.

**Path Parameters:**
- `id`: Content ID (number)

**Query Parameters:**
- `type` (required): `'movie'` | `'tv'`

**Response:** `ContentDetails` object

**Requirements:** 3.7, 11.10, 11.11

---

### GET /api/content/:id/season/:seasonNumber
Fetches season details including episodes from TMDB.

**Path Parameters:**
- `id`: TV show ID (number)
- `seasonNumber`: Season number (number)

**Response:** `Season` object with episodes

**Requirements:** 3.10, 11.12, 11.13, 11.14

---

### GET /api/content/:id/recommendations
Fetches recommended content based on a specific title from TMDB.

**Path Parameters:**
- `id`: Content ID (number)

**Query Parameters:**
- `type` (required): `'movie'` | `'tv'`

**Response:** Array of `Content` objects

**Requirements:** 3.9, 11.16

---

### GET /api/content/:id/similar
Fetches similar content based on a specific title from TMDB.

**Path Parameters:**
- `id`: Content ID (number)

**Query Parameters:**
- `type` (required): `'movie'` | `'tv'`

**Response:** Array of `Content` objects

**Requirements:** 3.9, 11.16

---

### GET /api/content/search
Searches for content (movies, TV shows, people) from TMDB.

**Query Parameters:**
- `query` (required): Search query string
- `type` (optional): `'movie'` | `'tv'` | `'person'`
- `genres` (optional): Comma-separated genre IDs
- `minYear` (optional): Minimum release year
- `maxYear` (optional): Maximum release year
- `minRating` (optional): Minimum rating (0-10)

**Response:** `SearchResults` object with `movies`, `tvShows`, `people` arrays

**Requirements:** 8.4, 8.5, 8.12

---

## Error Handling

All routes follow a consistent error response format:

```typescript
{
  error: string,          // Error type (e.g., "VALIDATION_ERROR", "INTERNAL_SERVER_ERROR")
  message: string,        // Human-readable error message
  details?: any,          // Optional additional error details
  timestamp: string       // ISO 8601 timestamp
}
```

**HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (validation errors)
- `500`: Internal Server Error

## Usage Example

```typescript
// Fetch trending content
const trending = await fetch('/api/content/trending?timeWindow=week');
const data = await trending.json();

// Search for movies
const results = await fetch('/api/content/search?query=inception&type=movie');
const searchData = await results.json();

// Get content details
const details = await fetch('/api/content/550?type=movie');
const movieDetails = await details.json();
```

## Implementation Notes

- All routes use the TMDB service layer (`@/lib/tmdb/service`)
- Responses are cached by the TMDB service for performance
- Image URLs are optimized using wsrv.nl
- All routes include comprehensive validation and error handling
