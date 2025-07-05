// src/app/api/movies/route.js
import fetch from 'node-fetch';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const apiKey = process.env.TMDB_API_KEY;
  let url;
  // If query is a number, fetch by movie ID
  if (query && /^\d+$/.test(query)) {
    url = `https://api.themoviedb.org/3/movie/${query}?api_key=${apiKey}`;
  } else if (query) {
    url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
  } else {
    url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;
  }
  const res = await fetch(url);
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
