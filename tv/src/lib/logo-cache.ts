import { getContentLogoPath } from '@/lib/api';

const logoCache = new Map<string, string | null>();
const inFlight = new Map<string, Promise<string | null>>();

export async function getCachedContentLogo(id: number, type: 'movie' | 'tv'): Promise<string | null> {
  const key = `${type}:${id}`;
  if (logoCache.has(key)) {
    return logoCache.get(key) ?? null;
  }

  const pending = inFlight.get(key);
  if (pending) return pending;

  const request = getContentLogoPath(id, type)
    .then((logoPath) => {
      logoCache.set(key, logoPath);
      return logoPath;
    })
    .catch(() => {
      logoCache.set(key, null);
      return null;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
}
