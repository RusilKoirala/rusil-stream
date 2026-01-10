// Movie details/search page
import { notFound } from "next/navigation";
import Image from "next/image";
import MovieShareClient from "@/components/MovieShareClient";

async function getMovie(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/movies?query=${id}`);
  const data = await res.json();
  return data.results && data.results.length > 0 ? data.results[0] : null;
}

// Dynamic metadata for social sharing
export async function generateMetadata({ params }) {
  const movie = await getMovie(params.id);
  
  if (!movie) {
    return {
      title: "Movie Not Found - Rusil Stream",
      description: "The movie you're looking for could not be found."
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const movieUrl = `${appUrl}/movie/${params.id}`;
  const posterImage = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : `${appUrl}/logo/logo.png`;

  return {
    title: `${movie.title} - Watch on Rusil Stream`,
    description: movie.overview || `Watch ${movie.title} on Rusil Stream. Free streaming platform for movies and TV shows.`,
    openGraph: {
      type: "video.movie",
      locale: "en_US",
      url: movieUrl,
      title: movie.title,
      description: movie.overview || `Watch ${movie.title} on Rusil Stream`,
      siteName: "Rusil Stream",
      images: [
        {
          url: posterImage,
          width: 500,
          height: 750,
          alt: movie.title,
          type: "image/jpeg"
        }
      ],
      releaseDate: movie.release_date,
      videos: [
        {
          url: `${appUrl}/player/${movie.id}`,
          type: "application/x-shockwave-flash"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: movie.title,
      description: movie.overview || `Watch ${movie.title} on Rusil Stream`,
      images: [posterImage],
      creator: "@rusilstream"
    },
    icons: {
      icon: "/logo/logo.png"
    }
  };
}

export default async function MoviePage({ params }) {
  const movie = await getMovie(params.id);
  if (!movie) return notFound();
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const shareUrl = `${appUrl}/movie/${params.id}`;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-[#141414] text-white flex flex-col items-center justify-center p-8">
      <Image src="/logo/logo.png" alt="Rusil Stream Logo" width={180} height={50} />
      <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="rounded-lg shadow-2xl mb-6 max-w-xs" />
      <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
      <p className="text-lg text-gray-300 mb-4">{movie.overview}</p>
      <p className="text-md text-gray-400">Release: {movie.release_date}</p>
      
      <div className="flex gap-4 mt-6">
        <a href={`/player/${movie.id}`} className="bg-[#E50914] text-white px-8 py-3 rounded-lg font-bold text-xl shadow-lg hover:bg-[#b0060f] transition">Watch Now</a>
        <MovieShareClient url={shareUrl} title={movie.title} />
      </div>
    </div>
  );
}
