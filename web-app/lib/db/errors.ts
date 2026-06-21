/**
 * Database Error Handling
 * 
 * Provides error handling utilities for MongoDB operations with proper
 * error classification and user-friendly messages.
 */

import { MongoError } from 'mongodb'

/**
 * Database error types
 */
export enum DatabaseErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  DUPLICATE_KEY_ERROR = 'DUPLICATE_KEY_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom database error class
 */
export class DatabaseError extends Error {
  public readonly type: DatabaseErrorType
  public readonly originalError?: Error
  public readonly details?: Record<string, unknown>

  constructor(
    type: DatabaseErrorType,
    message: string,
    originalError?: Error,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'DatabaseError'
    this.type = type
    this.originalError = originalError
    this.details = details
  }
}

/**
 * Check if an error is a MongoDB error
 */
export function isMongoError(error: unknown): error is MongoError {
  return error instanceof MongoError
}

/**
 * Parse MongoDB error and convert to DatabaseError
 */
export function parseDatabaseError(error: unknown): DatabaseError {
  if (isMongoError(error)) {
    // Duplicate key error (code 11000)
    if (error.code === 11000) {
      const field = extractDuplicateKeyField(error)
      return new DatabaseError(
        DatabaseErrorType.DUPLICATE_KEY_ERROR,
        `Duplicate entry for field: ${field}`,
        error,
        { field, code: error.code }
      )
    }

    // Connection errors
    if (
      error.message.includes('connection') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT')
    ) {
      return new DatabaseError(
        DatabaseErrorType.CONNECTION_ERROR,
        'Failed to connect to database',
        error
      )
    }

    // Timeout errors
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return new DatabaseError(
        DatabaseErrorType.TIMEOUT_ERROR,
        'Database operation timed out',
        error
      )
    }
  }

  // Generic error
  if (error instanceof Error) {
    return new DatabaseError(
      DatabaseErrorType.UNKNOWN_ERROR,
      error.message,
      error
    )
  }

  // Unknown error type
  return new DatabaseError(
    DatabaseErrorType.UNKNOWN_ERROR,
    'An unknown database error occurred',
    undefined,
    { error }
  )
}

/**
 * Extract the field name from a duplicate key error
 */
function extractDuplicateKeyField(error: MongoError): string {
  try {
    const match = error.message.match(/index: (\w+)_/)
    if (match && match[1]) {
      return match[1]
    }

    // Try to extract from keyPattern if available
    const errorWithKeyPattern = error as MongoError & { keyPattern?: Record<string, unknown> }
    if (errorWithKeyPattern.keyPattern) {
      return Object.keys(errorWithKeyPattern.keyPattern)[0] || 'unknown'
    }
  } catch {
    // Ignore parsing errors
  }

  return 'unknown'
}

/**
 * Get HTTP status code for database error
 */
export function getHttpStatusForDatabaseError(error: DatabaseError): number {
  switch (error.type) {
    case DatabaseErrorType.CONNECTION_ERROR:
    case DatabaseErrorType.TIMEOUT_ERROR:
      return 503 // Service Unavailable
    case DatabaseErrorType.DUPLICATE_KEY_ERROR:
      return 409 // Conflict
    case DatabaseErrorType.VALIDATION_ERROR:
      return 400 // Bad Request
    case DatabaseErrorType.NOT_FOUND_ERROR:
      return 404 // Not Found
    default:
      return 500 // Internal Server Error
  }
}

/**
 * Format database error for API response
 */
export function formatDatabaseErrorResponse(error: DatabaseError) {
  return {
    error: error.type,
    message: error.message,
    details: error.details,
    timestamp: new Date().toISOString(),
  }
}
