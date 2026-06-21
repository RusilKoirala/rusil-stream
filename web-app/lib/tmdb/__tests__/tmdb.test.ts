// Basic TMDB Integration Tests

import { describe, it, expect } from '@jest/globals';
import {
  getOptimizedImageUrl,
  getTMDBImageUrl,
  parseTMDBMovie,
  parseTMDBTV,
  isTMDBMovie,
  isTMDBTV,
} from '../index';
import type { TMDBMovie, TMDBTVShow } from '../types';

describe('TMDB Image URL Transformation', () => {
  it('should generate optimized image URL with wsrv.nl', () => {
    const path = '/abc123.jpg';
    const width = 500;
    const result = getOptimizedImageUrl(path, width);

    expect(result).toContain('wsrv.nl');
    expect(result).toContain('w=500');
    expect(result).toContain('output=webp');
    expect(result).toContain(encodeURIComponent('https://image.tmdb.org/t/p/original/abc123.jpg'));
  });

  it('should return null for null path', () => {
    const result = getOptimizedImageUrl(null, 500);
    expect(result).toBeNull();
  });

  it('should generate direct TMDB image URL', () => {
    const path = '/abc123.jpg';
    const result = getTMDBImageUrl(path, 'w500');

    expect(result).toBe('https://image.tmdb.org/t/p/w500/abc123.jpg');
  });
});

describe('TMDB Response Parsing', () => {
  it('should parse TMDB movie correctly', () => {
    const tmdbMovie: TMDBMovie = {
      id: 550,
      title: 'Fight Club',
      original_title: 'Fight Club',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      overview: 'A movie about fighting',
      release_date: '1999-10-15',
      vote_average: 8.4,
      vote_count: 1000,
      genre_ids: [18, 53],
      adult: false,
      original_language: 'en',
      popularity: 100,
      video: false,
    };

    const result = parseTMDBMovie(tmdbMovie);

    expect(result.id).toBe(550);
    expect(result.type).toBe('movie');
    expect(result.title).toBe('Fight Club');
    expect(result.posterPath).toBe('/poster.jpg');
    expect(result.backdropPath).toBe('/backdrop.jpg');
    expect(result.overview).toBe('A movie about fighting');
    expect(result.releaseDate).toBe('1999-10-15');
    expect(result.voteAverage).toBe(8.4);
    expect(result.genreIds).toEqual([18, 53]);
  });

  it('should parse TMDB TV show correctly', () => {
    const tmdbTV: TMDBTVShow = {
      id: 1396,
      name: 'Breaking Bad',
      original_name: 'Breaking Bad',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      overview: 'A show about chemistry',
      first_air_date: '2008-01-20',
      vote_average: 9.0,
      vote_count: 2000,
      genre_ids: [18, 80],
      origin_country: ['US'],
      original_language: 'en',
      popularity: 200,
    };

    const result = parseTMDBTV(tmdbTV);

    expect(result.id).toBe(1396);
    expect(result.type).toBe('tv');
    expect(result.title).toBe('Breaking Bad');
    expect(result.posterPath).toBe('/poster.jpg');
    expect(result.backdropPath).toBe('/backdrop.jpg');
    expect(result.overview).toBe('A show about chemistry');
    expect(result.releaseDate).toBe('2008-01-20');
    expect(result.voteAverage).toBe(9.0);
    expect(result.genreIds).toEqual([18, 80]);
  });

  it('should identify TMDB movie vs TV show', () => {
    const movie: TMDBMovie = {
      id: 550,
      title: 'Fight Club',
      original_title: 'Fight Club',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      overview: 'A movie',
      release_date: '1999-10-15',
      vote_average: 8.4,
      vote_count: 1000,
      genre_ids: [18],
      adult: false,
      original_language: 'en',
      popularity: 100,
      video: false,
    };

    const tv: TMDBTVShow = {
      id: 1396,
      name: 'Breaking Bad',
      original_name: 'Breaking Bad',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      overview: 'A show',
      first_air_date: '2008-01-20',
      vote_average: 9.0,
      vote_count: 2000,
      genre_ids: [18],
      origin_country: ['US'],
      original_language: 'en',
      popularity: 200,
    };

    expect(isTMDBMovie(movie)).toBe(true);
    expect(isTMDBTV(movie)).toBe(false);
    expect(isTMDBMovie(tv)).toBe(false);
    expect(isTMDBTV(tv)).toBe(true);
  });
});

describe('TMDB Error Handling', () => {
  it('should throw descriptive error for invalid movie data', () => {
    const invalidMovie = { id: null } as any;

    expect(() => parseTMDBMovie(invalidMovie)).toThrow();
  });

  it('should throw descriptive error for invalid TV data', () => {
    const invalidTV = { id: null } as any;

    expect(() => parseTMDBTV(invalidTV)).toThrow();
  });
});
