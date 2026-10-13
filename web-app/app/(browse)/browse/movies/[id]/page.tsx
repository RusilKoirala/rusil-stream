import { VidriftPlayer } from '@/components/player/vidrift-player';
import Image from 'next/image';
import { FiPlay, FiPlus, FiShare2 } from 'react-icons/fi';

async function getMovieDetails(id: string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) {
    return {
      id,
      title: 'Movie Not Found',
      overview: '',
      backdrop_path: '',
      poster_path: '',
      vote_average: 0,
      release_date: '',
      runtime: 0,
      genres: [],
    };
  }
  return res.json();
}

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = await getMovieDetails(id);

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Background Backdrop */}
      {movie.backdrop_path && (
        <div className="absolute inset-0 h-screen">
          <Image
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black" />
        </div>
      )}

      {/* Content */}
      <div className="relative container mx-auto px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Player */}
          <div className="mb-8">
            <VidriftPlayer tmdbId={id} type="movie" title={movie.title} autoPlay={false} />
          </div>

          {/* Movie Info */}
          <div className="flex gap-8">
            {/* Poster */}
            {movie.poster_path && (
              <div className="flex-shrink-0 w-48 hidden md:block">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  width={192}
                  height={288}
                  className="rounded-lg"
                />
              </div>
            )}

            {/* Details */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-4">{movie.title}</h1>

              <div className="flex items-center gap-4 text-white/70 mb-6">
                {movie.release_date && (
                  <>
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                    <span>•</span>
                  </>
                )}
                {movie.runtime > 0 && (
                  <>
                    <span>{movie.runtime} min</span>
                    <span>•</span>
                  </>
                )}
                <span className="flex items-center gap-1">
                  ★ {movie.vote_average.toFixed(1)}
                </span>
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="flex gap-3 mb-6">
                  {movie.genres.map((genre: any) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-lg text-white/80 mb-8 leading-relaxed">{movie.overview}</p>

              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-white/90 transition">
                  <FiPlay />
                  Watch Now
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition border border-white/20">
                  <FiPlus />
                  My List
                </button>
                <button className="p-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition border border-white/20">
                  <FiShare2 />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
