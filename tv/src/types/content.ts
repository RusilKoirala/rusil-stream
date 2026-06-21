export type ContentType = 'movie' | 'tv';

export interface Content {
  id: number;
  type: ContentType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
  progressPercentage?: number;
  lastWatchedAt?: string;
}

export interface ContentDetails extends Content {
  runtime?: number;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  status: string;
  tagline: string;
  genres: Array<{ id: number; name: string }>;
  cast: Array<{ id: number; name: string; character: string; profilePath: string | null }>;
  videos: Array<{ id: string; key: string; name: string; site: string; type: string }>;
  recommendations: Content[];
  similar: Content[];
}

export interface SearchResults {
  movies: Content[];
  tvShows: Content[];
  people: Array<{ id: number; name: string }>;
  totalResults: number;
}
