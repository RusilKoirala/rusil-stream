/**
 * Shared JSDoc type definitions for @streaming-app/shared
 */

/**
 * @typedef {Object} Movie
 * @property {number} id
 * @property {string} title
 * @property {string} overview
 * @property {string} posterPath
 * @property {string} backdropPath
 * @property {string} releaseDate
 * @property {number} voteAverage
 * @property {number[]} genreIds
 */

/**
 * @typedef {Object} TVShow
 * @property {number} id
 * @property {string} name
 * @property {string} overview
 * @property {string} posterPath
 * @property {string} backdropPath
 * @property {string} firstAirDate
 * @property {number} voteAverage
 * @property {number[]} genreIds
 */

/**
 * @typedef {Object} Episode
 * @property {number} id
 * @property {string} name
 * @property {string} overview
 * @property {string} stillPath
 * @property {number} episodeNumber
 * @property {number} seasonNumber
 * @property {string} airDate
 */

/**
 * @typedef {Object} Profile
 * @property {string} _id
 * @property {string} name
 * @property {string} avatar
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {Profile[]} profiles
 */

/**
 * @typedef {Object} SavedItem
 * @property {string} movieId
 * @property {string} movieTitle
 * @property {string} posterPath
 * @property {string} addedAt
 */

/**
 * @typedef {Object} HistoryItem
 * @property {string} movieId
 * @property {string} movieTitle
 * @property {string} posterPath
 * @property {string} lastPlayedAt
 * @property {number} watchedPercentage
 * @property {string} status
 */
