type TmdbSize = 'w342' | 'w500' | 'w780' | 'w1280' | 'original';

const SIZE_BY_WIDTH: Record<number, TmdbSize> = {
  342: 'w342',
  500: 'w500',
  780: 'w780',
  1280: 'w1280',
};

/** Unwrap wsrv.nl URLs to direct TMDB JPG — WebP proxy often fails on Android TV. */
export function resolveNativeImageUrl(
  url: string | null | undefined,
  preferredWidth: 342 | 500 | 780 | 1280 = 500,
): string | null {
  if (!url) return null;

  try {
    if (url.includes('wsrv.nl')) {
      const parsed = new URL(url);
      const inner = parsed.searchParams.get('url');
      if (inner) {
        const decoded = decodeURIComponent(inner);
        const size = SIZE_BY_WIDTH[preferredWidth] ?? 'w500';
        if (decoded.includes('/t/p/original/')) {
          return decoded.replace('/t/p/original/', `/t/p/${size}/`);
        }
        if (decoded.includes('/t/p/w')) {
          return decoded;
        }
        return decoded;
      }
    }

    if (url.includes('image.tmdb.org') && url.includes('/t/p/original/')) {
      const size = SIZE_BY_WIDTH[preferredWidth] ?? 'w500';
      return url.replace('/t/p/original/', `/t/p/${size}/`);
    }
  } catch {
    // fall through
  }

  return url;
}

export function posterUrl(url: string | null | undefined): string | null {
  return resolveNativeImageUrl(url, 500);
}

export function backdropUrl(url: string | null | undefined): string | null {
  return resolveNativeImageUrl(url, 1280);
}

export function logoUrl(url: string | null | undefined): string | null {
  return resolveNativeImageUrl(url, 780);
}
