# Profile API Routes

This directory contains all API routes for profile management in the Netflix-style streaming platform.

## Overview

The Profile API provides endpoints for creating, reading, updating, and deleting user profiles. Each user account can have up to 5 profiles, each with separate viewing history, preferences, and optional PIN protection.

## Authentication

All Profile API routes require authentication via Auth0 or Clerk. The `validateApiAuth()` middleware extracts the `userId` from the authentication token and validates it before processing requests.

## Routes

### List Profiles

**GET /api/profiles**

Lists all profiles for the authenticated user.

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "auth0|123456",
    "name": "John",
    "avatarUrl": "https://example.com/avatar1.png",
    "isKids": false,
    "maturityRating": "R",
    "pinEnabled": false,
    "language": "en",
    "preferences": {
      "autoplayNextEpisode": true,
      "autoplayPreviews": true,
      "dataSaverMode": false,
      "subtitleLanguage": "en",
      "audioLanguage": "en",
      "selectedGenres": [28, 12, 16]
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Create Profile

**POST /api/profiles**

Creates a new profile for the authenticated user.

**Request Body:**
```json
{
  "name": "Jane",
  "avatarUrl": "https://example.com/avatar2.png",
  "isKids": true,
  "maturityRating": "PG",
  "pinEnabled": false,
  "language": "en",
  "preferences": {
    "autoplayNextEpisode": true,
    "autoplayPreviews": false,
    "dataSaverMode": false,
    "subtitleLanguage": "en",
    "audioLanguage": "en",
    "selectedGenres": [16, 10751]
  }
}
```

**Response:** (201 Created)
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "auth0|123456",
  "name": "Jane",
  ...
}
```

**Errors:**
- `409 PROFILE_LIMIT_EXCEEDED` - User already has 5 profiles
- `400 VALIDATION_ERROR` - Invalid request body

### Get Single Profile

**GET /api/profiles/:id**

Retrieves a single profile by ID.

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "auth0|123456",
  "name": "John",
  ...
}
```

**Errors:**
- `400 INVALID_ID` - Invalid profile ID format
- `404 NOT_FOUND` - Profile not found
- `403 FORBIDDEN` - Profile belongs to another user

### Update Profile

**PATCH /api/profiles/:id**

Updates an existing profile. All fields are optional.

**Request Body:**
```json
{
  "name": "Johnny",
  "preferences": {
    "autoplayNextEpisode": false
  }
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "auth0|123456",
  "name": "Johnny",
  ...
}
```

**Errors:**
- `400 INVALID_ID` - Invalid profile ID format
- `400 VALIDATION_ERROR` - Invalid request body
- `404 NOT_FOUND` - Profile not found
- `403 FORBIDDEN` - Profile belongs to another user

### Delete Profile

**DELETE /api/profiles/:id**

Deletes a profile permanently.

**Response:** 204 No Content

**Errors:**
- `400 INVALID_ID` - Invalid profile ID format
- `404 NOT_FOUND` - Profile not found
- `403 FORBIDDEN` - Profile belongs to another user

### Verify PIN

**POST /api/profiles/:id/verify-pin**

Verifies a profile's PIN for PIN-protected profiles.

**Request Body:**
```json
{
  "pin": "1234"
}
```

**Response:**
```json
{
  "valid": true
}
```

**Errors:**
- `400 INVALID_ID` - Invalid profile ID format
- `400 VALIDATION_ERROR` - Invalid PIN format (must be 4 digits)
- `400 PIN_NOT_ENABLED` - Profile doesn't have PIN protection enabled
- `404 NOT_FOUND` - Profile not found
- `403 FORBIDDEN` - Profile belongs to another user

## Data Model

### Profile

```typescript
interface Profile {
  _id?: string
  userId: string // from Auth0/Clerk
  name: string // 1-50 characters
  avatarUrl: string
  isKids: boolean
  maturityRating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17'
  pinEnabled: boolean
  pinHash?: string // bcrypt hashed PIN
  language: string
  preferences: ProfilePreferences
  createdAt: Date
  updatedAt: Date
}

interface ProfilePreferences {
  autoplayNextEpisode: boolean
  autoplayPreviews: boolean
  dataSaverMode: boolean
  subtitleLanguage: string
  audioLanguage: string
  selectedGenres: number[] // TMDB genre IDs
}
```

## Security

- **Authentication**: All routes require valid Auth0/Clerk token
- **Authorization**: Users can only access their own profiles
- **PIN Protection**: PINs are hashed using bcrypt before storage
- **Sensitive Data**: `pinHash` is never returned in API responses

## Validation

- Profile names must be 1-50 characters
- Maximum 5 profiles per user account
- Avatar URLs must be valid URLs
- Maturity ratings must be one of: G, PG, PG-13, R, NC-17
- PINs must be exactly 4 digits

## Requirements Implemented

- **Requirement 2.1**: Profile limit enforcement (5 profiles max)
- **Requirement 2.2**: List profiles for user
- **Requirement 2.4**: Create, update, delete profiles
- **Requirement 2.5**: Profile name validation
- **Requirement 2.6**: Avatar selection
- **Requirement 2.7**: Maturity rating and language settings
- **Requirement 2.8**: PIN verification
- **Requirement 2.10**: Profile data isolation
- **Requirement 31.8**: Authentication middleware

## Related Files

- `/lib/db/types.ts` - TypeScript type definitions
- `/lib/auth.ts` - Authentication utilities
- `/lib/db/mongodb.ts` - MongoDB connection
