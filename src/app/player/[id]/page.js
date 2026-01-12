"use client";
import React from "react";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "../../../components/Loading";
import Logo from "../../../components/Logo";
import MovieShareClient from "../../../components/MovieShareClient";

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
      {/* Minimal Navbar - Only visible on hover */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        <div className="bg-gradient-to-b from-black/95 via-black/70 to-transparent backdrop-blur-md">
          <div className="flex items-center justify-between px-4 md:px-8 py-3">
            <button
              onClick={() => router.push("/home")}
              className="flex items-center gap-2 text-white/90 hover:text-white transition group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>
            <Logo />
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSaved}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                title={isSaved ? "Remove from My List" : "Add to My List"}
              >
                <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Video Player - Full viewport */}
      <div className="relative w-full h-screen bg-black">
        <iframe
          src={`https://vidsrc.to/embed/movie/${params.id}`}
          allowFullScreen
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        />
      </div>

      {/* Movie Info Panel - Minimal Design */}
      <div className="relative bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {/* Title and Meta */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold mb-3">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm md:text-base text-gray-400">
              {movie.release_date && (
                <span>{movie.release_date.slice(0, 4)}</span>
              )}
              {movie.runtime && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              )}
              {movie.vote_average && (
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
              {movie.genres && movie.genres.length > 0 && (
                <span className="text-white/80">{movie.genres.slice(0, 2).map(g => g.name).join(" • ")}</span>
              )}
            </div>
          </div>

          {/* Overview */}
          {movie.overview && (
            <div className="mb-8 max-w-3xl">
              <p className="text-gray-300 leading-relaxed">
                {movie.overview}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-12">
            <button
              onClick={toggleSaved}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                isSaved
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
              }`}
            >
              <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>{isSaved ? "Saved" : "My List"}</span>
            </button>
            
            <MovieShareClient 
              url={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/player/${params.id}`}
              title={movie.title}
            />
          </div>

          {/* More Like This */}
          {similar.length > 0 && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-6">More Like This</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {similar.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/player/${item.id}`)}
                    className="group relative aspect-[2/3] rounded-md overflow-hidden hover:scale-105 hover:z-10 transition-transform duration-200"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-xs font-medium line-clamp-2">{item.title}</p>
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
