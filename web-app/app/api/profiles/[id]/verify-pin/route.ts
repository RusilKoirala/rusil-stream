import { NextRequest } from 'next/server';
import { validateApiAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { getDatabase, Profile } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

/**
 * Profile PIN Verification API Route
 * 
 * POST /api/profiles/:id/verify-pin - Verify profile PIN
 */

// Validation schema for PIN verification
const verifyPinSchema = z.object({
  pin: z.string().length(4).regex(/^\d{4}$/, 'PIN must be 4 digits'),
});

/**
 * POST /api/profiles/:id/verify-pin
 * Verify a profile's PIN
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate authentication
  const { userId, error } = await validateApiAuth();
  if (error) return error;

  try {
    const { id } = await params;

    // Validate profile ID format
    if (!ObjectId.isValid(id)) {
      return createErrorResponse(
        'INVALID_ID',
        'Invalid profile ID format',
        400
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = verifyPinSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid PIN format',
        400,
        validationResult.error.issues
      );
    }

    const { pin } = validationResult.data;

    const db = await getDatabase();
    const profilesCollection = db.collection<Omit<Profile, '_id'>>('profiles');

    // Query profile by ID
    const profile = await profilesCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!profile) {
      return createErrorResponse(
        'NOT_FOUND',
        'Profile not found',
        404
      );
    }

    // Verify the profile belongs to the authenticated user
    if (profile.userId !== userId) {
      return createErrorResponse(
        'FORBIDDEN',
        'You do not have permission to access this profile',
        403
      );
    }

    // Check if PIN is enabled
    if (!profile.pinEnabled || !profile.pinHash) {
      return createErrorResponse(
        'PIN_NOT_ENABLED',
        'PIN protection is not enabled for this profile',
        400
      );
    }

    // Compare provided PIN with stored hash
    const isValid = await bcrypt.compare(pin, profile.pinHash);

    return createSuccessResponse({ valid: isValid });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to verify PIN',
      500
    );
  }
}
