# Design Document: Netflix-Style Streaming Platform

## Overview

This design document specifies the technical architecture for a Netflix-style streaming platform consisting of three completely isolated applications: a Next.js web application with App Router and shadcn/ui, an Android mobile application, and an Android TV application. The Next.js application contains both the frontend and backend (via API routes), serving as the full-stack backend consumed by all three applications. Each application is a self-contained project that shares only the Next.js backend API, Auth0/Clerk authentication provider, MongoDB database, and TMDB API v3 as external services.

The platform provides a premium streaming experience with authentication via Auth0 (primary) or Clerk (alternative), multi-profile support, content discovery, search, watchlist management, and a full-featured video player. All content metadata comes from TMDB API v3, emails are sent via Resend, and video playback is handled by embedding VidKing iframes with custom-built player controls.

### Key Design Principles

1. **Application Isolation**: The three applications share no code, components, or utilities. Each implements the same design language independently using platform-appropriate technologies.

2. **Unified Backend**: Next.js API routes serve as the full-stack backend for all three applications, handling business logic, MongoDB operations, TMDB API calls, and Resend email integration.

3. **Managed Authentication**: Auth0 (primary) or Clerk (alternative) handles all authentication flows including registration, login, password reset, social auth, and session management. No custom JWT or OAuth implementation.

4. **Real Data Only**: All content comes from TMDB API v3. No mock or hardcoded data exists anywhere in the system.

5. **Premium Experience**: Every animation, transition, hover state, and loading state must feel indistinguishable from Netflix in terms of polish and smoothness.

6. **Performance First**: Images are lazy-loaded with optimized delivery via wsrv.nl, infinite scroll prevents hard limits, and aggressive caching ensures smooth browsing.

7. **Accessibility**: Full keyboard navigation, ARIA labels, logical focus management on web; content descriptions and focus ring visibility on TV.

## Architecture

### System Architecture

```
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│   Auth0 / Clerk      │  │    TMDB API v3       │  │      Resend          │
│   (Authentication)   │  │  (Content Metadata)  │  │   (Email Service)    │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
          │                          │                          │
          │ Token Validation         │ HTTPS                    │ HTTPS
          │                          │                          │
          └──────────────────────────┼──────────────────────────┘
                                     │
                                     ▼
          ┌─────────────────────────────────────────────────────────┐
          │              Next.js Web Application                    │
          │                                                         │
          │  ┌─────────────────────────────────────────────────┐  │
          │  │           Frontend (App Router)                 │  │
          │  │  - shadcn/ui components (Netflix-styled)        │  │
          │  │  - Tailwind CSS                                 │  │
          │  │  - React Query for data fetching                │  │
          │  └─────────────────────────────────────────────────┘  │
          │                                                         │
          │  ┌─────────────────────────────────────────────────┐  │
          │  │         Backend (API Routes: app/api/*)         │  │
          │  │  - Profile API                                  │  │
          │  │  - Content API (TMDB proxy)                     │  │
          │  │  - User Data API (watchlist, progress, etc.)    │  │
          │  │  - Email API (Resend integration)               │  │
          │  │  - Auth0/Clerk token validation middleware      │  │
          │  └─────────────────────────────────────────────────┘  │
          │                                                         │
          │  ┌─────────────────────────────────────────────────┐  │
          │  │              MongoDB Database                   │  │
          │  │  - Profiles & Preferences                       │  │
          │  │  - Watch History & Progress                     │  │
          │  │  - Watchlists & Ratings                         │  │
          │  │  - Recent Searches                              │  │
          │  └─────────────────────────────────────────────────┘  │
          └─────────────────────────────────────────────────────────┘
                                     │
                                     │ REST API (HTTP)
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
          ┌──────────────────┐            ┌──────────────────┐
          │   Mobile App     │            │     TV App       │
          │ (React Native)   │            │    (Kotlin)      │
          │                  │            │                  │
          │ - Auth0/Clerk    │            │ - Auth0/Clerk    │
          │   SDK            │            │   SDK            │
          │ - HTTP client    │            │ - Retrofit       │
          │   to Next.js API │            │   to Next.js API │
          └──────────────────┘            └──────────────────┘
                    │                                 │
                    └────────────────┬────────────────┘
                                     │
                                     │ iframe/WebView embed
                                     ▼
                          ┌──────────────────────┐
                          │      VidKing         │
                          │   (Video Stream)     │
                          │ https://vidking.net  │
                          └──────────────────────┘
```

### Technology Stack

**Web Application (Next.js Full-Stack)**
- Framework: Next.js 14+ with App Router
- Language: TypeScript (strict mode)
- UI Components: shadcn/ui (customized to match Netflix design exactly)
- Styling: Tailwind CSS
- State Management: React Context + Zustand for global state
- Data Fetching: React Query (TanStack Query) for server state
- Authentication: Auth0 SDK (primary) or Clerk SDK (alternative)
- Backend: Next.js API routes (app/api/*)
- Database Client: MongoDB Node.js driver
- Email Service: Resend SDK
- Image Optimization: Next.js Image component + wsrv.nl
- Video Player: Custom player shell wrapping VidKing iframe

**Mobile Application (React Native)**
- Framework: React Native
- Language: TypeScript (strict mode)
- Navigation: React Navigation
- State Management: Zustand
- Data Fetching: React Query (TanStack Query)
- Authentication: Auth0 React Native SDK or Clerk Expo SDK
- HTTP Client: Axios (to Next.js API)
- Image Caching: React Native Fast Image
- Video Player: Custom player shell wrapping VidKing WebView

**TV Application (Android TV)**
- Language: Kotlin
- UI Framework: Jetpack Compose for TV
- Architecture: MVVM with StateFlow
- Navigation: Compose Navigation
- Authentication: Auth0 Android SDK or custom Clerk integration
- HTTP Client: Retrofit + OkHttp (to Next.js API)
- Image Loading: Coil
- Video Player: Custom player shell wrapping VidKing WebView

**Backend (Next.js API Routes)**
- Runtime: Node.js
- Database: MongoDB Atlas
- Collections: profiles, watchHistory, watchlists, ratings, recentSearches
- Indexes: userId (from Auth0/Clerk), profileId, contentId, timestamp
- Authentication: Auth0 token validation middleware or Clerk backend SDK
- External APIs: TMDB API v3, Resend API

**External Services**
- Auth0 (primary) or Clerk (alternative): Authentication, authorization, user management, session management
- TMDB API v3: Content metadata, images, trailers
- Resend: Transactional emails (welcome, invitations, security notifications)
- VidKing (https://www.vidking.net/): Video streaming via iframe
- wsrv.nl: Image optimization and resizing proxy

## Components and Interfaces

### Web Application Components

**Authentication Components**
- `AuthProvider`: Auth0 or Clerk provider wrapper for the application
- `SignInButton`: Triggers Auth0/Clerk sign-in flow
- `SignUpButton`: Triggers Auth0/Clerk sign-up flow
- `UserButton`: Auth0/Clerk user menu component
- `AuthGuard`: Route protection wrapper that checks Auth0/Clerk session
- `PasswordResetTrigger`: Triggers Auth0/Clerk password reset flow

**Profile Components**
- `ProfilePicker`: Full-screen profile selection grid
- `ProfileAvatar`: Circular avatar with name
- `ProfileManager`: Create, edit, delete profiles
- `PinEntry`: PIN protection for profiles

**Content Discovery Components**
- `HeroBanner`: Auto-rotating featured content with backdrop, logo, synopsis, and action buttons (built with shadcn/ui Card, Button)
- `ContentRow`: Horizontally scrollable row of content cards with lazy loading (custom component with shadcn/ui ScrollArea)
- `ContentCard`: Poster image with hover expansion showing metadata and actions (shadcn/ui Card with custom Netflix-style animations)
- `Top10Card`: Special card design with rank number overlay (custom shadcn/ui Card variant)
- `ContinueWatchingCard`: Backdrop with progress bar (shadcn/ui Card with Progress component)
- `ShimmerSkeleton`: Animated loading placeholder (shadcn/ui Skeleton)

**Navigation Components**
- `TopNav`: Transparent-to-solid navigation bar with logo, browse dropdown, search, notifications, profile menu (shadcn/ui NavigationMenu)
- `BrowseDropdown`: Hover-activated menu with navigation links (shadcn/ui DropdownMenu)
- `SearchBar`: Expandable search input with debounced results (shadcn/ui Input with Command)
- `NotificationDropdown`: Recently added content and recommendations (shadcn/ui DropdownMenu with custom content)

**Detail View Components**
- `DetailModal`: Slide-up modal with backdrop, trailer, metadata, and actions (shadcn/ui Dialog with custom styling)
- `SeasonSelector`: Dropdown for TV show season selection (shadcn/ui Select)
- `EpisodeList`: Vertical list of episode cards with progress indicators (custom component with shadcn/ui Card)
- `CastCarousel`: Horizontally scrollable cast member cards (shadcn/ui ScrollArea with custom cards)
- `MoreLikeThis`: Grid of similar content recommendations (custom grid with shadcn/ui Card)
- `RatingWidget`: Star rating input (1-5 stars) (custom component or shadcn/ui Rating if available)

**Player Components**
- `VideoPlayer`: Full-screen player shell wrapping VidKing iframe
- `PlayerOverlay`: Controls that fade in/out based on user activity
- `ProgressBar`: Scrubber with elapsed/total time
- `PlayerControls`: Play/pause, seek, volume, fullscreen buttons
- `SkipIntroButton`: Timed button for skipping intros
- `NextEpisodeCard`: Auto-advance card with countdown timer
- `SubtitleSelector`: Subtitle and audio track selection
- `QualitySelector`: Video quality selection

**Browse Components**
- `GenreGrid`: Infinite scroll grid of content cards (custom grid with shadcn/ui Card)
- `FilterBar`: Genre, year, rating filter chips (shadcn/ui Badge or custom chips)
- `EmptyState`: Illustration and message for no results (custom component with shadcn/ui typography)

**Settings Components**
- `AccountSettings`: Email, password, subscription management (shadcn/ui Form, Input, Button)
- `PlaybackSettings`: Autoplay, data saver toggles (shadcn/ui Switch)
- `LanguageSettings`: Language and subtitle preferences (shadcn/ui Select)
- `ViewingActivity`: Watch history log with removal option (shadcn/ui Table with custom actions)

**Landing Page Components**
- `LandingHero`: Full-viewport hero with animated background collage (custom component with shadcn/ui Button, Input)
- `FeatureSection`: Alternating text and visual content sections (custom layout with shadcn/ui typography)
- `FAQAccordion`: Expandable question/answer list (shadcn/ui Accordion)
- `LandingFooter`: Link columns and legal information (custom footer with shadcn/ui typography)

**Onboarding Components**
- `OnboardingSlider`: Three-screen informational carousel
- `GenrePicker`: Grid of genre tiles for preference selection

### Mobile Application Components

Mobile components mirror web functionality but are adapted for touch interaction:

- Bottom tab navigation instead of top nav
- Swipe gestures for row scrolling
- Tap states with haptic feedback
- Full-screen detail views instead of modals
- Download management UI
- Voice search integration

### TV Application Components

TV components are optimized for D-pad navigation and ten-foot viewing:

- Left sidebar navigation with icon/label expansion
- Visible focus rings (2px red border) on all focusable elements
- Simplified layouts with larger touch targets
- No hover states (focus states only)
- D-pad navigation between rows and cards
- Back button handling for navigation stack

### API Interfaces

**Next.js API Routes Structure**

All backend logic is implemented as Next.js API routes under `app/api/`:

```
app/api/
├── profiles/
│   ├── route.ts              # GET /api/profiles (list), POST /api/profiles (create)
│   ├── [id]/
│   │   ├── route.ts          # GET, PATCH, DELETE /api/profiles/:id
│   │   └── verify-pin/
│   │       └── route.ts      # POST /api/profiles/:id/verify-pin
├── content/
│   ├── trending/route.ts     # GET /api/content/trending
│   ├── popular/route.ts      # GET /api/content/popular
│   ├── top-rated/route.ts    # GET /api/content/top-rated
│   ├── new-releases/route.ts # GET /api/content/new-releases
│   ├── genres/route.ts       # GET /api/content/genres
│   ├── [id]/
│   │   ├── route.ts          # GET /api/content/:id
│   │   ├── recommendations/route.ts
│   │   ├── similar/route.ts
│   │   └── season/[seasonNumber]/route.ts
│   └── search/route.ts       # GET /api/content/search
├── watchlist/
│   ├── route.ts              # GET /api/watchlist, POST /api/watchlist
│   └── [contentId]/route.ts  # DELETE /api/watchlist/:contentId
├── watch-progress/
│   ├── route.ts              # GET /api/watch-progress, POST /api/watch-progress
│   └── [contentId]/route.ts  # DELETE /api/watch-progress/:contentId
├── ratings/
│   ├── route.ts              # GET /api/ratings, POST /api/ratings
│   └── [contentId]/route.ts  # GET, PUT /api/ratings/:contentId
├── history/
│   ├── route.ts              # GET /api/history
│   └── [id]/route.ts         # DELETE /api/history/:id
├── searches/
│   ├── route.ts              # GET /api/searches, POST /api/searches
│   └── [query]/route.ts      # DELETE /api/searches/:query
└── email/
    ├── welcome/route.ts      # POST /api/email/welcome
    ├── invitation/route.ts   # POST /api/email/invitation
    └── security/route.ts     # POST /api/email/security
```

**Authentication Middleware**

All protected API routes use Auth0 or Clerk token validation:

```typescript
// lib/auth-middleware.ts
import { auth } from '@clerk/nextjs' // or Auth0 equivalent

export async function requireAuth(request: Request) {
  const { userId } = auth() // Clerk example
  // or const session = await getSession(request) // Auth0 example
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  return userId
}
```

**Profile API**

```typescript
// app/api/profiles/route.ts
interface ProfileAPI {
  // GET /api/profiles?userId={userId}
  getProfiles(userId: string): Promise<Profile[]>
  
  // POST /api/profiles
  createProfile(data: CreateProfileData): Promise<Profile>
}

// app/api/profiles/[id]/route.ts
interface ProfileDetailAPI {
  // GET /api/profiles/:id
  getProfile(id: string): Promise<Profile>
  
  // PATCH /api/profiles/:id
  updateProfile(id: string, data: UpdateProfileData): Promise<Profile>
  
  // DELETE /api/profiles/:id
  deleteProfile(id: string): Promise<void>
}

// app/api/profiles/[id]/verify-pin/route.ts
interface ProfilePinAPI {
  // POST /api/profiles/:id/verify-pin
  verifyPin(id: string, pin: string): Promise<{ valid: boolean }>
}

interface Profile {
  id: string
  userId: string // from Auth0/Clerk
  name: string
  avatarUrl: string
  isKids: boolean
  maturityRating: string
  pinEnabled: boolean
  language: string
  preferences: ProfilePreferences
  createdAt: Date
}
```

**Content API (TMDB Proxy)**

```typescript
// app/api/content/*/route.ts
interface ContentAPI {
  // GET /api/content/trending?timeWindow=day|week
  getTrending(timeWindow: 'day' | 'week'): Promise<Content[]>
  
  // GET /api/content/popular?type=movie|tv
  getPopular(type: 'movie' | 'tv'): Promise<Content[]>
  
  // GET /api/content/top-rated?type=movie|tv
  getTopRated(type: 'movie' | 'tv'): Promise<Content[]>
  
  // GET /api/content/new-releases
  getNewReleases(): Promise<Content[]>
  
  // GET /api/content/genres?type=movie|tv
  getGenres(type: 'movie' | 'tv'): Promise<Genre[]>
  
  // GET /api/content/:id?type=movie|tv
  getDetails(contentId: number, type: 'movie' | 'tv'): Promise<ContentDetails>
  
  // GET /api/content/:id/season/:seasonNumber
  getSeasonDetails(tvId: number, seasonNumber: number): Promise<Season>
  
  // GET /api/content/:id/recommendations?type=movie|tv
  getRecommendations(contentId: number, type: 'movie' | 'tv'): Promise<Content[]>
  
  // GET /api/content/:id/similar?type=movie|tv
  getSimilar(contentId: number, type: 'movie' | 'tv'): Promise<Content[]>
  
  // GET /api/content/search?query=...&filters=...
  search(query: string, filters?: SearchFilters): Promise<SearchResults>
}
```

**User Data API**

```typescript
// app/api/watchlist/route.ts
interface WatchlistAPI {
  // GET /api/watchlist?profileId={profileId}
  getWatchlist(profileId: string): Promise<WatchlistItem[]>
  
  // POST /api/watchlist
  addToWatchlist(profileId: string, contentId: number, type: string): Promise<void>
  
  // DELETE /api/watchlist/:contentId?profileId={profileId}
  removeFromWatchlist(profileId: string, contentId: number): Promise<void>
}

// app/api/watch-progress/route.ts
interface WatchProgressAPI {
  // GET /api/watch-progress?profileId={profileId}
  getContinueWatching(profileId: string): Promise<ContinueWatchingItem[]>
  
  // POST /api/watch-progress
  updateWatchProgress(profileId: string, contentId: number, progress: WatchProgress): Promise<void>
  
  // DELETE /api/watch-progress/:contentId?profileId={profileId}
  removeFromContinueWatching(profileId: string, contentId: number): Promise<void>
}

// app/api/ratings/route.ts
interface RatingsAPI {
  // GET /api/ratings/:contentId?profileId={profileId}
  getRating(profileId: string, contentId: number): Promise<number | null>
  
  // PUT /api/ratings/:contentId
  setRating(profileId: string, contentId: number, rating: number): Promise<void>
}

// app/api/history/route.ts
interface HistoryAPI {
  // GET /api/history?profileId={profileId}
  getViewingHistory(profileId: string): Promise<HistoryItem[]>
  
  // DELETE /api/history/:id
  removeFromHistory(profileId: string, historyItemId: string): Promise<void>
}

// app/api/searches/route.ts
interface SearchesAPI {
  // GET /api/searches?profileId={profileId}
  getRecentSearches(profileId: string): Promise<string[]>
  
  // POST /api/searches
  addRecentSearch(profileId: string, query: string): Promise<void>
  
  // DELETE /api/searches/:query?profileId={profileId}
  removeRecentSearch(profileId: string, query: string): Promise<void>
}
```

**Email API (Resend Integration)**

```typescript
// app/api/email/*/route.ts
interface EmailAPI {
  // POST /api/email/welcome
  sendWelcomeEmail(userId: string, email: string, name: string): Promise<void>
  
  // POST /api/email/invitation
  sendInvitationEmail(email: string, inviterName: string): Promise<void>
  
  // POST /api/email/security
  sendSecurityNotification(userId: string, email: string, event: string): Promise<void>
}
```

**TMDB Integration Layer (Server-Side)**

```typescript
// lib/tmdb-service.ts
interface TMDBService {
  // Raw TMDB API calls (server-side only)
  fetchTrending(timeWindow: string): Promise<TMDBResponse>
  fetchMovieDetails(movieId: number): Promise<TMDBMovieDetails>
  fetchTVDetails(tvId: number): Promise<TMDBTVDetails>
  fetchSearch(query: string, filters?: SearchFilters): Promise<TMDBSearchResponse>
  
  // Image URL transformation
  getOptimizedImageUrl(tmdbPath: string, width: number): string
  
  // Data transformation
  parseTMDBMovie(raw: TMDBMovieDetails): ContentDetails
  parseTMDBTV(raw: TMDBTVDetails): ContentDetails
  parseTMDBPerson(raw: TMDBPerson): Person
}
```

**Resend Integration Layer (Server-Side)**

```typescript
// lib/resend-service.ts
import { Resend } from 'resend'

interface ResendService {
  sendEmail(params: {
    to: string
    subject: string
    html: string
    from?: string
  }): Promise<{ id: string }>
  
  sendWelcomeEmail(email: string, name: string): Promise<void>
  sendInvitationEmail(email: string, inviterName: string): Promise<void>
  sendSecurityNotification(email: string, event: string): Promise<void>
}
```

## Data Models

### MongoDB Collections

The MongoDB database stores only user-generated data. Authentication and user management are handled by Auth0/Clerk.

**Collections:**
- `profiles`: User profiles with preferences
- `watchHistory`: Watch progress tracking
- `watchlists`: User-curated content lists
- `ratings`: User ratings for content
- `recentSearches`: Search history per profile

### Profile and Preferences

```typescript
interface Profile {
  id: string
  userId: string // from Auth0/Clerk (sub claim)
  name: string
  avatarUrl: string
  isKids: boolean
  maturityRating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17'
  pinEnabled: boolean
  pinHash?: string // hashed PIN for profile lock
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

### Content Models

```typescript
interface Content {
  id: number
  type: 'movie' | 'tv'
  title: string
  posterPath: string
  backdropPath: string
  overview: string
  releaseDate: string
  voteAverage: number
  genreIds: number[]
}

interface ContentDetails extends Content {
  runtime?: number // for movies
  numberOfSeasons?: number // for TV shows
  numberOfEpisodes?: number // for TV shows
  status: string
  tagline: string
  genres: Genre[]
  cast: CastMember[]
  crew: CrewMember[]
  videos: Video[]
  recommendations: Content[]
  similar: Content[]
  seasons?: Season[] // for TV shows
}

interface Season {
  seasonNumber: number
  name: string
  overview: string
  posterPath: string
  airDate: string
  episodes: Episode[]
}

interface Episode {
  episodeNumber: number
  seasonNumber: number
  name: string
  overview: string
  stillPath: string
  airDate: string
  runtime: number
  voteAverage: number
}

interface Genre {
  id: number
  name: string
}

interface CastMember {
  id: number
  name: string
  character: string
  profilePath: string
  order: number
}

interface Video {
  id: string
  key: string
  name: string
  site: string
  type: 'Trailer' | 'Teaser' | 'Clip' | 'Featurette'
  official: boolean
}
```

### User Data Models

```typescript
interface WatchlistItem {
  id: string
  profileId: string
  contentId: number
  contentType: 'movie' | 'tv'
  addedAt: Date
}

interface WatchProgress {
  id: string
  profileId: string
  contentId: number
  contentType: 'movie' | 'tv'
  episodeId?: string // for TV shows
  seasonNumber?: number
  episodeNumber?: number
  currentTime: number // seconds
  duration: number // seconds
  percentageWatched: number
  lastWatchedAt: Date
}

interface Rating {
  id: string
  profileId: string
  contentId: number
  contentType: 'movie' | 'tv'
  rating: number // 1-5
  createdAt: Date
}

interface HistoryItem {
  id: string
  profileId: string
  contentId: number
  contentType: 'movie' | 'tv'
  watchedAt: Date
}
```

### Search Models

```typescript
interface SearchFilters {
  type?: 'movie' | 'tv' | 'person'
  genres?: number[]
  yearRange?: { min: number; max: number }
  minRating?: number
}

interface SearchResults {
  movies: Content[]
  tvShows: Content[]
  people: Person[]
  totalResults: number
}

interface Person {
  id: number
  name: string
  profilePath: string
  knownFor: Content[]
}
```

### Player Models

```typescript
interface PlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isFullscreen: boolean
  showControls: boolean
  selectedSubtitle?: string
  selectedAudioTrack?: string
  selectedQuality?: string
}

interface IntroMarker {
  start: number // seconds
  end: number // seconds
}

interface RecapMarker {
  start: number // seconds
  end: number // seconds
}

interface NextEpisode {
  id: number
  seasonNumber: number
  episodeNumber: number
  title: string
  stillPath: string
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Protected Endpoint Token Validation

*For any* Next.js API endpoint marked as protected, requests with invalid or missing Auth0/Clerk tokens should be rejected with a 401 Unauthorized response, and requests with valid tokens should be processed successfully.

**Validates: Requirements 1.9**

### Property 2: Profile Limit Enforcement

*For any* user account, creating profiles up to the limit of 5 should succeed, and attempting to create a 6th profile should fail with an appropriate error message.

**Validates: Requirements 2.1**

### Property 3: Profile Data Isolation

*For any* two distinct profiles belonging to the same or different user accounts, data written to one profile (watchlist, watch history, ratings, preferences) should never appear in queries for the other profile's data.

**Validates: Requirements 2.10**

### Property 4: Watchlist Operations Round-Trip

*For any* profile and content item, adding the item to the watchlist then retrieving the watchlist should contain that item, and subsequently removing the item then retrieving the watchlist should not contain that item.

**Validates: Requirements 9.4, 9.5**

### Property 5: User Data Persistence

*For any* profile and user-generated data (watch progress, genre preferences, ratings), writing the data then retrieving it should return the same data that was written.

**Validates: Requirements 10.6, 14.10**

### Property 6: TMDB Parsing Error Handling

*For any* invalid or malformed TMDB API response, the parsing function should return a descriptive error rather than throwing an unhandled exception or returning corrupted data.

**Validates: Requirements 30.2**

### Property 7: TMDB Image URL Transformation

*For any* valid TMDB image path, the transformation function should produce a wsrv.nl URL with the correct format including the TMDB CDN base URL and the specified width parameter.

**Validates: Requirements 30.3**

### Property 8: TMDB Parsing Round-Trip

*For any* valid TMDB API response (movie, TV show, or person), parsing the response into the application data structure, then serializing it back to TMDB format, then parsing again should produce an equivalent data structure to the first parse.

**Validates: Requirements 30.1, 30.4**

## Error Handling

### API Error Responses

All Next.js API routes follow a consistent error response format:

```typescript
interface APIError {
  error: string          // Error type (e.g., "UNAUTHORIZED", "NOT_FOUND", "VALIDATION_ERROR")
  message: string        // Human-readable error message
  details?: any          // Optional additional error details
  timestamp: string      // ISO 8601 timestamp
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation errors, malformed input)
- 401: Unauthorized (missing or invalid Auth0/Clerk token)
- 403: Forbidden (valid token but insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (e.g., profile limit exceeded, duplicate entry)
- 429: Too Many Requests (rate limiting)
- 500: Internal Server Error (unexpected server errors)
- 502: Bad Gateway (external API failures - TMDB, Resend)
- 503: Service Unavailable (database connection issues)

### Error Handling Strategies

**Authentication Errors:**
- Invalid or expired Auth0/Clerk tokens return 401 with instructions to re-authenticate
- Missing tokens on protected endpoints return 401 with clear error message
- Frontend redirects to Auth0/Clerk login on 401 responses

**Database Errors:**
- MongoDB connection failures trigger retry logic (3 attempts with exponential backoff)
- Query timeouts return 503 with retry-after header
- Duplicate key errors return 409 with specific conflict details
- All database operations wrapped in try-catch with proper error logging

**External API Errors:**
- TMDB API failures return 502 with cached data if available
- TMDB rate limiting triggers exponential backoff
- Resend email failures log error and queue for retry (up to 3 attempts)
- Network timeouts for external APIs set to 10 seconds

**Validation Errors:**
- Input validation uses Zod schemas on all API routes
- Validation failures return 400 with detailed field-level errors
- Profile creation validates: name length (1-50 chars), avatar URL format, maturity rating enum
- Content operations validate: contentId is positive integer, type is 'movie' or 'tv'

**Client-Side Error Handling:**
- React Query error boundaries catch and display API errors
- Toast notifications for transient errors (network issues, rate limiting)
- Error pages for fatal errors (404, 500)
- Retry buttons on failed data fetches
- Offline detection with appropriate messaging

### Logging and Monitoring

**Server-Side Logging:**
- All API errors logged with request ID, user ID, endpoint, error type, stack trace
- TMDB API calls logged with response time and cache hit/miss
- Email sending attempts logged with Resend message ID
- MongoDB queries logged with execution time for slow query detection

**Client-Side Error Tracking:**
- Unhandled exceptions captured and reported
- API error responses tracked with frequency metrics
- User actions leading to errors logged for debugging

## Testing Strategy

### Dual Testing Approach

The platform uses both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests:**
- Specific examples demonstrating correct behavior
- Edge cases (empty inputs, boundary values, special characters)
- Error conditions (invalid tokens, malformed data, network failures)
- Integration points between components
- UI component rendering and interactions

**Property-Based Tests:**
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Minimum 100 iterations per property test
- Each property test references its design document property

### Property-Based Testing Configuration

**Library Selection:**
- Web/Mobile (TypeScript): fast-check
- TV (Kotlin): Kotest Property Testing

**Test Structure:**
```typescript
// Example: Property 4 - Watchlist Operations Round-Trip
import fc from 'fast-check'

describe('Feature: netflix-streaming-platform, Property 4: Watchlist Operations Round-Trip', () => {
  it('adding then retrieving should contain item, removing then retrieving should not', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }), // profileId
        fc.integer({ min: 1 }), // contentId
        fc.constantFrom('movie', 'tv'), // contentType
        async (profileId, contentId, contentType) => {
          // Add to watchlist
          await addToWatchlist(profileId, contentId, contentType)
          
          // Retrieve and verify present
          const watchlistAfterAdd = await getWatchlist(profileId)
          expect(watchlistAfterAdd.some(item => 
            item.contentId === contentId && item.contentType === contentType
          )).toBe(true)
          
          // Remove from watchlist
          await removeFromWatchlist(profileId, contentId)
          
          // Retrieve and verify absent
          const watchlistAfterRemove = await getWatchlist(profileId)
          expect(watchlistAfterRemove.some(item => 
            item.contentId === contentId
          )).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Test Coverage Requirements

**Backend API Routes:**
- 100% coverage of all API route handlers
- All error paths tested (validation, auth, database, external APIs)
- Property tests for data persistence and round-trip operations
- Unit tests for specific edge cases

**TMDB Integration:**
- Property test for parsing round-trip (Property 8)
- Property test for image URL transformation (Property 7)
- Unit tests for error handling with malformed responses
- Unit tests for each content type (movie, TV, person)

**Profile Management:**
- Property test for profile limit enforcement (Property 2)
- Property test for data isolation (Property 3)
- Unit tests for PIN verification
- Unit tests for profile CRUD operations

**Watchlist and User Data:**
- Property test for watchlist round-trip (Property 4)
- Property test for data persistence (Property 5)
- Unit tests for concurrent updates
- Unit tests for data migration scenarios

**Authentication:**
- Property test for token validation (Property 1)
- Unit tests for Auth0/Clerk SDK integration
- Unit tests for session handling
- Unit tests for unauthorized access attempts

**Frontend Components:**
- Unit tests for shadcn/ui component customizations
- Integration tests for user flows (sign-in, profile selection, content browsing)
- Visual regression tests for Netflix-style animations
- Accessibility tests (ARIA labels, keyboard navigation)

### Testing Tools

**Backend:**
- Jest: Test runner and assertion library
- fast-check: Property-based testing
- Supertest: HTTP API testing
- MongoDB Memory Server: In-memory database for tests
- MSW (Mock Service Worker): TMDB API mocking

**Frontend:**
- Jest: Test runner
- React Testing Library: Component testing
- fast-check: Property-based testing
- Playwright: End-to-end testing
- Storybook: Component development and visual testing

**Mobile:**
- Jest: Test runner
- React Native Testing Library: Component testing
- Detox: End-to-end testing

**TV:**
- JUnit: Test runner
- Kotest: Property-based testing
- Espresso: UI testing

### Continuous Integration

All tests run on every pull request:
1. Linting and type checking (TypeScript strict mode, Kotlin compiler)
2. Unit tests with coverage reporting (minimum 80% coverage)
3. Property-based tests (100 iterations per property)
4. Integration tests
5. End-to-end tests on staging environment

