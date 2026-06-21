import { NextRequest } from 'next/server';
import { validateApiAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { getDatabase, Profile } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

/**
 * Profile Detail API Routes
 * 
 * GET /api/profiles/:id - Get single profile by ID
 * PATCH /api/profiles/:id - Update profile
 * DELETE /api/profiles/:id - Delete profile
 */

const avatarUrlSchema = z.string().min(1).refine(
  (value) => value.startsWith('/') || /^https?:\/\//.test(value),
  'avatarUrl must be an absolute URL or app-relative path'
);

// Validation schema for profile updates
const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  avatarUrl: avatarUrlSchema.optional(),
  isKids: z.boolean().optional(),
  maturityRating: z.enum(['G', 'PG', 'PG-13', 'R', 'NC-17']).optional(),
  pinEnabled: z.boolean().optional(),
  pinHash: z.string().optional(),
  language: z.string().optional(),
  preferences: z.object({
    autoplayNextEpisode: z.boolean().optional(),
    autoplayPreviews: z.boolean().optional(),
    dataSaverMode: z.boolean().optional(),
    subtitleLanguage: z.string().optional(),
    audioLanguage: z.string().optional(),
    selectedGenres: z.array(z.number()).optional(),
    notifications: z.object({
      enabled: z.boolean().optional(),
      newReleases: z.boolean().optional(),
      watchlistUpdates: z.boolean().optional(),
      recommendedContent: z.boolean().optional(),
      episodeReminders: z.boolean().optional(),
    }).optional(),
  }).optional(),
}).strict();

/**
 * GET /api/profiles/:id
 * Get a single profile by ID
 */
export async function GET(
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

    // Remove sensitive data (pinHash) from response
    const { pinHash, _id, ...sanitizedProfile } = profile;

    return createSuccessResponse({
      ...sanitizedProfile,
      _id: _id.toString(),
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch profile',
      500
    );
  }
}

/**
 * PATCH /api/profiles/:id
 * Update a profile
 */
export async function PATCH(
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
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid profile data',
        400,
        validationResult.error.issues
      );
    }

    const updateData = validationResult.data;

    const db = await getDatabase();
    const profilesCollection = db.collection<Omit<Profile, '_id'>>('profiles');

    // First, verify the profile exists and belongs to the user
    const existingProfile = await profilesCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingProfile) {
      return createErrorResponse(
        'NOT_FOUND',
        'Profile not found',
        404
      );
    }

    if (existingProfile.userId !== userId) {
      return createErrorResponse(
        'FORBIDDEN',
        'You do not have permission to update this profile',
        403
      );
    }

    // Update profile document
    const result = await profilesCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...(updateData as any),
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to update profile',
        500
      );
    }

    // Remove sensitive data (pinHash) from response
    const { pinHash, _id, ...sanitizedProfile } = result;

    return createSuccessResponse({
      ...sanitizedProfile,
      _id: _id.toString(),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to update profile',
      500
    );
  }
}

/**
 * DELETE /api/profiles/:id
 * Delete a profile
 */
export async function DELETE(
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

    const db = await getDatabase();
    const profilesCollection = db.collection<Omit<Profile, '_id'>>('profiles');

    // First, verify the profile exists and belongs to the user
    const existingProfile = await profilesCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingProfile) {
      return createErrorResponse(
        'NOT_FOUND',
        'Profile not found',
        404
      );
    }

    if (existingProfile.userId !== userId) {
      return createErrorResponse(
        'FORBIDDEN',
        'You do not have permission to delete this profile',
        403
      );
    }

    // Delete the profile
    await profilesCollection.deleteOne({ _id: new ObjectId(id) });

    // Return 204 No Content
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to delete profile',
      500
    );
  }
}
