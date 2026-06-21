// TMDB API Types

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
  video: boolean;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  popularity: number;
}

export interface TMDBMovieDetails extends TMDBMovie {
  runtime: number | null;
  status: string;
  tagline: string;
  genres: TMDBGenre[];
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  spoken_languages: TMDBSpokenLanguage[];
  budget: number;
  revenue: number;
  imdb_id: string | null;
  homepage: string | null;
}

export interface TMDBTVDetails extends TMDBTVShow {
  created_by: TMDBCreator[];
  episode_run_time: number[];
  genres: TMDBGenre[];
  homepage: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: TMDBEpisode | null;
  next_episode_to_air: TMDBEpisode | null;
  networks: TMDBNetwork[];
  number_of_episodes: number;
  number_of_seasons: number;
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  seasons: TMDBSeason[];
  spoken_languages: TMDBSpokenLanguage[];
  status: string;
  tagline: string;
  type: string;
}

export interface TMDBSeason {
  air_date: string | null;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
}

export interface TMDBSeasonDetails extends TMDBSeason {
  _id: string;
  episodes: TMDBEpisode[];
}

export interface TMDBEpisode {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number | null;
  season_number: number;
  show_id: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  crew: TMDBCrewMember[];
  guest_stars: TMDBCastMember[];
}

export interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for: (TMDBMovie | TMDBTVShow)[];
  popularity: number;
  adult: boolean;
  gender: number;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  cast_id: number;
  credit_id: string;
  gender: number | null;
  known_for_department: string;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
  credit_id: string;
  gender: number | null;
}

export interface TMDBCredits {
  id: number;
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBVideo {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: 'Trailer' | 'Teaser' | 'Clip' | 'Featurette' | 'Behind the Scenes' | 'Bloopers';
  official: boolean;
  published_at: string;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TMDBProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TMDBSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TMDBCreator {
  id: number;
  credit_id: string;
  name: string;
  gender: number;
  profile_path: string | null;
}

export interface TMDBNetwork {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TMDBTrendingResponse {
  page: number;
  results: (TMDBMovie | TMDBTVShow)[];
  total_pages: number;
  total_results: number;
}

export interface TMDBSearchResponse {
  page: number;
  results: (TMDBMovie | TMDBTVShow | TMDBPerson)[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenreListResponse {
  genres: TMDBGenre[];
}

export interface TMDBVideosResponse {
  id: number;
  results: TMDBVideo[];
}

// Application-level types (parsed from TMDB)

export interface Content {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
}

export interface ContentDetails extends Content {
  runtime?: number;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  status: string;
  tagline: string;
  genres: Genre[];
  cast: CastMember[];
  crew: CrewMember[];
  videos: Video[];
  recommendations: Content[];
  similar: Content[];
  seasons?: Season[];
}

export interface Season {
  seasonNumber: number;
  name: string;
  overview: string;
  posterPath: string | null;
  airDate: string | null;
  episodeCount: number;
  episodes?: Episode[];
}

export interface Episode {
  episodeNumber: number;
  seasonNumber: number;
  name: string;
  overview: string;
  stillPath: string | null;
  airDate: string;
  runtime: number | null | undefined;
  voteAverage: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profilePath: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: 'Trailer' | 'Teaser' | 'Clip' | 'Featurette' | 'Behind the Scenes' | 'Bloopers';
  official: boolean;
}

export interface Person {
  id: number;
  name: string;
  profilePath: string | null;
  knownFor: Content[];
}

export interface SearchFilters {
  type?: 'movie' | 'tv' | 'person';
  genres?: number[];
  yearRange?: { min: number; max: number };
  minRating?: number;
}

export interface SearchResults {
  movies: Content[];
  tvShows: Content[];
  people: Person[];
  totalResults: number;
}
