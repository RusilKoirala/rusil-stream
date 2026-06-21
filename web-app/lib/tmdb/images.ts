/**
 * Build optimized image URL using wsrv.nl proxy.
 */
export function getOptimizedImageUrl(
  tmdbPath: string | null,
  width: number
): string | null {
  if (!tmdbPath) return null;

  const imagePath = tmdbPath.startsWith('/') ? tmdbPath : `/${tmdbPath}`;
  const source = `https://image.tmdb.org/t/p/original${imagePath}`;
  return `https://wsrv.nl/?url=${encodeURIComponent(source)}&w=${width}&output=webp`;
}

/**
 * Build direct TMDB image URL (fallback).
 */
export function getTMDBImageUrl(
  tmdbPath: string | null,
  size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'original'
): string | null {
  if (!tmdbPath) return null;
  const imagePath = tmdbPath.startsWith('/') ? tmdbPath : `/${tmdbPath}`;
  return `https://image.tmdb.org/t/p/${size}${imagePath}`;
}
