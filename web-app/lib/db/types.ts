/**
 * MongoDB Collection Types
 * 
 * TypeScript interfaces for all MongoDB collections used in the streaming platform.
 * These types match the data models specified in the design document.
 */

/**
 * Profile document stored in the 'profiles' collection
 */
export interface Profile {
  _id?: string
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

/**
 * Notification preferences embedded in Profile document
 */
export interface NotificationPreferences {
  enabled: boolean
  newReleases: boolean
  watchlistUpdates: boolean
  recommendedContent: boolean
  episodeReminders: boolean
}

/**
 * Profile preferences embedded in Profile document
 */
export interface ProfilePreferences {
  autoplayNextEpisode: boolean
  autoplayPreviews: boolean
  dataSaverMode: boolean
  subtitleLanguage: string
  audioLanguage: string
  selectedGenres: number[] // TMDB genre IDs
  notifications: NotificationPreferences
}

/**
 * Watch progress document stored in the 'watchHistory' collection
 */
export interface WatchProgress {
  _id?: string
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

/**
 * Watchlist item document stored in the 'watchlists' collection
 */
export interface WatchlistItem {
  _id?: string
  profileId: string
  contentId: number
  contentType: 'movie' | 'tv'
  addedAt: Date
}

/**
 * Rating document stored in the 'ratings' collection
 */
export interface Rating {
  _id?: string
  profileId: string
  contentId: number
  contentType: 'movie' | 'tv'
  rating: number // 1-5
  createdAt: Date
}

/**
 * Recent search document stored in the 'recentSearches' collection
 */
export interface RecentSearch {
  _id?: string
  profileId: string
  query: string
  timestamp: Date
}

/**
 * Notification document stored in the 'notifications' collection
 */
export interface Notification {
  _id?: string
  userId: string
  profileId: string
  type: 'new_release' | 'watchlist_update' | 'recommended' | 'episode_reminder'
  title: string
  message: string
  contentId: number
  contentType: 'movie' | 'tv'
  contentTitle: string
  contentPosterPath?: string
  read: boolean
  createdAt: Date
  expiresAt: Date // Auto-delete after 30 days
}
