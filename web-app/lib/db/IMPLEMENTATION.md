# MongoDB Connection and Schema Implementation

## Overview

This implementation provides a complete MongoDB integration for the Netflix streaming platform, including connection pooling, retry logic with exponential backoff, TypeScript interfaces for all collections, and automated index creation.

## Task Requirements

✅ **Create MongoDB connection utility with connection pooling**
- Implemented in `lib/db/mongodb.ts`
- Connection pool configured with:
  - maxPoolSize: 10 connections
  - minPoolSize: 2 connections
  - maxIdleTimeMS: 30 seconds
  - serverSelectionTimeoutMS: 5 seconds
  - socketTimeoutMS: 45 seconds

✅ **Define TypeScript interfaces for all MongoDB collections**
- Implemented in `lib/db/types.ts`
- Collections covered:
  - `Profile` - User profiles with preferences
  - `WatchProgress` - Watch history tracking
  - `WatchlistItem` - User watchlists
  - `Rating` - Content ratings (1-5 stars)
  - `RecentSearch` - Search history

✅ **Create database indexes for optimal query performance**
- Implemented in `lib/db/init-indexes.ts`
- Indexes created on:
  - userId (profiles)
  - profileId (all user data collections)
  - contentId (watchHistory, watchlists, ratings)
  - timestamp (recentSearches with TTL)
  - Composite indexes for common query patterns

✅ **Implement database error handling with retry logic**
- Implemented in `lib/db/mongodb.ts` and `lib/db/errors.ts`
- Retry configuration:
  - 3 attempts maximum
  - Exponential backoff: 1s, 2s, 4s
  - Applies to both connection and operations
- Error classification:
  - CONNECTION_ERROR (503)
  - TIMEOUT_ERROR (503)
  - DUPLICATE_KEY_ERROR (409)
  - VALIDATION_ERROR (400)
  - NOT_FOUND_ERROR (404)
  - UNKNOWN_ERROR (500)

## Files Created

### Core Database Module
- `lib/db/mongodb.ts` - MongoDB connection utility with pooling and retry logic
- `lib/db/types.ts` - TypeScript interfaces for all collections
- `lib/db/errors.ts` - Error handling and classification
- `lib/db/init-indexes.ts` - Index creation and management
- `lib/db/index.ts` - Barrel export for the database module
- `lib/db/README.md` - Usage documentation
- `lib/db/IMPLEMENTATION.md` - This file

### Scripts and Utilities
- `scripts/init-db.ts` - Database initialization script
- `app/api/health/db/route.ts` - Health check endpoint

### Configuration
- Updated `package.json` with `db:init` script
- Installed dependencies: `mongodb`, `tsx`, `dotenv`

## Database Schema

### profiles Collection
```typescript
{
  _id: string
  userId: string          // from Auth0/Clerk
  name: string
  avatarUrl: string
  isKids: boolean
  maturityRating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17'
  pinEnabled: boolean
  pinHash?: string
  language: string
  preferences: {
    autoplayNextEpisode: boolean
    autoplayPreviews: boolean
    dataSaverMode: boolean
    subtitleLanguage: string
    audioLanguage: string
    selectedGenres: number[]
  }
  createdAt: Date
  updatedAt: Date
}
```

**Indexes:**
- `{ userId: 1 }`
- `{ userId: 1, name: 1 }`

### watchHistory Collection
```typescript
{
  _id: string
  profileId: string
  contentId: number
  contentType: 'movie' | 'tv'
  episodeId?: string
  seasonNumber?: number
  episodeNumber?: number
  currentTime: number      // seconds
  duration: number         // seconds
  percentageWatched: number
  lastWatchedAt: Date
}
```

**Indexes:**
- `{ profileId: 1 }`
- `{ profileId: 1, lastWatchedAt: -1 }`
- `{ profileId: 1, contentId: 1 }`
- `{ contentId: 1 }`
- `{ lastWatchedAt: -1 }`

### watchlists Collection
```typescript
{
  _id: string
  profileId: string
  contentId: number
  contentType: 'movie' | 'tv'
  addedAt: Date
}
```

**Indexes:**
- `{ profileId: 1 }`
- `{ profileId: 1, contentId: 1 }` (unique)
- `{ profileId: 1, addedAt: -1 }`
- `{ contentId: 1 }`

### ratings Collection
```typescript
{
  _id: string
  profileId: string
  contentId: number
  contentType: 'movie' | 'tv'
  rating: number          // 1-5
  createdAt: Date
}
```

**Indexes:**
- `{ profileId: 1 }`
- `{ profileId: 1, contentId: 1 }` (unique)
- `{ contentId: 1 }`
- `{ createdAt: -1 }`

### recentSearches Collection
```typescript
{
  _id: string
  profileId: string
  query: string
  timestamp: Date
}
```

**Indexes:**
- `{ profileId: 1 }`
- `{ profileId: 1, timestamp: -1 }`
- `{ timestamp: -1 }`
- `{ timestamp: 1 }` (TTL: 90 days)

## Usage Examples

### Basic Connection
```typescript
import { getDatabase } from '@/lib/db'

const db = await getDatabase()
const profiles = db.collection('profiles')
```

### With Retry Logic
```typescript
import { withRetry } from '@/lib/db'

const result = await withRetry(async () => {
  const db = await getDatabase()
  return db.collection('profiles').findOne({ userId: 'user123' })
})
```

### Error Handling
```typescript
import { parseDatabaseError, formatDatabaseErrorResponse } from '@/lib/db'

try {
  await db.collection('profiles').insertOne(profile)
} catch (error) {
  const dbError = parseDatabaseError(error)
  const response = formatDatabaseErrorResponse(dbError)
  return new Response(JSON.stringify(response), { status: 503 })
}
```

## Testing

### Initialize Database
```bash
npm run db:init
```

### Health Check
```bash
curl http://localhost:3000/api/health/db
```

## Design Decisions

1. **Lazy Initialization**: Connection is established on first use to avoid issues with environment variables not being loaded at module import time.

2. **Global Caching in Development**: In development mode, the MongoDB client is cached globally to prevent connection exhaustion during hot reloads.

3. **Exponential Backoff**: Retry delays follow exponential backoff (1s, 2s, 4s) to give transient issues time to resolve without overwhelming the database.

4. **TTL Index on Searches**: Recent searches automatically expire after 90 days to prevent unbounded growth.

5. **Unique Composite Indexes**: Watchlists and ratings use unique composite indexes on `profileId + contentId` to prevent duplicates.

6. **Comprehensive Error Classification**: Errors are classified into specific types with appropriate HTTP status codes for API responses.

## Requirements Validation

This implementation satisfies the following requirements from the spec:

- **Requirement 2.10**: "THE Backend_API SHALL maintain separate watch history, watchlist, ratings, and preferences for each profile"
  - ✅ All collections use `profileId` for data isolation
  - ✅ Indexes optimize queries by profile

- **Requirement 31.4**: "THE Backend_API SHALL handle all database operations with MongoDB"
  - ✅ Complete MongoDB integration with connection pooling
  - ✅ Retry logic with exponential backoff (3 attempts)
  - ✅ Comprehensive error handling
  - ✅ Type-safe interfaces for all collections

## Next Steps

With the database connection and schema in place, the next tasks can implement:
1. Profile API endpoints (`/api/profiles`)
2. Watchlist API endpoints (`/api/watchlist`)
3. Watch progress API endpoints (`/api/watch-progress`)
4. Ratings API endpoints (`/api/ratings`)
5. Search history API endpoints (`/api/searches`)

All of these can now use the database utilities provided by this implementation.
