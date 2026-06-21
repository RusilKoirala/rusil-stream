import { getDatabase } from '@/lib/db';
import { randomBytes } from 'crypto';

/**
 * Device Code Authentication Utility
 * 
 * Handles generation, storage, and validation of device codes
 * for linking TV devices to user accounts.
 */

export interface DeviceCode {
  _id?: string;
  code: string;          // 6-digit numeric code
  deviceToken: string;   // unique token for the device
  status: 'pending' | 'activated' | 'expired';
  userId: string | null; // linked Clerk user ID (set on activation)
  createdAt: Date;
  expiresAt: Date;
}

const COLLECTION_NAME = 'deviceCodes';
const CODE_EXPIRY_SECONDS = 600; // 10 minutes

async function getCollection() {
  const db = await getDatabase();
  return db.collection<DeviceCode>(COLLECTION_NAME);
}

/**
 * Generate a random 6-digit numeric code (no leading zeros)
 */
export function generateCode(): string {
  const num = 100000 + Math.floor(Math.random() * 900000); // 100000-999999
  return String(num);
}

/**
 * Generate a unique device token
 */
export function generateDeviceToken(): string {
  return 'dtk_' + randomBytes(24).toString('hex');
}

/**
 * Create a new device code entry in the database
 */
export async function createDeviceCode(): Promise<{ code: string; deviceToken: string; expiresIn: number }> {
  const collection = await getCollection();

  // Ensure TTL index exists (MongoDB will auto-delete expired documents)
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await collection.createIndex({ code: 1 }, { unique: true, sparse: true });
  await collection.createIndex({ deviceToken: 1 }, { sparse: true });

  const code = generateCode();
  const deviceToken = generateDeviceToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CODE_EXPIRY_SECONDS * 1000);

  const doc: DeviceCode = {
    code,
    deviceToken,
    status: 'pending',
    userId: null,
    createdAt: now,
    expiresAt,
  };

  await collection.insertOne(doc);

  return { code, deviceToken, expiresIn: CODE_EXPIRY_SECONDS };
}

/**
 * Look up a device code by its 6-digit code
 */
export async function findByCode(code: string): Promise<DeviceCode | null> {
  const collection = await getCollection();
  const doc = await collection.findOne({ code });

  if (!doc) return null;

  // Check if expired
  if (doc.status === 'pending' && new Date() > doc.expiresAt) {
    return { ...doc, status: 'expired' };
  }

  return doc;
}

/**
 * Look up a device code by its device token
 */
export async function findByDeviceToken(token: string): Promise<DeviceCode | null> {
  const collection = await getCollection();
  return collection.findOne({ deviceToken: token });
}

/**
 * Activate a device code — links it to a user account
 */
export async function activateDeviceCode(code: string, userId: string): Promise<{ success: boolean; error?: string }> {
  const collection = await getCollection();

  const doc = await collection.findOne({ code });

  if (!doc) {
    return { success: false, error: 'Code not found' };
  }

  if (doc.status === 'activated') {
    return { success: false, error: 'Code already activated' };
  }

  if (new Date() > doc.expiresAt) {
    return { success: false, error: 'Code has expired' };
  }

  await collection.updateOne(
    { code },
    { $set: { status: 'activated', userId } }
  );

  return { success: true };
}

/**
 * Validate a device token and return the linked userId
 */
export async function validateDeviceToken(token: string): Promise<string | null> {
  const doc = await findByDeviceToken(token);
  if (!doc || doc.status !== 'activated' || !doc.userId) {
    return null;
  }
  return doc.userId;
}
