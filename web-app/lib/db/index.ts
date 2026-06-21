/**
 * Database Module
 * 
 * Central export point for all database-related functionality.
 */

// MongoDB connection utilities
export {
  getMongoClient,
  getDatabase,
  withRetry,
} from './mongodb'

// TypeScript types
export type {
  Profile,
  ProfilePreferences,
  WatchProgress,
  WatchlistItem,
  Rating,
  RecentSearch,
} from './types'

// Index initialization
export { initializeIndexes, dropAllIndexes } from './init-indexes'

// Error handling
export {
  DatabaseError,
  DatabaseErrorType,
  isMongoError,
  parseDatabaseError,
  getHttpStatusForDatabaseError,
  formatDatabaseErrorResponse,
} from './errors'
