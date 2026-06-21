# User Data API Routes

This directory contains API routes for managing user-generated data including watchlists, watch progress, ratings, viewing history, and recent searches.

## Overview

All routes require authentication via Auth0/Clerk tokens. Each route validates the token and ensures the user can only access their own profile data.

## API Routes

### Watchlist API

**GET /api/watchlist?profileId={profileId}**
- Get all watchlist items for a profile
- Returns: Array of WatchlistItem objects sorted by addedAt descending
- Requirements: 9.7

**POST /api/watchlist**
- Add an item to the watchlist
- Body: `{ profileId, contentId, contentType }`
- Returns: 201 Created
- Requirements: 9.4

**DELETE /api/watchlist/:contentId?profileId={profileId}**
- Remove an item from the watchlist
- Returns: 204 No Content
- Requirements: 9.5

### Watch Progress API

**GET /api/watch-progress?profileId={profileId}**
- Get continue watching items (percentageWatched < 95)
- Returns: Array of WatchProgress objects sorted by lastWatchedAt descending
- Requirements: 10.2

**POST /api/watch-progress**
- Update watch progress for content (upsert)
- Body: `{ profileId, contentId, contentType, episodeId?, seasonNumber?, episodeNumber?, currentTime, duration, percentageWatched }`
- Returns: 200 OK
- Requirements: 10.1

**DELETE /api/watch-progress/:contentId?profileId={profileId}**
- Remove item from continue watching
- Returns: 204 No Content
- Requirements: 10.5

### Ratings API

**GET /api/ratings/:contentId?profileId={profileId}**
- Get rating for a specific content item
- Returns: `{ rating: number | null }`
- Requirements: 11.19

**PUT /api/ratings/:contentId**
- Set or update rating for content (upsert)
- Body: `{ profileId, rating, contentType }`
- Rating must be 1-5
- Returns: 200 OK
- Requirements: 11.19

### History API

**GET /api/history?profileId={profileId}**
- Get all viewing history for a profile
- Returns: Array of WatchProgress objects sorted by lastWatchedAt descending
- Requirements: 18.8

**DELETE /api/history/:id**
- Remove a specific item from viewing history
- Returns: 204 No Content
- Requirements: 18.9

### Recent Searches API

**GET /api/searches?profileId={profileId}**
- Get recent searches for a profile
- Returns: Array of query strings (limit 10, sorted by timestamp descending)
- Requirements: 8.8

**POST /api/searches**
- Add or update a recent search (upsert)
- Body: `{ profileId, query }`
- Returns: 201 Created
- Requirements: 8.8

**DELETE /api/searches/:query?profileId={profileId}**
- Remove a specific recent search
- Query parameter is URL encoded
- Returns: 204 No Content
- Requirements: 8.9

## Data Models

### WatchlistItem
```typescript
{
  _id?: string
  profileId: string
  contentId: number
  contentType: 'movie' | 'tv'
  addedAt: Date
}
```

### WatchProgress
```typescript
{
  _id?: string
  profileId: string
  contentId: number
  contentType: 'movie' | 'tv'
  episodeId?: string
  seasonNumber?: number
  episodeNumber?: number
  currentTime: number // seconds
  duration: number // seconds
  percentageWatched: number
  lastWatchedAt: Date
}
```

### Rating
```typescript
{
  _id?: string
  profileId: string
  contentId: number
  contentType: 'movie' | 'tv'
  rating: number // 1-5
  createdAt: Date
}
```

### RecentSearch
```typescript
{
  _id?: string
  profileId: string
  query: string
  timestamp: Date
}
```

## Error Handling

All routes follow consistent error response format:
- 400: Bad Request (validation errors, missing parameters)
- 401: Unauthorized (missing or invalid token)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (duplicate entry)
- 500: Internal Server Error

## MongoDB Collections

- `watchlists`: Stores user watchlist items
- `watchHistory`: Stores watch progress and viewing history
- `ratings`: Stores user ratings for content
- `recentSearches`: Stores recent search queries

## Authentication

All routes use `validateApiAuth()` from `@/lib/auth` to validate Auth0/Clerk tokens. The userId is extracted from the token but not directly used in these routes - instead, profileId is passed in the request to ensure profile-level data isolation.

## Testing

Test these routes using:
1. Valid Auth0/Clerk token in Authorization header
2. Valid profileId that belongs to the authenticated user
3. Valid contentId from TMDB API

Example:
```bash
# Add to watchlist
curl -X POST http://localhost:3000/api/watchlist \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"profileId":"profile123","contentId":550,"contentType":"movie"}'

# Get watchlist
curl http://localhost:3000/api/watchlist?profileId=profile123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
