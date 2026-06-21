# Database Module

This module provides MongoDB connection utilities, TypeScript types, and error handling for the streaming platform.

## Features

- **Connection Pooling**: Efficient connection management with configurable pool size
- **Retry Logic**: Automatic retry with exponential backoff (3 attempts)
- **Type Safety**: Complete TypeScript interfaces for all collections
- **Error Handling**: Comprehensive error classification and handling
- **Index Management**: Automated index creation for optimal query performance

## Usage

### Basic Connection

```typescript
import { getDatabase, getMongoClient } from '@/lib/db'

// Get database instance
const db = await getDatabase()

// Get client instance
const client = await getMongoClient()
```

### Using Collections with Types

```typescript
import { getDatabase, Profile, WatchProgress } from '@/lib/db'

const db = await getDatabase()

// Profiles collection
const profilesCollection = db.collection<Profile>('profiles')
const profile = await profilesCollection.findOne({ userId: 'user123' })

// Watch history collection
const watchHistoryCollection = db.collection<WatchProgress>('watchHistory')
const progress = await watchHistoryCollection.find({ profileId: 'profile123' }).toArray()
```

### Retry Logic

```typescript
import { withRetry } from '@/lib/db'

// Wrap database operations with automatic retry
const result = await withRetry(async () => {
  const db = await getDatabase()
  return db.collection('profiles').findOne({ userId: 'user123' })
})
```

### Error Handling

```typescript
import {
  parseDatabaseError,
  getHttpStatusForDatabaseError,
  formatDatabaseErrorResponse,
} from '@/lib/db'

try {
  // Database operation
  await db.collection('profiles').insertOne(profile)
} catch (error) {
  const dbError = parseDatabaseError(error)
  const statusCode = getHttpStatusForDatabaseError(dbError)
  const response = formatDatabaseErrorResponse(dbError)
  
  return new Response(JSON.stringify(response), { status: statusCode })
}
```

## Collections

### profiles
- **Indexes**: `userId`, `userId + name`
- **Type**: `Profile`
- **Description**: User profiles with preferences and settings

### watchHistory
- **Indexes**: `profileId`, `profileId + lastWatchedAt`, `profileId + contentId`, `contentId`, `lastWatchedAt`
- **Type**: `WatchProgress`
- **Description**: Watch progress tracking for movies and TV shows

### watchlists
- **Indexes**: `profileId`, `profileId + contentId` (unique), `profileId + addedAt`, `contentId`
- **Type**: `WatchlistItem`
- **Description**: User-curated content lists

### ratings
- **Indexes**: `profileId`, `profileId + contentId` (unique), `contentId`, `createdAt`
- **Type**: `Rating`
- **Description**: User ratings for content (1-5 stars)

### recentSearches
- **Indexes**: `profileId`, `profileId + timestamp`, `timestamp` (TTL: 90 days)
- **Type**: `RecentSearch`
- **Description**: Search history per profile (auto-deleted after 90 days)

## Initialization

Run the database initialization script to create indexes:

```bash
npm run db:init
```

This will:
1. Test the database connection
2. Create all necessary indexes
3. Display connection and index creation status

## Environment Variables

Required environment variables:

```env
MONGODB_URI=mongodb://localhost:27017/streaming-platform
MONGODB_DB_NAME=streaming-platform  # Optional, defaults to 'streaming-platform'
```

## Connection Pool Configuration

The connection pool is configured with the following defaults:

- **maxPoolSize**: 10 connections
- **minPoolSize**: 2 connections
- **maxIdleTimeMS**: 30 seconds
- **serverSelectionTimeoutMS**: 5 seconds
- **socketTimeoutMS**: 45 seconds

## Retry Configuration

Database operations automatically retry on failure:

- **Max Attempts**: 3
- **Backoff Strategy**: Exponential (1s, 2s, 4s)
- **Applies To**: Connection failures, timeout errors, transient errors

## Error Types

The module classifies errors into the following types:

- `CONNECTION_ERROR` (503): Database connection failures
- `TIMEOUT_ERROR` (503): Operation timeouts
- `DUPLICATE_KEY_ERROR` (409): Unique constraint violations
- `VALIDATION_ERROR` (400): Data validation failures
- `NOT_FOUND_ERROR` (404): Document not found
- `UNKNOWN_ERROR` (500): Unclassified errors

## Development vs Production

In development mode, the MongoDB client is cached globally to prevent connection exhaustion during hot reloads. In production, a new client is created for each deployment.
