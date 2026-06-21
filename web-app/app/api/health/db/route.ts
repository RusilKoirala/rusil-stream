/**
 * Database Health Check Endpoint
 * 
 * GET /api/health/db
 * 
 * Tests the MongoDB connection and returns database status.
 */

import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getDatabase, parseDatabaseError, formatDatabaseErrorResponse } from '@/lib/db'
import { validateInternalApiKey } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const internalKeyError = validateInternalApiKey(request)
  if (internalKeyError) return internalKeyError

  try {
    const db = await getDatabase()
    
    // Ping the database to verify connection
    await db.admin().ping()
    
    // Get database stats
    const stats = await db.stats()
    
    return NextResponse.json({
      status: 'healthy',
      database: db.databaseName,
      collections: stats.collections,
      dataSize: stats.dataSize,
      indexSize: stats.indexSize,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const dbError = parseDatabaseError(error)
    const response = formatDatabaseErrorResponse(dbError)
    
    return NextResponse.json(
      { status: 'unhealthy', ...response },
      { status: 503 }
    )
  }
}
