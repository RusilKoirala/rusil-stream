// Movie details/search page
import { notFound } from "next/navigation";
import Image from "next/image";

async function getMovie(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/movies?query=${id}`);
  const data = await res.json();
  return data.results && data.results.length > 0 ? data.results[0] : null;
}

export default async function MoviePage({ params }) {
  const movie = await getMovie(params.id);
  if (!movie) return notFound();
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-[#141414] text-white flex flex-col items-center justify-center p-8">
      <Image src="/logo/logo.png" alt="Rusil Stream Logo" width={180} height={50} />
      <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="rounded-lg shadow-2xl mb-6 max-w-xs" />
      <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
      <p className="text-lg text-gray-300 mb-4">{movie.overview}</p>
      <p className="text-md text-gray-400">Release: {movie.release_date}</p>
      <a href={`/player/${movie.id}`} className="mt-6 bg-[#E50914] text-white px-8 py-3 rounded-lg font-bold text-xl shadow-lg hover:bg-[#b0060f] transition">Watch Now</a>
    </div>
  );
}
