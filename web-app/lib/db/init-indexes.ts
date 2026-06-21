/**
 * Database Index Initialization
 * 
 * Creates indexes for all MongoDB collections to optimize query performance.
 * Indexes are created on userId, profileId, contentId, and timestamp fields.
 */

import { getDatabase } from './mongodb'

/**
 * Initialize all database indexes
 * This should be called during application startup or deployment
 */
export async function initializeIndexes(): Promise<void> {
  try {
    console.log('Initializing database indexes...')
    const db = await getDatabase()

    // Profiles collection indexes
    const profilesCollection = db.collection('profiles')
    await profilesCollection.createIndex({ userId: 1 })
    await profilesCollection.createIndex({ userId: 1, name: 1 })
    console.log('✓ Created indexes for profiles collection')

    // Watch history collection indexes
    const watchHistoryCollection = db.collection('watchHistory')
    await watchHistoryCollection.createIndex({ profileId: 1 })
    await watchHistoryCollection.createIndex({ profileId: 1, lastWatchedAt: -1 })
    await watchHistoryCollection.createIndex({ profileId: 1, contentId: 1 })
    await watchHistoryCollection.createIndex({ contentId: 1 })
    await watchHistoryCollection.createIndex({ lastWatchedAt: -1 })
    console.log('✓ Created indexes for watchHistory collection')

    // Watchlists collection indexes
    const watchlistsCollection = db.collection('watchlists')
    await watchlistsCollection.createIndex({ profileId: 1 })
    await watchlistsCollection.createIndex({ profileId: 1, contentId: 1 }, { unique: true })
    await watchlistsCollection.createIndex({ profileId: 1, addedAt: -1 })
    await watchlistsCollection.createIndex({ contentId: 1 })
    console.log('✓ Created indexes for watchlists collection')

    // Ratings collection indexes
    const ratingsCollection = db.collection('ratings')
    await ratingsCollection.createIndex({ profileId: 1 })
    await ratingsCollection.createIndex({ profileId: 1, contentId: 1 }, { unique: true })
    await ratingsCollection.createIndex({ contentId: 1 })
    await ratingsCollection.createIndex({ createdAt: -1 })
    console.log('✓ Created indexes for ratings collection')

    // Recent searches collection indexes
    const recentSearchesCollection = db.collection('recentSearches')
    await recentSearchesCollection.createIndex({ profileId: 1 })
    await recentSearchesCollection.createIndex({ profileId: 1, timestamp: -1 })
    await recentSearchesCollection.createIndex({ timestamp: -1 })
    // TTL index to automatically delete searches older than 90 days
    await recentSearchesCollection.createIndex(
      { timestamp: 1 },
      { expireAfterSeconds: 90 * 24 * 60 * 60 }
    )
    console.log('✓ Created indexes for recentSearches collection')

    console.log('Database indexes initialized successfully')
  } catch (error) {
    console.error('Error initializing database indexes:', error)
    throw error
  }
}

/**
 * Drop all indexes (useful for testing or reinitialization)
 * WARNING: This will drop all indexes except the _id index
 */
export async function dropAllIndexes(): Promise<void> {
  try {
    console.log('Dropping all database indexes...')
    const db = await getDatabase()

    const collections = ['profiles', 'watchHistory', 'watchlists', 'ratings', 'recentSearches']

    for (const collectionName of collections) {
      const collection = db.collection(collectionName)
      await collection.dropIndexes()
      console.log(`✓ Dropped indexes for ${collectionName} collection`)
    }

    console.log('All database indexes dropped successfully')
  } catch (error) {
    console.error('Error dropping database indexes:', error)
    throw error
  }
}
