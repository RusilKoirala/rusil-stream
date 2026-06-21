import { NextRequest } from 'next/server';
import { validateApiAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { getDatabase, Profile, ProfilePreferences } from '@/lib/db';
import { z } from 'zod';

/**
 * Profile API Routes
 * 
 * GET /api/profiles - List all profiles for authenticated user
 * POST /api/profiles - Create new profile for authenticated user
 */

// Validation schema for profile creation
const avatarUrlSchema = z.string().min(1).refine(
  (value) => value.startsWith('/') || /^https?:\/\//.test(value),
  'avatarUrl must be an absolute URL or app-relative path'
);

const createProfileSchema = z.object({
  name: z.string().min(1).max(50),
  avatarUrl: avatarUrlSchema,
  isKids: z.boolean(),
  maturityRating: z.enum(['G', 'PG', 'PG-13', 'R', 'NC-17']),
  pinEnabled: z.boolean(),
  pinHash: z.string().optional(),
  language: z.string(),
  preferences: z.object({
    autoplayNextEpisode: z.boolean(),
    autoplayPreviews: z.boolean(),
    dataSaverMode: z.boolean(),
    subtitleLanguage: z.string(),
    audioLanguage: z.string(),
    selectedGenres: z.array(z.number()),
    notifications: z.object({
      enabled: z.boolean(),
      newReleases: z.boolean(),
      watchlistUpdates: z.boolean(),
      recommendedContent: z.boolean(),
      episodeReminders: z.boolean(),
    }).optional(),
  }),
});

/**
 * GET /api/profiles
 * List all profiles for the authenticated user
 */
export async function GET(request: NextRequest) {
  // Validate authentication
  const { userId, error } = await validateApiAuth();
  if (error) return error;

  try {
    const db = await getDatabase();
    const profilesCollection = db.collection<Profile>('profiles');

    // Query profiles by userId
    const profiles = await profilesCollection
      .find({ userId })
      .sort({ createdAt: 1 })
      .toArray();

    // Remove sensitive data (pinHash) from response
    const sanitizedProfiles = profiles.map(profile => {
      const { pinHash, ...rest } = profile;
      return rest;
    });

    return createSuccessResponse(sanitizedProfiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch profiles',
      500
    );
  }
}

/**
 * POST /api/profiles
 * Create a new profile for the authenticated user
 */
export async function POST(request: NextRequest) {
  // Validate authentication
  const { userId, error } = await validateApiAuth();
  if (error) return error;

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = createProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid profile data',
        400,
        validationResult.error.issues
      );
    }

    const profileData = validationResult.data;

    const db = await getDatabase();
    const profilesCollection = db.collection<Profile>('profiles');

    // Check profile limit (maximum 5 profiles per user)
    const existingProfilesCount = await profilesCollection.countDocuments({ userId });
    
    if (existingProfilesCount >= 5) {
      return createErrorResponse(
        'PROFILE_LIMIT_EXCEEDED',
        'Maximum of 5 profiles per account',
        409
      );
    }

    // Create new profile document
    // Set default notification preferences if not provided
    const preferences: ProfilePreferences = {
      ...profileData.preferences,
      notifications: profileData.preferences.notifications || {
        enabled: true,
        newReleases: true,
        watchlistUpdates: true,
        recommendedContent: true,
        episodeReminders: true,
      },
    };

    const now = new Date();
    const newProfile: Profile = {
      userId,
      name: profileData.name,
      avatarUrl: profileData.avatarUrl,
      isKids: profileData.isKids,
      maturityRating: profileData.maturityRating,
      pinEnabled: profileData.pinEnabled,
      pinHash: profileData.pinHash,
      language: profileData.language,
      preferences,
      createdAt: now,
      updatedAt: now,
    };

    // Insert into MongoDB
    const result = await profilesCollection.insertOne(newProfile);

    // Return created profile (without pinHash)
    const { pinHash, ...sanitizedProfile } = newProfile;
    const responseProfile = {
      ...sanitizedProfile,
      _id: result.insertedId.toString(),
    };

    return createSuccessResponse(responseProfile, 201);
  } catch (error) {
    console.error('Error creating profile:', error);
    return createErrorResponse(
      'INTERNAL_ERROR',
      'Failed to create profile',
      500
    );
  }
}
