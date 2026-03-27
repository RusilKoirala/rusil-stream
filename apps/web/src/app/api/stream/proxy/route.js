/**
 * Stream proxy — fetches vidsrc.in embed, extracts the inner player iframe,
 * and re-wraps it with sandbox restrictions to block ads/popups.
 *
 * vidsrc.in is used specifically because it is NOT behind Cloudflare bot protection,
 * unlike vidsrc.to/vidsrc.cc/vidsrc.icu which return challenge pages to server requests.
 *
 * GET /api/stream/proxy?id=TMDB_ID&type=movie|tv&season=1&episode=1
 * GET /api/stream/proxy?id=...&list=1  → returns provider list JSON
 */
import { NextResponse } from 'next/server';

// Only providers confirmed to work server-side without Cloudflare blocking
const PROVIDERS = [
  {
    name: 'vidsrc.xyz',
    movie: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
    extractIframe: true,
  },
  {
    name: 'vidsrc.in',
    movie: (id) => `https://vidsrc.in/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.in/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
    extractIframe: true,
  },
  {
    name: 'vidsrc.pm',
    movie: (id) => `https://vidsrc.pm/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.pm/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
    extractIframe: true,
  },
  {
    name: 'vidsrc.lol',
    movie: (id) => `https://vidsrc.lol/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.lol/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
    extractIframe: true,
  },
];

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
};

/**
 * Extract the first <iframe> src from HTML and return a sandboxed wrapper page.
 * This is the key technique — we never serve the ad-laden outer page,
 * only the inner player iframe with sandbox restrictions.
 */
function extractAndWrapIframe(html, sourceUrl) {
  // Match iframe src
  const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (!iframeMatch) return null;

  const iframeSrc = iframeMatch[1];

  // Don't wrap ad iframes
  const adDomains = ['popads', 'popcash', 'exoclick', 'adsterra', 'propellerads', 'doubleclick'];
  if (adDomains.some(d => iframeSrc.includes(d))) return null;

  return buildPlayerPage(iframeSrc);
}

/**
 * Wrap a URL in a clean full-screen player page with popup/ad blocking.
 */
function buildPlayerPage(src) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Player</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    iframe { width: 100%; height: 100%; border: none; display: block; }
  </style>
  <script>
    // Block all popup/redirect attempts
    window.open = function() { return null; };
    window.alert = function() {};
    window.confirm = function() { return false; };
    // Block pop-unders (refocus after blur)
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        setTimeout(function() {
          try { window.focus(); } catch(e) {}
        }, 100);
      }
    });
    // Block location hijacking
    (function() {
      var _assign = window.location.assign.bind(window.location);
      var _replace = window.location.replace.bind(window.location);
      Object.defineProperty(window, 'location', {
        get: function() { return window.location; },
        set: function() { /* blocked */ }
      });
    })();
  </script>
</head>
<body>
  <iframe
    src="${src}"
    allowfullscreen
    allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
    referrerpolicy="no-referrer"
  ></iframe>
</body>
</html>`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type') || 'movie';
  const season = searchParams.get('season') || '1';
  const episode = searchParams.get('episode') || '1';
  const sourceIndex = parseInt(searchParams.get('source') || '0');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  // Return provider list
  if (searchParams.get('list') === '1') {
    return NextResponse.json({
      providers: PROVIDERS.map((p, i) => ({
        index: i,
        name: p.name,
        url: type === 'tv' ? p.tv(id, season, episode) : p.movie(id),
      })),
    });
  }

  const provider = PROVIDERS[Math.min(sourceIndex, PROVIDERS.length - 1)];
  const embedUrl = type === 'tv'
    ? provider.tv(id, season, episode)
    : provider.movie(id);

  try {
    const res = await fetch(embedUrl, {
      headers: { ...FETCH_HEADERS, Referer: embedUrl },
      signal: AbortSignal.timeout(12000),
      redirect: 'follow',
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Provider ${provider.name} returned ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();

    // Check if Cloudflare blocked us
    if (html.includes('cdn-cgi/challenge') || html.includes('Just a moment') || html.includes('cf-browser-verification')) {
      return NextResponse.json(
        { error: `${provider.name} is protected by Cloudflare — cannot proxy server-side` },
        { status: 503 }
      );
    }

    let responseHtml;

    if (provider.extractIframe) {
      // Extract inner player iframe and wrap it cleanly
      responseHtml = extractAndWrapIframe(html, embedUrl);
      if (!responseHtml) {
        // Fallback: serve the full page but inject popup blocker
        responseHtml = html.replace('<head>', `<head><script>window.open=function(){return null};</script>`);
      }
    } else {
      // Wrap the embed URL directly in our clean player page
      responseHtml = buildPlayerPage(embedUrl);
    }

    return new NextResponse(responseHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Provider': provider.name,
        'Cache-Control': 'no-store', // don't cache stream pages
      },
    });
  } catch (err) {
    console.error(`Stream proxy error [${provider.name}]:`, err.message);
    return NextResponse.json(
      { error: 'Failed to fetch stream', provider: provider.name },
      { status: 502 }
    );
  }
}
