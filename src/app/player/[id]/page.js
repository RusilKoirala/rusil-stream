"use client";
import React from "react";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "../../../components/Loading";
import Logo from "../../../components/Logo";

export default function PlayerPage(props) {
  const params =
    typeof React.use === "function" && typeof props.params?.then === "function"
      ? React.use(props.params)
      : props.params;
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const router = useRouter();
  const profileIdRef = React.useRef(null);
  const controlsTimeoutRef = React.useRef(null);

  useEffect(() => {
    if (!params?.id) return;
    
    async function init() {
      try {
        const profileId = localStorage.getItem("selectedProfileId");
        if (!profileId) {
          router.replace("/profiles");
          return;
        }
        profileIdRef.current = profileId;

        const [movieRes, savedRes] = await Promise.all([
          fetch(`/api/movies?id=${params.id}`),
          fetch(`/api/saved?profileId=${profileId}`)
        ]);

        const movieData = await movieRes.json();
        setMovie(movieData);

        // Fetch similar movies
        if (movieData.genres && movieData.genres.length > 0) {
          const genreId = movieData.genres[0].id;
          const similarRes = await fetch(`/api/movies?genre=${genreId}`);
          const similarData = await similarRes.json();
          setSimilar(similarData.results?.filter(m => m.id !== parseInt(params.id)).slice(0, 12) || []);
        }

        if (savedRes.ok) {
          const { saved } = await savedRes.json();
          setIsSaved(saved.some(s => s.movieId === parseInt(params.id)));
        }

        // Record watch start
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId,
            movieId: parseInt(params.id),
            movieTitle: movieData.title,
            posterPath: movieData.poster_path,
            lastPositionSec: 0,
            durationSec: 0
          })
        });

        setLoading(false);
      } catch (error) {
        console.error("Player init error:", error);
        setLoading(false);
      }
    }

    init();

    // Update watch progress every 30 seconds
    const interval = setInterval(() => {
      if (profileIdRef.current) {
        updateWatchProgress();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [params?.id, router]);

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  async function updateWatchProgress() {
    try {
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profileIdRef.current,
          movieId: parseInt(params.id),
          movieTitle: movie?.title,
          posterPath: movie?.poster_path,
          lastPositionSec: 0,
          durationSec: 0
        })
      });
    } catch (error) {
      console.error("Failed to update watch progress:", error);
    }
  }

  async function toggleSaved() {
    if (!profileIdRef.current) return;

    try {
      if (isSaved) {
        await fetch(`/api/saved?profileId=${profileIdRef.current}&movieId=${params.id}`, {
          method: "DELETE"
        });
        setIsSaved(false);
      } else {
        await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId: profileIdRef.current,
            movieId: parseInt(params.id),
            movieTitle: movie?.title,
            posterPath: movie?.poster_path
          })
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Failed to toggle saved:", error);
    }
  }

  if (!params?.id) return notFound();
  if (loading) return <Loading />;
  if (!movie) return notFound();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Premium Navbar - Only visible when controls shown */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showControls ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => router.push("/home")}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition group"
            >
              <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-lg font-medium">Back</span>
            </button>
            <Logo className="text-2xl" />
            <div className="w-20" />
          </div>
        </div>
      </nav>

      {/* Video Player */}
      <div className="relative w-full aspect-video bg-black">
        <iframe
          src={`https://vidsrc.to/embed/movie/${params.id}`}
          allowFullScreen
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        />
      </div>

      {/* Movie Details Section */}
      <div className="relative">
        {/* Backdrop gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-[#0a0a0a] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12">
          {/* Title and Actions */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {movie.release_date && (
                <span className="text-gray-400 text-lg">{movie.release_date.slice(0, 4)}</span>
              )}
              {movie.runtime && (
                <span className="text-gray-400 text-lg">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
              )}
              {movie.vote_average && (
                <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-yellow-500 font-semibold">{movie.vote_average.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={toggleSaved}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  isSaved
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                }`}
              >
                <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>{isSaved ? "In My List" : "Add to My List"}</span>
              </button>
              
              <button className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Overview and Details Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-3">Overview</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                {movie.overview || "No description available."}
              </p>
            </div>
            
            <div className="space-y-4">
              {movie.genres && movie.genres.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span key={genre.id} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {movie.production_companies && movie.production_companies.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Production</h3>
                  <p className="text-gray-300 text-sm">
                    {movie.production_companies.slice(0, 2).map(c => c.name).join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* More Like This */}
          {similar.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">More Like This</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {similar.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => router.push(`/player/${movie.id}`)}
                    className="group relative aspect-[2/3] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-sm font-semibold line-clamp-2">{movie.title}</h3>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
