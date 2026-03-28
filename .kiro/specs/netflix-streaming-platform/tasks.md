# Implementation Plan: Netflix-Style Streaming Platform

## Overview

This implementation plan breaks down the Netflix-style streaming platform into discrete coding tasks following the build order specified in the master prompt: Web Application first (landing through player), then Mobile Application, then Android TV Application. Each application is built as a completely isolated project with no shared code. The Next.js web application contains both frontend and backend (API routes), serving as the full-stack backend consumed by all three applications.

The implementation uses TypeScript for web and mobile applications, Kotlin for the TV application, and follows the incremental build order within each application: authentication and profiles, home screen with hero and rows, card components, detail view, player shell, search, browse pages, watchlist and continue watching, settings and account pages, and onboarding flow.

All tasks reference specific requirements from the requirements document and implement the design specified in the design document. Tasks marked with `*` are optional and can be skipped for faster MVP delivery.

## Tasks


### Phase 1: Web Application - Project Setup and Configuration

- [x] 1. Initialize Next.js project with TypeScript and configure base dependencies
  - Create Next.js 14+ project with App Router and TypeScript strict mode
  - Install and configure shadcn/ui with Tailwind CSS
  - Set up dark theme configuration matching Netflix colors (#141414, #181818, #232323, #2F2F2F)
  - Configure custom brand color (default #E50914) and Netflix Sans font with Inter fallback
  - Create environment variables file for TMDB API key, MongoDB URI, Auth0/Clerk credentials, and Resend API key
  - _Requirements: 28.1, 28.2, 28.3, 28.5, 28.6, 28.7, 31.1, 32.1, 32.3_

- [x] 2. Set up MongoDB connection and database schema
  - Create MongoDB connection utility with connection pooling
  - Define TypeScript interfaces for all MongoDB collections (profiles, watchHistory, watchlists, ratings, recentSearches)
  - Create database indexes for userId, profileId, contentId, and timestamp fields
  - Implement database error handling with retry logic (3 attempts with exponential backoff)
  - _Requirements: 2.10, 31.4_

- [x] 3. Configure Auth0 or Clerk authentication provider
  - Install Auth0 SDK or Clerk SDK for Next.js
  - Configure authentication provider with environment variables
  - Set up authentication middleware for protected API routes
  - Implement token validation utility function
  - _Requirements: 1.1, 1.2, 1.9, 28.6, 31.8_

- [x] 4. Set up TMDB API integration layer
  - Create TMDB service module with API client configuration
  - Implement functions for fetching trending, popular, top-rated, new releases, genres, search, and detail endpoints
  - Implement image URL transformation to use wsrv.nl optimization service
  - Implement TMDB response parsing functions for movies, TV shows, persons, and seasons
  - Add error handling for TMDB API failures with 502 responses and caching fallback
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 30.1, 30.2, 30.3, 31.5_

- [ ]* 4.1 Write property test for TMDB image URL transformation
  - **Property 7: TMDB Image URL Transformation**
  - **Validates: Requirements 30.3**

- [ ]* 4.2 Write property test for TMDB parsing round-trip
  - **Property 8: TMDB Parsing Round-Trip**
  - **Validates: Requirements 30.1, 30.4**

- [ ]* 4.3 Write property test for TMDB parsing error handling
  - **Property 6: TMDB Parsing Error Handling**
  - **Validates: Requirements 30.2**

- [ ] 5. Set up Resend email service integration
  - Install Resend SDK
  - Create email service module with Resend API client
  - Implement functions for sending welcome, invitation, and security notification emails
  - Create branded email templates matching platform visual identity
  - Implement email delivery error handling with retry logic (up to 3 attempts)
  - _Requirements: 33.1, 33.2, 33.6, 33.7, 33.8_


### Phase 2: Web Application - Backend API Routes

- [ ] 6. Implement Profile API routes
  - [ ] 6.1 Create GET /api/profiles route to list profiles for a user
    - Implement authentication middleware to extract userId from Auth0/Clerk token
    - Query MongoDB profiles collection by userId
    - Return array of Profile objects
    - _Requirements: 2.2, 31.8_
  
  - [ ] 6.2 Create POST /api/profiles route to create new profile
    - Validate request body (name, avatarUrl, isKids, maturityRating, pinEnabled, language, preferences)
    - Check profile limit (maximum 5 profiles per user account)
    - Insert new profile document into MongoDB
    - Return created Profile object or 409 error if limit exceeded
    - _Requirements: 2.1, 2.5, 2.6, 2.7_
  
  - [ ] 6.3 Create GET /api/profiles/:id route to get single profile
    - Validate profile ID parameter
    - Query MongoDB by profile ID
    - Return Profile object or 404 if not found
    - _Requirements: 2.10_
  
  - [ ] 6.4 Create PATCH /api/profiles/:id route to update profile
    - Validate profile ID and request body
    - Update profile document in MongoDB
    - Return updated Profile object
    - _Requirements: 2.4_
  
  - [ ] 6.5 Create DELETE /api/profiles/:id route to delete profile
    - Validate profile ID parameter
    - Delete profile document from MongoDB
    - Return 204 No Content
    - _Requirements: 2.4_
  
  - [ ] 6.6 Create POST /api/profiles/:id/verify-pin route for PIN verification
    - Validate profile ID and PIN from request body
    - Compare hashed PIN with stored pinHash
    - Return { valid: boolean }
    - _Requirements: 2.8_

- [ ]* 6.7 Write property test for profile limit enforcement
  - **Property 2: Profile Limit Enforcement**
  - **Validates: Requirements 2.1**

- [ ]* 6.8 Write property test for profile data isolation
  - **Property 3: Profile Data Isolation**
  - **Validates: Requirements 2.10**

- [ ]* 6.9 Write property test for protected endpoint token validation
  - **Property 1: Protected Endpoint Token Validation**
  - **Validates: Requirements 1.9**

- [ ] 7. Implement Content API routes (TMDB proxy)
  - [ ] 7.1 Create GET /api/content/trending route
    - Accept timeWindow query parameter (day or week)
    - Call TMDB service getTrending function
    - Return array of Content objects
    - _Requirements: 3.2, 4.2_
  
  - [ ] 7.2 Create GET /api/content/popular route
    - Accept type query parameter (movie or tv)
    - Call TMDB service getPopular function
    - Return array of Content objects
    - _Requirements: 3.3, 4.7_
  
  - [ ] 7.3 Create GET /api/content/top-rated route
    - Accept type query parameter (movie or tv)
    - Call TMDB service getTopRated function
    - Return array of Content objects
    - _Requirements: 3.4_
  
  - [ ] 7.4 Create GET /api/content/new-releases route
    - Call TMDB service getNewReleases function
    - Return array of Content objects
    - _Requirements: 3.5, 4.6_
  
  - [ ] 7.5 Create GET /api/content/genres route
    - Accept type query parameter (movie or tv)
    - Call TMDB service getGenres function
    - Return array of Genre objects
    - _Requirements: 3.6, 4.10_
  
  - [ ] 7.6 Create GET /api/content/:id route for content details
    - Accept id parameter and type query parameter (movie or tv)
    - Call TMDB service getDetails function
    - Return ContentDetails object
    - _Requirements: 3.7, 11.10, 11.11_
  
  - [ ] 7.7 Create GET /api/content/:id/season/:seasonNumber route
    - Accept id and seasonNumber parameters
    - Call TMDB service getSeasonDetails function
    - Return Season object with episodes
    - _Requirements: 3.10, 11.12, 11.13, 11.14_
  
  - [ ] 7.8 Create GET /api/content/:id/recommendations route
    - Accept id parameter and type query parameter
    - Call TMDB service getRecommendations function
    - Return array of Content objects
    - _Requirements: 3.9, 11.16_
  
  - [ ] 7.9 Create GET /api/content/:id/similar route
    - Accept id parameter and type query parameter
    - Call TMDB service getSimilar function
    - Return array of Content objects
    - _Requirements: 3.9, 11.16_
  
  - [ ] 7.10 Create GET /api/content/search route
    - Accept query and filters query parameters
    - Call TMDB service search function
    - Return SearchResults object with movies, tvShows, people arrays
    - _Requirements: 8.4, 8.5, 8.12_


- [ ] 8. Implement User Data API routes
  - [ ] 8.1 Create GET /api/watchlist route
    - Accept profileId query parameter
    - Query MongoDB watchlists collection by profileId
    - Return array of WatchlistItem objects
    - _Requirements: 9.7_
  
  - [ ] 8.2 Create POST /api/watchlist route
    - Accept profileId, contentId, and contentType in request body
    - Insert new watchlist document into MongoDB
    - Return 201 Created
    - _Requirements: 9.4_
  
  - [ ] 8.3 Create DELETE /api/watchlist/:contentId route
    - Accept contentId parameter and profileId query parameter
    - Delete watchlist document from MongoDB
    - Return 204 No Content
    - _Requirements: 9.5_
  
  - [ ] 8.4 Create GET /api/watch-progress route
    - Accept profileId query parameter
    - Query MongoDB watchHistory collection by profileId
    - Filter for items with percentageWatched < 95
    - Return array of ContinueWatchingItem objects sorted by lastWatchedAt descending
    - _Requirements: 10.2_
  
  - [ ] 8.5 Create POST /api/watch-progress route
    - Accept profileId, contentId, episodeId, seasonNumber, episodeNumber, currentTime, duration, percentageWatched in request body
    - Upsert watch progress document in MongoDB
    - Return 200 OK
    - _Requirements: 10.1_
  
  - [ ] 8.6 Create DELETE /api/watch-progress/:contentId route
    - Accept contentId parameter and profileId query parameter
    - Delete watch progress document from MongoDB
    - Return 204 No Content
    - _Requirements: 10.5_
  
  - [ ] 8.7 Create GET /api/ratings/:contentId route
    - Accept contentId parameter and profileId query parameter
    - Query MongoDB ratings collection
    - Return rating number or null if not found
    - _Requirements: 11.19_
  
  - [ ] 8.8 Create PUT /api/ratings/:contentId route
    - Accept contentId parameter, profileId and rating (1-5) in request body
    - Upsert rating document in MongoDB
    - Return 200 OK
    - _Requirements: 11.19_
  
  - [ ] 8.9 Create GET /api/history route
    - Accept profileId query parameter
    - Query MongoDB watchHistory collection by profileId
    - Return array of HistoryItem objects sorted by watchedAt descending
    - _Requirements: 18.8_
  
  - [ ] 8.10 Create DELETE /api/history/:id route
    - Accept id parameter
    - Delete history document from MongoDB
    - Return 204 No Content
    - _Requirements: 18.9_
  
  - [ ] 8.11 Create GET /api/searches route
    - Accept profileId query parameter
    - Query MongoDB recentSearches collection by profileId
    - Return array of recent search query strings (limit 10, sorted by timestamp descending)
    - _Requirements: 8.8_
  
  - [ ] 8.12 Create POST /api/searches route
    - Accept profileId and query in request body
    - Insert or update recent search document in MongoDB
    - Return 201 Created
    - _Requirements: 8.8_
  
  - [ ] 8.13 Create DELETE /api/searches/:query route
    - Accept query parameter and profileId query parameter
    - Delete recent search document from MongoDB
    - Return 204 No Content
    - _Requirements: 8.9_

- [ ]* 8.14 Write property test for watchlist operations round-trip
  - **Property 4: Watchlist Operations Round-Trip**
  - **Validates: Requirements 9.4, 9.5**

- [ ]* 8.15 Write property test for user data persistence
  - **Property 5: User Data Persistence**
  - **Validates: Requirements 10.6, 14.10**

- [ ] 9. Implement Email API routes
  - [ ] 9.1 Create POST /api/email/welcome route
    - Accept userId, email, and name in request body
    - Call Resend service sendWelcomeEmail function
    - Return 200 OK or 502 on failure
    - _Requirements: 33.3_
  
  - [ ] 9.2 Create POST /api/email/invitation route
    - Accept email and inviterName in request body
    - Call Resend service sendInvitationEmail function
    - Return 200 OK or 502 on failure
    - _Requirements: 33.4_
  
  - [ ] 9.3 Create POST /api/email/security route
    - Accept userId, email, and event in request body
    - Call Resend service sendSecurityNotification function
    - Return 200 OK or 502 on failure
    - _Requirements: 33.5_

- [ ] 10. Checkpoint - Ensure all backend API tests pass
  - Ensure all tests pass, ask the user if questions arise.


### Phase 3: Web Application - Authentication and Profile System

- [ ] 11. Implement authentication components
  - [ ] 11.1 Create AuthProvider wrapper component
    - Wrap application with Auth0Provider or ClerkProvider
    - Configure authentication provider with environment variables
    - _Requirements: 1.1, 1.2_
  
  - [ ] 11.2 Create AuthGuard route protection component
    - Check Auth0/Clerk session status
    - Redirect to sign-in if unauthenticated
    - Pass through to children if authenticated
    - _Requirements: 1.8_
  
  - [ ] 11.3 Create SignInButton component using shadcn/ui Button
    - Trigger Auth0/Clerk sign-in flow on click
    - Style with Netflix brand color and hover states
    - _Requirements: 1.5_
  
  - [ ] 11.4 Create SignUpButton component using shadcn/ui Button
    - Trigger Auth0/Clerk sign-up flow on click
    - Style with Netflix brand color and hover states
    - _Requirements: 1.5_
  
  - [ ] 11.5 Create UserButton component
    - Use Auth0/Clerk user menu component
    - Customize styling to match Netflix design
    - _Requirements: 15.11, 15.12_
  
  - [ ] 11.6 Create PasswordResetTrigger component
    - Trigger Auth0/Clerk password reset flow
    - Display success/error messages
    - _Requirements: 1.7_

- [ ] 12. Implement profile management components
  - [ ] 12.1 Create ProfilePicker full-screen component
    - Display grid of profile avatars with names using shadcn/ui Card
    - Fetch profiles from GET /api/profiles
    - Navigate to home screen on profile selection
    - Show "Manage Profiles" button
    - Style with dark background (#141414) and Netflix layout
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [ ] 12.2 Create ProfileAvatar component
    - Display circular avatar image with profile name beneath
    - Implement hover state with scale and border animation
    - _Requirements: 2.3_
  
  - [ ] 12.3 Create ProfileManager component
    - Display grid of existing profiles with edit/delete actions
    - Show "Add Profile" button if under 5 profiles
    - Implement create, edit, delete flows calling Profile API routes
    - _Requirements: 2.4, 18.3_
  
  - [ ] 12.4 Create ProfileForm component using shadcn/ui Form
    - Input fields for name, avatar selection, maturity rating, PIN toggle, language
    - Avatar selection grid with preset images
    - Validate name length (1-50 chars) and maturity rating enum
    - _Requirements: 2.5, 2.6, 2.7_
  
  - [ ] 12.5 Create PinEntry component using shadcn/ui Input
    - Display 4-digit PIN input with masked characters
    - Call POST /api/profiles/:id/verify-pin on submit
    - Show error message for invalid PIN
    - _Requirements: 2.8_


### Phase 4: Web Application - Home Screen and Content Discovery

- [ ] 13. Implement HeroBanner component
  - Create HeroBanner component using shadcn/ui Card and Button
  - Fetch top 5 trending titles from GET /api/content/trending
  - Display backdrop image filling full viewport width with gradient fade to dark background
  - Overlay title logo or name in large text
  - Display short synopsis (truncate to 3 lines)
  - Add "Play" button and "More Info" button styled with Netflix colors
  - Implement auto-rotation every 6 seconds with 800ms cross-fade transition
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

- [ ] 14. Implement ContentCard component
  - [ ] 14.1 Create base ContentCard component using shadcn/ui Card
    - Display poster image with lazy loading using Next.js Image
    - Show shimmer skeleton while loading
    - _Requirements: 22.1, 22.2, 22.3, 23.1_
  
  - [ ] 14.2 Implement ContentCard hover expansion (web only)
    - Wait 400ms before reacting to hover
    - Scale to 1.2x and translate upward by 8px over 200ms with ease-out curve
    - Reveal panel with title, star rating, genre chips, play button, add-to-list button, like/dislike buttons, more info button
    - Expand to right if at row start, left if at row end, symmetrically if in middle
    - Prevent clipping outside row visible area
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_
  
  - [ ] 14.3 Create Top10Card variant component
    - Extend ContentCard with large semi-transparent rank number overlay on left edge
    - Style rank number to match Netflix Top 10 design
    - _Requirements: 4.5, 4.11_
  
  - [ ] 14.4 Create ContinueWatchingCard variant component
    - Display backdrop image instead of poster
    - Add red progress bar at bottom showing percentageWatched
    - Show "Resume" button on hover
    - Add three-dot menu with "Remove from Continue Watching" option
    - _Requirements: 10.3, 10.4, 10.5_

- [ ] 15. Implement ContentRow component
  - Create ContentRow component with horizontal scroll using shadcn/ui ScrollArea
  - Display row label with bold text
  - Render array of ContentCard components
  - Implement lazy loading for cards as they enter viewport
  - Add click-to-advance arrow buttons on left and right edges (web only)
  - Support drag-to-scroll with momentum (web only)
  - _Requirements: 4.1, 21.5, 21.6_

- [ ] 16. Implement home screen page
  - [ ] 16.1 Create home page component (app/page.tsx)
    - Wrap with AuthGuard to require authentication
    - Display HeroBanner at top
    - Fetch and display "Trending Now" row from GET /api/content/trending
    - Fetch and display "Continue Watching" row from GET /api/watch-progress as second row
    - Fetch and display "My List" row from GET /api/watchlist
    - Fetch and display "Top 10 in Your Country" row with Top10Card components
    - Fetch and display "New Releases" row from GET /api/content/new-releases
    - Fetch and display "Popular on the Platform" row from GET /api/content/popular
    - Fetch genres from GET /api/content/genres and display at least 4 genre-specific rows
    - Display "Because You Watched" rows based on viewing history (if available)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_
  
  - [ ] 16.2 Implement shimmer skeleton loading states
    - Show ShimmerSkeleton for HeroBanner before data loads
    - Show ShimmerSkeleton for each ContentCard before data loads
    - Show ShimmerSkeleton for row labels before data loads
    - _Requirements: 22.1, 22.2, 22.3_

- [ ] 17. Checkpoint - Ensure home screen renders correctly
  - Ensure all tests pass, ask the user if questions arise.


### Phase 5: Web Application - Navigation Components

- [ ] 18. Implement TopNav component
  - [ ] 18.1 Create TopNav component using shadcn/ui NavigationMenu
    - Display platform logo on left side
    - Display "Browse" dropdown menu on left side
    - Display search icon, notification bell, and profile avatar on right side
    - Start with transparent background
    - Transition to solid dark background (#141414) when scrolled down more than 80px over 200ms
    - _Requirements: 15.1, 15.2, 15.3, 15.7, 15.11_
  
  - [ ] 18.2 Create BrowseDropdown component using shadcn/ui DropdownMenu
    - Display links to Home, Movies, TV Shows, New and Popular, My List
    - Show dropdown on hover with fade-in and slight downward slide animation
    - _Requirements: 15.4, 15.5, 15.6_
  
  - [ ] 18.3 Create SearchBar component using shadcn/ui Input and Command
    - Display as icon initially
    - Expand to full search input on click
    - Implement 300ms debounce for search queries
    - _Requirements: 15.7, 15.8, 8.4_
  
  - [ ] 18.4 Create NotificationDropdown component using shadcn/ui DropdownMenu
    - Display notification bell icon
    - Show dropdown with recently added titles and personalized recommendations on click
    - Fetch data from GET /api/content/new-releases and GET /api/content/recommendations
    - _Requirements: 15.9, 15.10_
  
  - [ ] 18.5 Create ProfileDropdown component using shadcn/ui DropdownMenu
    - Display profile avatar
    - Show dropdown with links to current profile, other profiles, account settings, sign out on click
    - Implement sign out functionality calling Auth0/Clerk sign out
    - _Requirements: 15.11, 15.12_


### Phase 6: Web Application - Detail View

- [ ] 19. Implement DetailModal component
  - [ ] 19.1 Create DetailModal component using shadcn/ui Dialog
    - Display as slide-up modal on web (scale from 95% to 100% with fade-in over 250ms)
    - Show backdrop image with trailer playing automatically on mute in loop
    - Overlay title logo or name in bottom-left of backdrop
    - Display "Play" button, "Add to My List" button, and Like/Dislike/Loved buttons below backdrop
    - _Requirements: 11.1, 11.2, 11.3, 11.5, 11.7, 11.8, 11.9, 21.2_
  
  - [ ] 19.2 Display content metadata and synopsis
    - Show year, maturity rating, duration or number of seasons, and genre tags
    - Display full synopsis text
    - _Requirements: 11.10, 11.11_
  
  - [ ] 19.3 Implement SeasonSelector and EpisodeList for TV shows
    - Create SeasonSelector dropdown using shadcn/ui Select
    - Create EpisodeList component displaying vertical list of episode cards using shadcn/ui Card
    - Show episode still image, episode number, title, air date, runtime, and synopsis for each episode
    - Display progress bar on episode still if watched
    - Fetch season data from GET /api/content/:id/season/:seasonNumber
    - _Requirements: 11.12, 11.13, 11.14, 11.15_
  
  - [ ] 19.4 Create CastCarousel component
    - Display horizontally scrollable cast member cards using shadcn/ui ScrollArea
    - Show photo, name, and character name for each cast member
    - Navigate to filtered browse on cast member click
    - _Requirements: 11.17, 11.18_
  
  - [ ] 19.5 Create MoreLikeThis section
    - Display grid of similar content recommendations using ContentCard components
    - Fetch data from GET /api/content/:id/recommendations and GET /api/content/:id/similar
    - _Requirements: 11.16_
  
  - [ ] 19.6 Create RatingWidget component
    - Display star rating input (1-5 stars)
    - Call PUT /api/ratings/:contentId on rating change
    - Fetch current rating from GET /api/ratings/:contentId on mount
    - _Requirements: 11.19_
  
  - [ ] 19.7 Add share link and download buttons
    - Create share link button that copies URL to clipboard
    - Show success toast notification on copy
    - _Requirements: 11.20_


### Phase 7: Web Application - Video Player

- [ ] 20. Implement VideoPlayer component
  - [ ] 20.1 Create VideoPlayer full-screen shell component
    - Display in full-screen mode
    - Wrap VidKing iframe element for video stream
    - Accept iframe source URL as prop
    - _Requirements: 12.1, 12.2, 29.1, 29.2, 29.3, 29.5_
  
  - [ ] 20.2 Create PlayerOverlay component
    - Display title and episode information in top-left corner
    - Display subtitle button, audio track button, quality button, and exit button in top-right corner
    - Fade out overlay after 3 seconds of inactivity
    - Fade in overlay on mouse move or key press
    - _Requirements: 12.3, 12.4, 12.9, 12.10_
  
  - [ ] 20.3 Create ProgressBar component
    - Display progress bar at bottom showing elapsed and total duration
    - Allow scrubbing by clicking or dragging on progress bar
    - _Requirements: 12.5, 12.6_
  
  - [ ] 20.4 Create PlayerControls component
    - Display play/pause, seek back 10 seconds, seek forward 10 seconds buttons to left of progress bar
    - Display volume control and fullscreen toggle buttons to right of progress bar
    - _Requirements: 12.7, 12.8_
  
  - [ ] 20.5 Implement SkipIntroButton and SkipRecapButton
    - Display "Skip Intro" button in bottom-right corner at appropriate timestamp
    - Display "Skip Recap" button at start of episodes when recap data available
    - Auto-hide buttons if not clicked
    - _Requirements: 12.11, 12.12_
  
  - [ ] 20.6 Create NextEpisodeCard component
    - Slide in card from bottom-right when episode ends
    - Show next episode thumbnail, title, and episode number
    - Display circular countdown timer indicating auto-advance in 5 seconds
    - Allow click to advance immediately or dismiss to stay on end screen
    - _Requirements: 12.13, 12.14, 12.15, 12.16_
  
  - [ ] 20.7 Create SubtitleSelector and QualitySelector components
    - Display subtitle and audio track selection menu
    - Display video quality selection menu
    - _Requirements: 12.4_
  
  - [ ] 20.8 Implement keyboard shortcuts
    - Spacebar for play/pause
    - F for fullscreen
    - M for mute
    - Left arrow for seek back 10 seconds
    - Right arrow for seek forward 10 seconds
    - _Requirements: 12.17_
  
  - [ ] 20.9 Implement picture-in-picture mode
    - Add picture-in-picture toggle button
    - Support browser picture-in-picture API
    - _Requirements: 12.18_
  
  - [ ] 20.10 Implement watch progress tracking
    - Write current timestamp and percentageWatched to POST /api/watch-progress every 10 seconds
    - _Requirements: 10.1_

- [ ] 21. Checkpoint - Ensure player works correctly
  - Ensure all tests pass, ask the user if questions arise.


### Phase 8: Web Application - Search Functionality

- [ ] 22. Implement search page and components
  - [ ] 22.1 Create search page component (app/search/page.tsx)
    - Display SearchBar component at top
    - Show trending searches row from TMDB before user types
    - Show recent searches row from GET /api/searches before user types
    - Display search results with 300ms debounce as user types
    - _Requirements: 8.1, 8.4, 8.7, 8.8_
  
  - [ ] 22.2 Create SearchResults component
    - Organize results into tabs for Movies, TV Shows, and People using shadcn/ui Tabs
    - Display each result with thumbnail, title, year, and rating using ContentCard
    - _Requirements: 8.5, 8.6_
  
  - [ ] 22.3 Create SearchFilters component
    - Display filter chips for genre, content type, release year range, and rating threshold using shadcn/ui Badge
    - Update search query with selected filters
    - _Requirements: 8.12_
  
  - [ ] 22.4 Implement recent search management
    - Call POST /api/searches when user performs search
    - Display dismiss button on each recent search item
    - Call DELETE /api/searches/:query when user dismisses search
    - _Requirements: 8.8, 8.9_


### Phase 9: Web Application - Browse and Genre Pages

- [ ] 23. Implement browse pages
  - [ ] 23.1 Create movies browse page (app/movies/page.tsx)
    - Display GenreGrid component with infinite scroll
    - Fetch movies from GET /api/content/popular?type=movie
    - Implement cursor-based pagination for infinite scroll
    - _Requirements: 24.1, 24.2_
  
  - [ ] 23.2 Create TV shows browse page (app/tv/page.tsx)
    - Display GenreGrid component with infinite scroll
    - Fetch TV shows from GET /api/content/popular?type=tv
    - Implement cursor-based pagination for infinite scroll
    - _Requirements: 24.1, 24.2_
  
  - [ ] 23.3 Create genre-specific browse page (app/genre/[id]/page.tsx)
    - Display GenreGrid component with infinite scroll
    - Fetch content by genre from TMDB API filtered by genre ID
    - Implement cursor-based pagination for infinite scroll
    - _Requirements: 3.6, 24.1, 24.2_
  
  - [ ] 23.4 Create GenreGrid component
    - Display grid of ContentCard components
    - Implement infinite scroll with intersection observer
    - Show shimmer skeletons while loading more content
    - _Requirements: 22.1, 22.3, 23.1_
  
  - [ ] 23.5 Create FilterBar component
    - Display genre, year, rating filter chips using shadcn/ui Badge
    - Update grid content based on selected filters
    - _Requirements: 8.12_
  
  - [ ] 23.6 Create EmptyState component
    - Display illustration and message for no results
    - Show retry button for failed requests
    - _Requirements: 22.4, 22.5, 22.6_


### Phase 10: Web Application - Watchlist and Continue Watching

- [ ] 24. Implement watchlist functionality
  - [ ] 24.1 Create My List page (app/my-list/page.tsx)
    - Display grid of watchlist items using ContentCard components
    - Fetch data from GET /api/watchlist
    - Show empty state if watchlist is empty
    - _Requirements: 9.8_
  
  - [ ] 24.2 Implement "Add to My List" button on ContentCard
    - Display button on card hover state
    - Toggle between "Add" and "Remove" states with animated checkmark transition
    - Call POST /api/watchlist on add
    - Call DELETE /api/watchlist/:contentId on remove
    - _Requirements: 9.1, 9.4, 9.5, 9.6_
  
  - [ ] 24.3 Implement "Add to My List" button on DetailModal
    - Display button below backdrop
    - Toggle between "Add" and "Remove" states with animated checkmark transition
    - Call POST /api/watchlist on add
    - Call DELETE /api/watchlist/:contentId on remove
    - _Requirements: 9.2, 9.4, 9.5, 9.6_
  
  - [ ] 24.4 Implement "Add to My List" button on browse pages
    - Display button on ContentCard hover state
    - Toggle between "Add" and "Remove" states with animated checkmark transition
    - Call POST /api/watchlist on add
    - Call DELETE /api/watchlist/:contentId on remove
    - _Requirements: 9.3, 9.4, 9.5, 9.6_

- [ ] 25. Implement continue watching functionality
  - [ ] 25.1 Display Continue Watching row on home screen
    - Fetch data from GET /api/watch-progress
    - Display as second row below HeroBanner using ContinueWatchingCard components
    - _Requirements: 10.2, 10.3_
  
  - [ ] 25.2 Implement "Remove from Continue Watching" action
    - Display three-dot menu on ContinueWatchingCard hover
    - Call DELETE /api/watch-progress/:contentId on remove
    - Animate card exit and collapse gap
    - _Requirements: 10.5, 9.9_
  
  - [ ] 25.3 Display progress bar on DetailModal for partially watched content
    - Fetch watch progress from GET /api/watch-progress
    - Display red progress bar on title card if percentageWatched > 0
    - _Requirements: 10.6_


### Phase 11: Web Application - Settings and Account Management

- [ ] 26. Implement settings pages
  - [ ] 26.1 Create account settings page (app/settings/account/page.tsx)
    - Display account information including email using shadcn/ui Form
    - Provide password change functionality calling Auth0/Clerk API
    - Display subscription status and plan details
    - _Requirements: 18.1, 18.2_
  
  - [ ] 26.2 Create playback settings page (app/settings/playback/page.tsx)
    - Display toggle for autoplay next episode using shadcn/ui Switch
    - Display toggle for autoplay previews using shadcn/ui Switch
    - Display toggle for data saver mode using shadcn/ui Switch
    - Save settings to profile preferences via PATCH /api/profiles/:id
    - _Requirements: 18.4, 18.5_
  
  - [ ] 26.3 Create language settings page (app/settings/language/page.tsx)
    - Display language preference dropdown using shadcn/ui Select
    - Display subtitle preference dropdown using shadcn/ui Select
    - Save settings to profile preferences via PATCH /api/profiles/:id
    - _Requirements: 18.6_
  
  - [ ] 26.4 Create viewing activity page (app/settings/activity/page.tsx)
    - Display full viewing history log using shadcn/ui Table
    - Fetch data from GET /api/history
    - Provide remove button for each history item
    - Call DELETE /api/history/:id on remove
    - _Requirements: 18.8, 18.9_
  
  - [ ] 26.5 Create subscription management page (app/settings/subscription/page.tsx)
    - Display current plan, renewal date, and plan comparison cards
    - Show upgrade and downgrade options with clear pricing
    - Implement cancel subscription flow with multi-step confirmation and retention messaging
    - Note: UI-only, no real payment processing
    - _Requirements: 18.13, 18.14, 18.15, 18.16_
  
  - [ ] 26.6 Implement sign out functionality
    - Add "Sign Out" option in ProfileDropdown
    - Call Auth0/Clerk sign out on click
    - Add "Sign Out of All Devices" option
    - Call Auth0/Clerk invalidate all sessions on "Sign Out of All Devices"
    - _Requirements: 18.10, 18.11, 18.12, 1.10_


### Phase 12: Web Application - Landing Page

- [ ] 27. Implement landing page for unauthenticated users
  - [ ] 27.1 Create landing page component (app/landing/page.tsx)
    - Display only to unauthenticated users (redirect authenticated users to home)
    - _Requirements: 13.1_
  
  - [ ] 27.2 Create LandingHero component
    - Display full-viewport hero section
    - Show collage of movie and show artwork from GET /api/content/trending as animated background
    - Display platform logo at top-left
    - Display "Sign In" button at top-right
    - Display bold headline (max 10 words), one-sentence subline, email input, and "Get Started" button centered
    - Implement subtle background animation (slow zoom or fade between images)
    - _Requirements: 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9_
  
  - [ ] 27.3 Create FeatureSection component
    - Display three feature sections below hero alternating text and visual content
    - First section: watching on any device
    - Second section: downloading for offline viewing
    - Third section: creating multiple profiles
    - Each section has large headline, short paragraph, and animated graphic or looping video
    - _Requirements: 13.10_
  
  - [ ] 27.4 Create FAQAccordion component using shadcn/ui Accordion
    - Display at least 5 frequently asked questions
    - Smoothly expand answer on question click
    - Collapse answer on second click
    - Allow only one answer open at a time
    - _Requirements: 13.11, 13.12, 13.13, 13.14_
  
  - [ ] 27.5 Create LandingFooter component
    - Display organized link columns for legal pages, language selection, and copyright information
    - _Requirements: 13.15_
  
  - [ ] 27.6 Make landing page fully responsive
    - Adapt layout for mobile viewports
    - Stack hero content vertically on mobile
    - Scale font sizes appropriately
    - _Requirements: 13.16_


### Phase 13: Web Application - Onboarding Flow

- [ ] 28. Implement onboarding flow for first-time users
  - [ ] 28.1 Create onboarding page component (app/onboarding/page.tsx)
    - Display to first-time users after account creation before home screen
    - _Requirements: 14.1_
  
  - [ ] 28.2 Create OnboardingSlider component
    - Display three informational screens as horizontal slider or page scroll
    - First screen: explain content browsing with visual
    - Second screen: explain offline downloads with animation
    - Third screen: explain multi-profile support with illustration
    - Display navigation dots showing progress
    - _Requirements: 14.2, 14.3, 14.4, 14.5, 14.6_
  
  - [ ] 28.3 Create GenrePicker component
    - Display grid of genre tiles with representative images and genre names
    - Fetch genres from GET /api/content/genres
    - Require user to select at least 3 genres
    - Save selections to profile preferences via PATCH /api/profiles/:id
    - _Requirements: 14.7, 14.8, 14.9, 14.10_
  
  - [ ] 28.4 Use genre selections to personalize home screen
    - Fetch genre selections from profile preferences
    - Generate genre-specific rows on home screen based on selections
    - _Requirements: 14.11_

- [ ] 29. Checkpoint - Ensure web application is complete
  - Ensure all tests pass, ask the user if questions arise.


### Phase 14: Mobile Application - Project Setup and Configuration

- [ ] 30. Initialize React Native project with TypeScript
  - Create new React Native project with TypeScript strict mode
  - Install React Navigation for navigation
  - Install Zustand for state management
  - Install React Query (TanStack Query) for data fetching
  - Install Axios for HTTP client to Next.js API
  - Install React Native Fast Image for image caching
  - Configure dark theme matching Netflix colors (#141414, #181818, #232323, #2F2F2F)
  - Configure custom brand color (default #E50914) and Netflix Sans font with Inter fallback
  - Create environment variables file for Next.js API base URL
  - _Requirements: 27.1, 27.2, 27.3, 27.5, 31.6_

- [ ] 31. Configure Auth0 or Clerk authentication for React Native
  - Install Auth0 React Native SDK or Clerk Expo SDK
  - Configure authentication provider with environment variables
  - Implement authentication context provider
  - Implement token storage and retrieval
  - _Requirements: 1.3, 27.3_


### Phase 15: Mobile Application - Authentication and Profile System

- [ ] 32. Implement mobile authentication screens
  - Create sign-in screen with Auth0/Clerk integration
  - Create sign-up screen with Auth0/Clerk integration
  - Create password reset screen
  - Implement authentication guard for protected screens
  - _Requirements: 1.3, 1.5, 1.7, 1.8_

- [ ] 33. Implement mobile profile management screens
  - [ ] 33.1 Create ProfilePicker screen
    - Display grid of profile avatars with names
    - Fetch profiles from GET /api/profiles via Axios
    - Navigate to home screen on profile selection
    - Show "Manage Profiles" button
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [ ] 33.2 Create ProfileManager screen
    - Display grid of existing profiles with edit/delete actions
    - Show "Add Profile" button if under 5 profiles
    - Implement create, edit, delete flows calling Profile API routes via Axios
    - _Requirements: 2.4, 18.3_
  
  - [ ] 33.3 Create ProfileForm screen
    - Input fields for name, avatar selection, maturity rating, PIN toggle, language
    - Avatar selection grid with preset images
    - Validate name length (1-50 chars) and maturity rating enum
    - _Requirements: 2.5, 2.6, 2.7_
  
  - [ ] 33.4 Create PinEntry screen
    - Display 4-digit PIN input with masked characters
    - Call POST /api/profiles/:id/verify-pin via Axios on submit
    - Show error message for invalid PIN
    - _Requirements: 2.8_


### Phase 16: Mobile Application - Home Screen and Content Discovery

- [ ] 34. Implement mobile home screen
  - Create home screen with HeroBanner component at top
  - Fetch and display "Trending Now" row from GET /api/content/trending via Axios
  - Fetch and display "Continue Watching" row from GET /api/watch-progress via Axios
  - Fetch and display "My List" row from GET /api/watchlist via Axios
  - Fetch and display "Top 10 in Your Country" row with rank overlays
  - Fetch and display "New Releases" row from GET /api/content/new-releases via Axios
  - Fetch and display "Popular on the Platform" row from GET /api/content/popular via Axios
  - Fetch genres from GET /api/content/genres and display at least 4 genre-specific rows
  - Display "Because You Watched" rows based on viewing history
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

- [ ] 35. Implement mobile ContentCard component
  - Display poster image with lazy loading using React Native Fast Image
  - Show shimmer skeleton while loading
  - Implement tap state with haptic feedback
  - Open DetailView on tap
  - _Requirements: 7.1, 22.1, 22.3, 23.5_

- [ ] 36. Implement mobile ContentRow component
  - Display row label with bold text
  - Render horizontal FlatList of ContentCard components
  - Support swipe-to-scroll gesture
  - Implement lazy loading for cards
  - _Requirements: 4.1, 21.7_

- [ ] 37. Implement mobile HeroBanner component
  - Fetch top 5 trending titles from GET /api/content/trending via Axios
  - Display backdrop image filling full width
  - Overlay title logo or name
  - Display short synopsis (truncate to 3 lines)
  - Add "Play" button and "More Info" button
  - Implement auto-rotation every 6 seconds with cross-fade transition
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_


### Phase 17: Mobile Application - Navigation

- [ ] 38. Implement mobile bottom tab navigation
  - Create bottom tab navigator with 5 tabs: Home, Search, Downloads, My List, Profile
  - Style active tab with white icon and label
  - Style inactive tabs with muted grey color
  - Implement gradient fade from content to tab bar with no visible border
  - Ensure instant tab switching with no transition delay
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ] 39. Implement mobile top bar
  - Display platform logo centered or left-aligned depending on screen
  - Display contextually appropriate action buttons on right side
  - _Requirements: 16.6, 16.7_


### Phase 18: Mobile Application - Detail View

- [ ] 40. Implement mobile DetailView screen
  - Display as dedicated full-screen view
  - Show backdrop image with trailer playing automatically on mute in loop
  - Overlay title logo or name in bottom-left of backdrop
  - Display "Play" button, "Add to My List" button, "Download" button, and Like/Dislike/Loved buttons below backdrop
  - Show year, maturity rating, duration or number of seasons, and genre tags
  - Display full synopsis text
  - Implement SeasonSelector and EpisodeList for TV shows
  - Display CastCarousel with horizontally scrollable cast members
  - Display MoreLikeThis section with grid of similar titles
  - Add RatingWidget for star rating (1-5)
  - Add share link button
  - _Requirements: 11.1, 11.4, 11.5, 11.7, 11.8, 11.9, 11.10, 11.11, 11.12, 11.13, 11.14, 11.15, 11.16, 11.17, 11.18, 11.19, 11.20, 11.21_


### Phase 19: Mobile Application - Video Player

- [ ] 41. Implement mobile VideoPlayer component
  - Create full-screen player shell wrapping VidKing WebView
  - Display title and episode information in top-left corner
  - Display subtitle button, audio track button, quality button, and exit button in top-right corner
  - Display progress bar at bottom with elapsed and total duration
  - Allow scrubbing by dragging on progress bar
  - Display play/pause, seek back 10 seconds, seek forward 10 seconds buttons
  - Display volume control button
  - Fade out overlay after 3 seconds of inactivity
  - Fade in overlay on touch
  - Display "Skip Intro" and "Skip Recap" buttons at appropriate timestamps
  - Display NextEpisodeCard with countdown timer when episode ends
  - Implement picture-in-picture mode
  - Write current timestamp and percentageWatched to POST /api/watch-progress every 10 seconds via Axios
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10, 12.11, 12.12, 12.13, 12.14, 12.15, 12.16, 12.18, 10.1, 29.1, 29.2, 29.3, 29.5_


### Phase 20: Mobile Application - Search, Browse, Watchlist, Settings, and Onboarding

- [ ] 42. Implement mobile search screen
  - Display search bar at top
  - Show trending searches row before user types
  - Show recent searches row from GET /api/searches via Axios before user types
  - Display search results with 300ms debounce as user types
  - Organize results into tabs for Movies, TV Shows, and People
  - Display filter chips for genre, content type, release year range, and rating threshold
  - Support voice search
  - Implement recent search management (add via POST /api/searches, dismiss via DELETE /api/searches/:query)
  - _Requirements: 8.2, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 8.12_

- [ ] 43. Implement mobile browse screens
  - Create movies browse screen with infinite scroll grid
  - Create TV shows browse screen with infinite scroll grid
  - Create genre-specific browse screen with infinite scroll grid
  - Implement cursor-based pagination for infinite scroll
  - Display filter chips for genre, year, rating
  - Show empty state for no results
  - _Requirements: 24.1, 24.2, 8.12, 22.4_

- [ ] 44. Implement mobile watchlist and continue watching
  - Create My List screen displaying grid of watchlist items
  - Fetch data from GET /api/watchlist via Axios
  - Implement "Add to My List" button on ContentCard and DetailView
  - Toggle between "Add" and "Remove" states with animated checkmark
  - Call POST /api/watchlist on add, DELETE /api/watchlist/:contentId on remove via Axios
  - Display Continue Watching row on home screen
  - Implement "Remove from Continue Watching" action calling DELETE /api/watch-progress/:contentId via Axios
  - Display progress bar on DetailView for partially watched content
  - _Requirements: 9.1, 9.2, 9.4, 9.5, 9.6, 9.8, 10.2, 10.3, 10.5, 10.6_

- [ ] 45. Implement mobile settings screens
  - Create account settings screen with email and password change
  - Create playback settings screen with autoplay and data saver toggles
  - Create language settings screen with language and subtitle preferences
  - Create viewing activity screen with history log and remove option
  - Create subscription management screen (UI-only)
  - Implement sign out and sign out of all devices functionality
  - _Requirements: 18.1, 18.2, 18.4, 18.5, 18.6, 18.8, 18.9, 18.10, 18.11, 18.12, 18.13, 18.14, 18.15, 18.16_

- [ ] 46. Implement mobile onboarding flow
  - Create onboarding screen with three informational slides
  - Create GenrePicker screen requiring at least 3 genre selections
  - Save selections to profile preferences via PATCH /api/profiles/:id via Axios
  - Use genre selections to personalize home screen
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 14.10, 14.11_

- [ ] 47. Checkpoint - Ensure mobile application is complete
  - Ensure all tests pass, ask the user if questions arise.


### Phase 21: Android TV Application - Project Setup and Configuration

- [ ] 48. Initialize Android TV project with Kotlin
  - Create new Android TV project with Kotlin
  - Set up Jetpack Compose for TV
  - Configure MVVM architecture with StateFlow
  - Install Compose Navigation for navigation
  - Install Retrofit and OkHttp for HTTP client to Next.js API
  - Install Coil for image loading
  - Configure dark theme matching Netflix colors (#141414, #181818, #232323, #2F2F2F)
  - Configure custom brand color (default #E50914) and Netflix Sans font with Inter fallback
  - Create configuration file for Next.js API base URL
  - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.6, 31.7_

- [ ] 49. Configure Auth0 or Clerk authentication for Android TV
  - Install Auth0 Android SDK or implement custom Clerk integration
  - Configure authentication provider with credentials
  - Implement authentication manager with token storage
  - Implement token validation for API requests
  - _Requirements: 1.4, 27.3_


### Phase 22: Android TV Application - Authentication and Profile System

- [ ] 50. Implement TV authentication screens
  - Create sign-in screen with Auth0/Clerk integration and D-pad navigation
  - Create sign-up screen with Auth0/Clerk integration and D-pad navigation
  - Create password reset screen with D-pad navigation
  - Implement authentication guard for protected screens
  - Ensure all focusable elements have visible 2px red focus ring with 8px border radius
  - _Requirements: 1.4, 1.5, 1.7, 1.8, 7.2_

- [ ] 51. Implement TV profile management screens
  - [ ] 51.1 Create ProfilePicker screen
    - Display grid of profile avatars with names
    - Fetch profiles from GET /api/profiles via Retrofit
    - Navigate to home screen on profile selection
    - Show "Manage Profiles" button
    - Implement D-pad navigation between profile avatars
    - Display 2px red focus ring on focused profile
    - _Requirements: 2.2, 2.3, 2.4, 7.2_
  
  - [ ] 51.2 Create ProfileManager screen
    - Display grid of existing profiles with edit/delete actions
    - Show "Add Profile" button if under 5 profiles
    - Implement create, edit, delete flows calling Profile API routes via Retrofit
    - Implement D-pad navigation between profiles and actions
    - _Requirements: 2.4, 18.3, 7.2_
  
  - [ ] 51.3 Create ProfileForm screen
    - Input fields for name, avatar selection, maturity rating, PIN toggle, language
    - Avatar selection grid with preset images
    - Validate name length (1-50 chars) and maturity rating enum
    - Implement D-pad navigation between form fields
    - _Requirements: 2.5, 2.6, 2.7, 7.2_
  
  - [ ] 51.4 Create PinEntry screen
    - Display 4-digit PIN input with masked characters
    - Call POST /api/profiles/:id/verify-pin via Retrofit on submit
    - Show error message for invalid PIN
    - Implement D-pad navigation for PIN entry
    - _Requirements: 2.8, 7.2_


### Phase 23: Android TV Application - Navigation

- [ ] 52. Implement TV left sidebar navigation
  - [ ] 52.1 Create Sidebar component
    - Display as narrow strip showing only icons when not in focus
    - Expand to show full labels next to icons when in focus over 250ms with ease-out curve
    - Display Home, Movies, TV Shows, Search, My List, Settings, and Profile items
    - Style focused item with red left border, white text, and subtle lighter background
    - Style non-focused items with muted grey color
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_
  
  - [ ] 52.2 Implement D-pad navigation logic
    - Allow D-pad right from sidebar to move focus into content grid
    - Allow D-pad left from content to move focus back to sidebar
    - Allow D-pad up and down within sidebar to navigate between items
    - Handle back button to return to previous screen or close overlay
    - Ensure focus is never lost or trapped
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 17.7, 17.8, 25.5_


### Phase 24: Android TV Application - Home Screen and Content Discovery

- [ ] 53. Implement TV home screen
  - Create home screen with HeroBanner component at top
  - Fetch and display "Trending Now" row from GET /api/content/trending via Retrofit
  - Fetch and display "Continue Watching" row from GET /api/watch-progress via Retrofit
  - Fetch and display "My List" row from GET /api/watchlist via Retrofit
  - Fetch and display "Top 10 in Your Country" row with rank overlays
  - Fetch and display "New Releases" row from GET /api/content/new-releases via Retrofit
  - Fetch and display "Popular on the Platform" row from GET /api/content/popular via Retrofit
  - Fetch genres from GET /api/content/genres and display at least 4 genre-specific rows
  - Display "Because You Watched" rows based on viewing history
  - Implement D-pad navigation between rows and cards
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 7.3, 7.4_

- [ ] 54. Implement TV ContentCard component
  - Display poster image with lazy loading using Coil
  - Show shimmer skeleton while loading
  - Display 2px red focus ring with 8px border radius when focused
  - Open DetailView on select button press
  - No hover states (focus states only)
  - _Requirements: 7.2, 7.5, 22.1, 22.3_

- [ ] 55. Implement TV ContentRow component
  - Display row label with bold text
  - Render horizontal list of ContentCard components
  - Implement D-pad left and right navigation between cards within row
  - Implement lazy loading for cards
  - _Requirements: 4.1, 7.3_

- [ ] 56. Implement TV HeroBanner component
  - Fetch top 5 trending titles from GET /api/content/trending via Retrofit
  - Display backdrop image filling full width
  - Overlay title logo or name
  - Display short synopsis (truncate to 3 lines)
  - Add "Play" button and "More Info" button with focus states
  - Implement auto-rotation every 6 seconds with cross-fade transition
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_


### Phase 25: Android TV Application - Detail View

- [ ] 57. Implement TV DetailView screen
  - Display as dedicated full-screen view
  - Show backdrop image with trailer playing automatically on mute in loop
  - Overlay title logo or name in bottom-left of backdrop
  - Display "Play" button, "Add to My List" button, and Like/Dislike/Loved buttons below backdrop with focus states
  - Show year, maturity rating, duration or number of seasons, and genre tags
  - Display full synopsis text
  - Implement SeasonSelector and EpisodeList for TV shows with D-pad navigation
  - Display CastCarousel with D-pad left/right navigation
  - Display MoreLikeThis section with grid of similar titles and D-pad navigation
  - Add RatingWidget for star rating (1-5) with D-pad navigation
  - Ensure all focusable elements have visible 2px red focus ring
  - _Requirements: 11.1, 11.4, 11.5, 11.7, 11.8, 11.9, 11.10, 11.11, 11.12, 11.13, 11.14, 11.15, 11.16, 11.17, 11.18, 11.19, 7.2, 7.3, 7.4_


### Phase 26: Android TV Application - Video Player

- [ ] 58. Implement TV VideoPlayer component
  - Create full-screen player shell wrapping VidKing WebView
  - Display title and episode information in top-left corner
  - Display subtitle button, audio track button, quality button, and exit button in top-right corner with focus states
  - Display progress bar at bottom with elapsed and total duration
  - Allow scrubbing with D-pad left/right on progress bar
  - Display play/pause, seek back 10 seconds, seek forward 10 seconds buttons with focus states
  - Display volume control button with focus state
  - Fade out overlay after 3 seconds of inactivity
  - Fade in overlay on any D-pad button press
  - Display "Skip Intro" and "Skip Recap" buttons at appropriate timestamps with focus states
  - Display NextEpisodeCard with countdown timer when episode ends
  - Implement D-pad navigation between player controls
  - Write current timestamp and percentageWatched to POST /api/watch-progress every 10 seconds via Retrofit
  - Ensure all focusable elements have visible 2px red focus ring
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10, 12.11, 12.12, 12.13, 12.14, 12.15, 12.16, 10.1, 29.1, 29.2, 29.3, 29.5, 7.2, 7.3, 7.4_


### Phase 27: Android TV Application - Search, Browse, Watchlist, Settings, and Onboarding

- [ ] 59. Implement TV search screen
  - Display search input at top with D-pad navigation
  - Show trending searches row before user types
  - Show recent searches row from GET /api/searches via Retrofit before user types
  - Display search results with 300ms debounce as user types
  - Organize results into tabs for Movies, TV Shows, and People with D-pad navigation
  - Display filter chips for genre, content type, release year range, and rating threshold with D-pad navigation
  - Support voice search
  - Implement recent search management (add via POST /api/searches, dismiss via DELETE /api/searches/:query)
  - Ensure all focusable elements have visible 2px red focus ring
  - _Requirements: 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.11, 8.12, 7.2_

- [ ] 60. Implement TV browse screens
  - Create movies browse screen with infinite scroll grid and D-pad navigation
  - Create TV shows browse screen with infinite scroll grid and D-pad navigation
  - Create genre-specific browse screen with infinite scroll grid and D-pad navigation
  - Implement cursor-based pagination for infinite scroll
  - Display filter chips for genre, year, rating with D-pad navigation
  - Show empty state for no results
  - Ensure all focusable elements have visible 2px red focus ring
  - _Requirements: 24.1, 24.2, 8.12, 22.4, 7.2, 7.3, 7.4_

- [ ] 61. Implement TV watchlist and continue watching
  - Create My List screen displaying grid of watchlist items with D-pad navigation
  - Fetch data from GET /api/watchlist via Retrofit
  - Implement "Add to My List" button on ContentCard and DetailView with focus states
  - Toggle between "Add" and "Remove" states with animated checkmark
  - Call POST /api/watchlist on add, DELETE /api/watchlist/:contentId on remove via Retrofit
  - Display Continue Watching row on home screen
  - Implement "Remove from Continue Watching" action calling DELETE /api/watch-progress/:contentId via Retrofit
  - Display progress bar on DetailView for partially watched content
  - Ensure all focusable elements have visible 2px red focus ring
  - _Requirements: 9.1, 9.2, 9.4, 9.5, 9.6, 9.8, 10.2, 10.3, 10.5, 10.6, 7.2_

- [ ] 62. Implement TV settings screens
  - Create account settings screen with email and password change, D-pad navigation
  - Create playback settings screen with autoplay and data saver toggles, D-pad navigation
  - Create language settings screen with language and subtitle preferences, D-pad navigation
  - Create viewing activity screen with history log and remove option, D-pad navigation
  - Create subscription management screen (UI-only), D-pad navigation
  - Implement sign out and sign out of all devices functionality
  - Ensure all focusable elements have visible 2px red focus ring
  - _Requirements: 18.1, 18.2, 18.4, 18.5, 18.6, 18.8, 18.9, 18.10, 18.11, 18.12, 18.13, 18.14, 18.15, 18.16, 7.2_

- [ ] 63. Implement TV onboarding flow
  - Create onboarding screen with three informational slides and D-pad navigation
  - Create GenrePicker screen requiring at least 3 genre selections with D-pad navigation
  - Save selections to profile preferences via PATCH /api/profiles/:id via Retrofit
  - Use genre selections to personalize home screen
  - Ensure all focusable elements have visible 2px red focus ring
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 14.10, 14.11, 7.2_

- [ ] 64. Final checkpoint - Ensure all three applications are complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout the implementation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All three applications are completely isolated with no shared code
- The Next.js web application contains both frontend and backend (API routes)
- Mobile and TV applications consume the Next.js backend API via HTTP
- All applications implement the same Netflix-style design language independently
- TypeScript is used for web and mobile, Kotlin for TV
- All applications use the same external services: Auth0/Clerk, MongoDB, TMDB API, Resend, VidKing

