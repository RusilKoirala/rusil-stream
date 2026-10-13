import {
  HeroSection,
  ContinueWatchingSection,
  ContentRow,
} from '@/components/home';

// Fetch functions - replace with real TMDB API calls
async function getTrendingContent() {
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/all/day?api_key=${process.env.TMDB_API_KEY}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

async function getPopularMovies() {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

async function getPopularTVShows() {
  const res = await fetch(
    `https://api.themoviedb.org/3/tv/popular?api_key=${process.env.TMDB_API_KEY}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

export default async function BrowsePage() {
  const [trending, movies, tvShows] = await Promise.all([
    getTrendingContent(),
    getPopularMovies(),
    getPopularTVShows(),
  ]);

  // Hero data - use first trending item
  const hero = trending[0] || {
    title: 'Matchbox',
    name: 'Matchbox',
    backdrop_path: '/xGexTKCJDkl12dTW4YCBDXWb1AD.jpg',
    overview: 'An action-packed thriller that will keep you on the edge of your seat.',
  };

  return (
    <div className="min-h-screen bg-black">
      <HeroSection
        title={hero.title || hero.name}
        backdrop={`https://image.tmdb.org/t/p/original${hero.backdrop_path}`}
        overview={hero.overview}
      />
      
      <div className="relative -mt-32 z-10">
        <ContinueWatchingSection />
        
        <ContentRow
          title="The Week's Most Watched"
          items={trending.slice(0, 10)}
          mediaType="movie"
          size="large"
        />
        
        <ContentRow
          title="Trending Now"
          items={movies.slice(0, 12)}
          mediaType="movie"
        />
        
        <ContentRow
          title="Popular TV Shows"
          items={tvShows.slice(0, 12)}
          mediaType="tv"
        />
      </div>
    </div>
  );
}
