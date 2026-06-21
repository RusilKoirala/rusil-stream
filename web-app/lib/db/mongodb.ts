/**
 * MongoDB Connection Utility
 * 
 * Provides a singleton MongoDB client with connection pooling and retry logic.
 * Implements exponential backoff for connection failures (3 attempts).
 */

import { MongoClient, Db, MongoClientOptions } from 'mongodb'

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable')
  }
  return uri
}

const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'streaming-platform'

// Connection pool options
const options: MongoClientOptions = {
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 2, // Minimum number of connections in the pool
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  socketTimeoutMS: 45000, // Timeout for socket operations
}

// Global variables to maintain connection across hot reloads in development
let clientPromise: Promise<MongoClient> | null = null

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

/**
 * Sleep utility for exponential backoff
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Connect to MongoDB with retry logic (3 attempts with exponential backoff)
 */
async function connectWithRetry(
  uri: string,
  options: MongoClientOptions,
  maxAttempts = 3
): Promise<MongoClient> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`MongoDB connection attempt ${attempt}/${maxAttempts}`)
      const client = new MongoClient(uri, options)
      await client.connect()
      console.log('MongoDB connected successfully')
      return client
    } catch (error) {
      lastError = error as Error
      console.error(
        `MongoDB connection attempt ${attempt} failed:`,
        error instanceof Error ? error.message : error
      )

      if (attempt < maxAttempts) {
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = Math.pow(2, attempt - 1) * 1000
        console.log(`Retrying in ${delayMs}ms...`)
        await sleep(delayMs)
      }
    }
  }

  throw new Error(
    `Failed to connect to MongoDB after ${maxAttempts} attempts: ${lastError?.message}`
  )
}

function initializeClient(): Promise<MongoClient> {
  const MONGODB_URI = getMongoUri()
  
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable to preserve the connection
    // across hot reloads
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = connectWithRetry(MONGODB_URI, options)
    }
    return global._mongoClientPromise
  } else {
    // In production mode, create a new client
    return connectWithRetry(MONGODB_URI, options)
  }
}

/**
 * Get the MongoDB client instance
 * @returns Promise resolving to MongoClient
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    clientPromise = initializeClient()
  }
  return clientPromise
}

/**
 * Get the database instance
 * @returns Promise resolving to Db
 */
export async function getDatabase(): Promise<Db> {
  const client = await getMongoClient()
  return client.db(MONGODB_DB_NAME)
}

/**
 * Execute a database operation with retry logic
 * @param operation - The database operation to execute
 * @param maxAttempts - Maximum number of retry attempts (default: 3)
 * @returns Promise resolving to the operation result
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.error(
        `Database operation attempt ${attempt} failed:`,
        error instanceof Error ? error.message : error
      )

      if (attempt < maxAttempts) {
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = Math.pow(2, attempt - 1) * 1000
        console.log(`Retrying operation in ${delayMs}ms...`)
        await sleep(delayMs)
      }
    }
  }

  throw new Error(
    `Database operation failed after ${maxAttempts} attempts: ${lastError?.message}`
  )
}

// Export a getter function for the client promise
const getClientPromise = () => getMongoClient()
export default getClientPromise
