// TMDB Response Parsing Functions

import type {
  TMDBMovie,
  TMDBTVShow,
  TMDBMovieDetails,
  TMDBTVDetails,
  TMDBPerson,
  TMDBSeason,
  TMDBSeasonDetails,
  TMDBEpisode,
  TMDBCastMember,
  TMDBCrewMember,
  TMDBVideo,
  TMDBGenre,
  Content,
  ContentDetails,
  Season,
  Episode,
  CastMember,
  CrewMember,
  Video,
  Genre,
  Person,
} from './types';
import { getOptimizedImageUrl } from './images';

/**
 * Parse TMDB movie to application Content format
 */
export function parseTMDBMovie(movie: TMDBMovie): Content {
  try {
    return {
      id: movie.id,
      type: 'movie',
      title: movie.title,
      posterPath: getOptimizedImageUrl(movie.poster_path, 500),
      backdropPath: getOptimizedImageUrl(movie.backdrop_path, 1280),
      overview: movie.overview,
      releaseDate: movie.release_date,
      voteAverage: movie.vote_average,
      genreIds: movie.genre_ids,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse TMDB movie (ID: ${movie?.id}): ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parse TMDB TV show to application Content format
 */
export function parseTMDBTV(tv: TMDBTVShow): Content {
  try {
    return {
      id: tv.id,
      type: 'tv',
      title: tv.name,
      posterPath: getOptimizedImageUrl(tv.poster_path, 500),
      backdropPath: getOptimizedImageUrl(tv.backdrop_path, 1280),
      overview: tv.overview,
      releaseDate: tv.first_air_date,
      voteAverage: tv.vote_average,
      genreIds: tv.genre_ids,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse TMDB TV show (ID: ${tv?.id}): ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parse TMDB movie details to application ContentDetails format
 */
export function parseTMDBMovieDetails(
  movie: TMDBMovieDetails,
  credits?: { cast: TMDBCastMember[]; crew: TMDBCrewMember[] },
  videos?: TMDBVideo[],
  recommendations?: TMDBMovie[],
  similar?: TMDBMovie[]
): ContentDetails {
  try {
    return {
      id: movie.id,
      type: 'movie',
      title: movie.title,
      posterPath: getOptimizedImageUrl(movie.poster_path, 500),
      backdropPath: getOptimizedImageUrl(movie.backdrop_path, 1280),
      overview: movie.overview,
      releaseDate: movie.release_date,
      voteAverage: movie.vote_average,
      genreIds: movie.genre_ids,
      runtime: movie.runtime ?? undefined,
      status: movie.status,
      tagline: movie.tagline,
      genres: movie.genres.map(parseTMDBGenre),
      cast: credits?.cast.map(parseTMDBCast) || [],
      crew: credits?.crew.map(parseTMDBCrew) || [],
      videos: videos?.map(parseTMDBVideo) || [],
      recommendations: recommendations?.map(parseTMDBMovie) || [],
      similar: similar?.map(parseTMDBMovie) || [],
    };
  } catch (error) {
    throw new Error(
      `Failed to parse TMDB movie details (ID: ${movie?.id}): ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parse TMDB TV details to application ContentDetails format
 */
export function parseTMDBTVDetails(
  tv: TMDBTVDetails,
  credits?: { cast: TMDBCastMember[]; crew: TMDBCrewMember[] },
  videos?: TMDBVideo[],
  recommendations?: TMDBTVShow[],
  similar?: TMDBTVShow[]
): ContentDetails {
  try {
    return {
      id: tv.id,
      type: 'tv',
      title: tv.name,
      posterPath: getOptimizedImageUrl(tv.poster_path, 500),
      backdropPath: getOptimizedImageUrl(tv.backdrop_path, 1280),
      overview: tv.overview,
      releaseDate: tv.first_air_date,
      voteAverage: tv.vote_average,
      genreIds: tv.genre_ids,
      numberOfSeasons: tv.number_of_seasons,
      numberOfEpisodes: tv.number_of_episodes,
      status: tv.status,
      tagline: tv.tagline,
      genres: tv.genres.map(parseTMDBGenre),
      cast: credits?.cast.map(parseTMDBCast) || [],
      crew: credits?.crew.map(parseTMDBCrew) || [],
      videos: videos?.map(parseTMDBVideo) || [],
      recommendations: recommendations?.map(parseTMDBTV) || [],
      similar: similar?.map(parseTMDBTV) || [],
      seasons: tv.seasons.map(parseTMDBSeason),
    };
  } catch (error) {
    throw new Error(
      `Failed to parse TMDB TV details (ID: ${tv?.id}): ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parse TMDB season to application Season format
 */
export function parseTMDBSeason(season: TMDBSeason): Season {
  try {
    return {
      seasonNumber: season.season_number,
      name: season.name,
      overview: season.overview,
      posterPath: getOptimizedImageUrl(season.poster_path, 342),
      airDate: season.air_date,
      episodeCount: season.episode_count,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse TMDB season (Season: ${season?.season_number}): ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parse TMDB season details with episodes
 */
export function parseTMDBSeasonDetails(seasonDetails: TMDBSeasonDetails): Season {
  try {
    return {
      seasonNumber: seasonDetails.season_number,
      name: seasonDetails.name,
      overview: seasonDetails.overview,
      posterPath: getOptimizedImageUrl(seasonDetails.poster_path, 342),
      airDate: seasonDetails.air_date,
      episodeCount: seasonDetails.episode_count,
      episodes: seasonDetails.episodes.map(parseTMDBEpisode),
    };
  } catch (error) {
    throw new Error(
      `Failed to parse TMDB season details (Season: ${seasonDetails?.season_number}): ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parse TMDB episode to application Episode format
 */
export function parseTMDBEpisode(episode: TMDBEpisode): Episode {
  try {
    return {
      episodeNumber: episode.episode_number,
      seasonNumber: episode.season_number,
      name: episode.name,
      overview: episode.overview,
      stillPath: getOptimizedImageUrl(episode.still_path, 780),
      airDate: episode.air_date,
      runtime: episode.runtime ?? undefined,
      voteAverage: episode.vote_average,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse TMDB episode (S${episode?.season_number}E${episode?.episode_number}): ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parse TMDB person to application Person format
 */
export function parseTMDBPerson(person: TMDBPerson): Person {
  try {
    return {
      id: person.id,
      name: person.name,
      profilePath: getOptimizedImageUrl(person.profile_path, 342),
      knownFor: person.known_for.map((item) => {
        if ('title' in item) {
          return parseTMDBMovie(item as TMDBMovie);
        } else {
          return parseTMDBTV(item as TMDBTVShow);
        }
      }),
    };
  } catch (error) {
    throw new Error(
      `Failed to parse TMDB person (ID: ${person?.id}): ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parse TMDB cast member
 */
export function parseTMDBCast(cast: TMDBCastMember): CastMember {
  try {
    return {
      id: cast.id,
      name: cast.name,
      character: cast.character,
      profilePath: getOptimizedImageUrl(cast.profile_path, 342),
      order: cast.order,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse TMDB cast member (ID: ${cast?.id}): ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parse TMDB crew member
 */
export function parseTMDBCrew(crew: TMDBCrewMember): CrewMember {
  try {
    return {
      id: crew.id,
      name: crew.name,
      job: crew.job,
      department: crew.department,
      profilePath: getOptimizedImageUrl(crew.profile_path, 342),
    };
  } catch (error) {
    throw new Error(
      `Failed to parse TMDB crew member (ID: ${crew?.id}): ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parse TMDB video
 */
export function parseTMDBVideo(video: TMDBVideo): Video {
  try {
    return {
      id: video.id,
      key: video.key,
      name: video.name,
      site: video.site,
      type: video.type,
      official: video.official,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse TMDB video (ID: ${video?.id}): ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parse TMDB genre
 */
export function parseTMDBGenre(genre: TMDBGenre): Genre {
  try {
    return {
      id: genre.id,
      name: genre.name,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse TMDB genre (ID: ${genre?.id}): ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Determine if a TMDB result is a movie
 */
export function isTMDBMovie(item: TMDBMovie | TMDBTVShow): item is TMDBMovie {
  return 'title' in item;
}

/**
 * Determine if a TMDB result is a TV show
 */
export function isTMDBTV(item: TMDBMovie | TMDBTVShow): item is TMDBTVShow {
  return 'name' in item && !('title' in item);
}

/**
 * Parse mixed TMDB content (movie or TV)
 */
export function parseTMDBContent(item: TMDBMovie | TMDBTVShow): Content {
  try {
    if (isTMDBMovie(item)) {
      return parseTMDBMovie(item);
    } else {
      return parseTMDBTV(item);
    }
  } catch (error) {
    throw new Error(
      `Failed to parse TMDB content: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
