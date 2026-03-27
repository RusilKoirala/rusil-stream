/**
 * Stream proxy — fetches vidsrc embed, extracts inner iframe, strips ads.
 */
import { NextResponse } from 'next/server';

const PROVIDERS = [
  {
    name: 'vidsrc.xyz',
    movie: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    name: 'vidsrc.in',
    movie: (id) => `https://vidsrc.in/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.in/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    name: 'vidsrc.pm',
    movie: (id) => `https://vidsrc.pm/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.pm/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    name: 'vidsrc.lol',
    movie: (id) => `https://vidsrc.lol/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.lol/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
];

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

function buildPlayerPage(src) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Player</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    iframe { width: 100%; height: 100%; border: none; display: block; }
  </style>
  <script>
    window.open = function() { return null; };
    window.alert = function() {};
    window.confirm = function() { return false; };
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
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Provider returned ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();

    // Extract inner iframe
    const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/i);
    const iframeSrc = iframeMatch ? iframeMatch[1] : embedUrl;

    const responseHtml = buildPlayerPage(iframeSrc);

    return new NextResponse(responseHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Provider': provider.name,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error(`Proxy error:`, err.message);
    return NextResponse.json(
      { error: 'Failed to fetch stream' },
      { status: 502 }
    );
  }
}
