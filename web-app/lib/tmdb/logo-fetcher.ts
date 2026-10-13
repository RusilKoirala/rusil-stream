// This module only ever runs on the server (route handlers + parsers), so prefer
// the secret key. Reading NEXT_PUBLIC_* alone silently produced label-less
// backdrops in production whenever only TMDB_API_KEY was configured.
const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

let missingKeyWarned = false;

async function fetchWithRetry(url: string, retries = 2, timeout = 5000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, { 
        signal: controller.signal,
        next: { revalidate: 3600 } // Cache for 1 hour
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
}

export async function fetchBackdropWithLogo(mediaType: 'movie' | 'tv', id: number): Promise<string | null> {
  if (!TMDB_API_KEY) {
    if (!missingKeyWarned) {
      missingKeyWarned = true;
      console.error(
        '[tmdb] No TMDB API key configured (TMDB_API_KEY / NEXT_PUBLIC_TMDB_API_KEY). ' +
        'English logo backdrops are disabled — falling back to plain backdrops.'
      );
    }
    return null;
  }

  try {
    const response = await fetchWithRetry(
      `${TMDB_BASE_URL}/${mediaType}/${id}/images?api_key=${TMDB_API_KEY}&include_image_language=en,null`,
      2,
      5000
    );
    
    if (!response.ok) {
      console.warn(`[tmdb] Logo backdrop request failed for ${mediaType}/${id}: HTTP ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Get backdrops, prioritize English ones (they often have logos)
    const backdrops = data.backdrops || [];
    if (backdrops.length === 0) return null;
    
    // Find English backdrop first (more likely to have logo)
    const enBackdrop = backdrops.find((backdrop: any) => backdrop.iso_639_1 === 'en');
    const backdrop = enBackdrop || backdrops[0];
    
    return `https://image.tmdb.org/t/p/w780${backdrop.file_path}`;
  } catch (error) {
    // Non-critical: the caller falls back to the default backdrop from the main
    // API response. Log once per failure so this never fails silently again.
    console.warn(
      `[tmdb] Logo backdrop fetch error for ${mediaType}/${id}:`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

export async function fetchBackdropsForItems(
  items: Array<{ id: number; mediaType?: 'movie' | 'tv' }>,
  defaultMediaType: 'movie' | 'tv' = 'movie'
): Promise<Array<string | null>> {
  const backdropPromises = items.map(item => 
    fetchBackdropWithLogo(item.mediaType || defaultMediaType, item.id)
  );
  return Promise.all(backdropPromises);
}
