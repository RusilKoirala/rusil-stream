"use client";
import React, { useEffect, useState, useRef } from "react";
import { notFound, useRouter } from "next/navigation";
import Loading from "@/components/ui/Loading";
import Logo from "@/components/layout/Logo";
import MovieShareClient from "@/components/features/MovieShareClient";

const PROVIDER_NAMES = ['vidsrc.xyz', 'vidsrc.in', 'vidsrc.pm', 'vidsrc.lol'];

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
  const [sourceIndex, setSourceIndex] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);

  function switchSource(index) {
    setSourceIndex(index);
    setIframeKey(k => k + 1);
  }
  const router = useRouter();
  const profileIdRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Build proxy URL for current source
  const proxyUrl = params?.id
    ? `/api/stream/proxy?id=${params.id}&type=movie&source=${sourceIndex}`
    : null;

  useEffect(() => {
    if (!params?.id) return;

    async function init() {
      try {
        const profileId = localStorage.getItem("selectedProfileId");
        if (!profileId) { router.replace("/profiles"); return; }
        profileIdRef.current = profileId;

        const [movieRes, savedRes] = await Promise.all([
          fetch(`/api/movies?id=${params.id}`),
          fetch(`/api/saved?profileId=${profileId}`),
        ]);

        const movieData = await movieRes.json();
        setMovie(movieData);

        if (savedRes.ok) {
          const { saved } = await savedRes.json();
          setIsSaved(saved.some(s => s.movieId === parseInt(params.id)));
        }

        // Record watch start
        fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId,
            movieId: parseInt(params.id),
            movieTitle: movieData.title,
            posterPath: movieData.poster_path,
            lastPositionSec: 0,
            durationSec: 0,
          }),
        }).catch(() => {});

        setLoading(false);

        // Fetch similar after player is ready
        if (movieData.genres?.length) {
          fetch(`/api/movies?genre=${movieData.genres[0].id}`)
            .then(r => r.json())
            .then(d => setSimilar(d.results?.filter(m => m.id !== parseInt(params.id)).slice(0, 12) || []))
            .catch(() => {});
        }
      } catch (err) {
        console.error("Player init error:", err);
        setLoading(false);
      }
    }

    init();

    const interval = setInterval(() => {
      if (profileIdRef.current && movie) {
        fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId: profileIdRef.current,
            movieId: parseInt(params.id),
            movieTitle: movie.title,
            posterPath: movie.poster_path,
            lastPositionSec: 0,
            durationSec: 0,
          }),
        }).catch(() => {});
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [params?.id]);

  // Auto-hide controls
  useEffect(() => {
    const show = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener("mousemove", show);
    window.addEventListener("touchstart", show);
    return () => {
      window.removeEventListener("mousemove", show);
      window.removeEventListener("touchstart", show);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  function switchSource(index) {
    setSourceIndex(index);
    setIframeKey(k => k + 1); // force iframe reload
  }

  async function toggleSaved() {
    if (!profileIdRef.current || !movie) return;
    try {
      if (isSaved) {
        await fetch(`/api/saved?profileId=${profileIdRef.current}&movieId=${params.id}`, { method: "DELETE" });
        setIsSaved(false);
      } else {
        await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId: profileIdRef.current,
            movieId: parseInt(params.id),
            movieTitle: movie.title,
            posterPath: movie.poster_path,
          }),
        });
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Toggle saved error:", err);
    }
  }

  if (!params?.id) return notFound();
  if (loading) return <Loading />;
  if (!movie) return notFound();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Floating nav — auto-hides */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}>
        <div className="bg-gradient-to-b from-black/90 to-transparent px-4 md:px-8 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-2 text-white/80 hover:text-white transition group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium hidden sm:block">Back</span>
          </button>
          <Logo />
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
      </nav>

      {/* Player — full viewport */}
      <div className="relative w-full h-screen bg-black">
        <iframe
          key={iframeKey}
          src={proxyUrl}
          allowFullScreen
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Source switcher */}
      <div className="bg-[#0b0b0b] border-y border-white/8 px-4 md:px-8 py-4">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-3 font-medium">Stream Source</p>
        <div className="flex flex-wrap gap-2">
          {PROVIDER_NAMES.map((name, i) => (
            <button
              key={name}
              onClick={() => switchSource(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                sourceIndex === i
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Movie info */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        <h1 className="text-2xl md:text-4xl font-bold mb-3">{movie.title}</h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-6">
          {movie.release_date && <span>{movie.release_date.slice(0, 4)}</span>}
          {movie.runtime && (
            <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
          )}
          {movie.vote_average > 0 && (
            <span className="flex items-center gap-1 text-yellow-400">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {movie.vote_average.toFixed(1)}
            </span>
          )}
          {movie.genres?.length > 0 && (
            <span className="text-white/60">{movie.genres.slice(0, 2).map(g => g.name).join(" · ")}</span>
          )}
        </div>

        {movie.overview && (
          <p className="text-gray-300 leading-relaxed max-w-3xl mb-8">{movie.overview}</p>
        )}

        <div className="flex flex-wrap gap-3 mb-12">
          <button
            onClick={toggleSaved}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${
              isSaved
                ? "bg-white text-black hover:bg-gray-100"
                : "bg-white/8 text-white hover:bg-white/15 border border-white/15"
            }`}
          >
            <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {isSaved ? "Saved" : "My List"}
          </button>
          <MovieShareClient
            url={`${typeof window !== "undefined" ? window.location.origin : ""}/player/${params.id}`}
            title={movie.title}
          />
        </div>

        {similar.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-5">More Like This</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {similar.map(item => (
                <button
                  key={item.id}
                  onClick={() => router.push(`/player/${item.id}`)}
                  className="group relative aspect-[2/3] rounded-lg overflow-hidden hover:scale-105 hover:z-10 transition-transform duration-200"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-xs font-medium line-clamp-2">{item.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
