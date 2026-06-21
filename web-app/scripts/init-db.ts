/**
 * Database Initialization Script
 * 
 * Run this script to initialize the database connection and create indexes.
 * Usage: npx tsx scripts/init-db.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { getDatabase, initializeIndexes } from '../lib/db'

async function main() {
  try {
    console.log('Starting database initialization...\n')

    // Test database connection
    console.log('Testing database connection...')
    const db = await getDatabase()
    const adminDb = db.admin()
    const serverStatus = await adminDb.serverStatus()
    console.log(`✓ Connected to MongoDB ${serverStatus.version}`)
    console.log(`✓ Database: ${db.databaseName}\n`)

    // Initialize indexes
    await initializeIndexes()

    console.log('\n✓ Database initialization completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('\n✗ Database initialization failed:', error)
    process.exit(1)
  }
}

main()
