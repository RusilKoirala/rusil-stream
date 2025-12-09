"use client";
import React from "react";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "../../../../components/Loading";
import Logo from "../../../../components/Logo";

export default function TVPlayerPage(props) {
  const params =
    typeof React.use === "function" && typeof props.params?.then === "function"
      ? React.use(props.params)
      : props.params;
  const [show, setShow] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasonData, setSeasonData] = useState([]);
  const [currentSeasonEpisodes, setCurrentSeasonEpisodes] = useState([]);
  const [autoplay, setAutoplay] = useState(true);
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
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

        const [showRes, savedRes] = await Promise.all([
          fetch(`/api/movies?id=${params.id}&mediaType=tv`),
          fetch(`/api/saved?profileId=${profileId}`)
        ]);

        const showData = await showRes.json();
        setShow(showData);

        // Fetch season data
        if (showData.seasons) {
          const seasons = showData.seasons.filter(s => s.season_number > 0);
          setSeasonData(seasons);
          
          // Fetch first season episodes
          if (seasons.length > 0) {
            const seasonRes = await fetch(`/api/movies?tvId=${params.id}&season=${seasons[0].season_number}`);
            const seasonInfo = await seasonRes.json();
            setCurrentSeasonEpisodes(seasonInfo.episodes || []);
          }
        }

        if (showData.genres && showData.genres.length > 0) {
          const genreId = showData.genres[0].id;
          const similarRes = await fetch(`/api/movies?genre=${genreId}&mediaType=tv`);
          const similarData = await similarRes.json();
          setSimilar(similarData.results?.filter(s => s.id !== parseInt(params.id)).slice(0, 12) || []);
        }

        if (savedRes.ok) {
          const { saved } = await savedRes.json();
          setIsSaved(saved.some(s => s.movieId === parseInt(params.id)));
        }

        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId,
            movieId: parseInt(params.id),
            movieTitle: showData.name,
            posterPath: showData.poster_path,
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
  }, [params?.id, router]);

  useEffect(() => {
    // Fetch episodes when season changes
    async function fetchSeasonEpisodes() {
      if (!params?.id || !selectedSeason) return;
      
      try {
        const seasonRes = await fetch(`/api/movies?tvId=${params.id}&season=${selectedSeason}`);
        const seasonInfo = await seasonRes.json();
        setCurrentSeasonEpisodes(seasonInfo.episodes || []);
        
        // Reset to episode 1 when changing seasons
        if (seasonInfo.episodes && seasonInfo.episodes.length > 0) {
          setSelectedEpisode(1);
        }
      } catch (error) {
        console.error("Failed to fetch season episodes:", error);
      }
    }
    
    fetchSeasonEpisodes();
  }, [selectedSeason, params?.id]);

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
            movieTitle: show?.name,
            posterPath: show?.poster_path
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
  if (!show) return notFound();

  return (
    <div className="min-h-screen bg-black text-white">
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

      <div className="relative w-full aspect-video bg-black">
        <iframe
          src={`https://vidsrc-embed.ru/embed/tv?tmdb=${params.id}&season=${selectedSeason}&episode=${selectedEpisode}${autoplay ? '&autoplay=1' : ''}`}
          allowFullScreen
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        />
        
        {/* Episode Selector Button */}
        <button
          onClick={() => setShowEpisodeSelector(!showEpisodeSelector)}
          className={`absolute bottom-6 right-6 z-10 flex items-center gap-2 bg-black/80 hover:bg-black/90 backdrop-blur-md text-white px-5 py-3 rounded-xl font-semibold transition-all border border-white/20 hover:border-white/40 ${showControls ? "opacity-100" : "opacity-0"}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>S{selectedSeason} E{selectedEpisode}</span>
        </button>
      </div>

      {/* Episode Selector Panel */}
      {showEpisodeSelector && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen px-4 py-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Episodes</h2>
                <button
                  onClick={() => setShowEpisodeSelector(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Season Selector */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-xl font-semibold">Season</h3>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                    <input
                      type="checkbox"
                      id="autoplay"
                      checked={autoplay}
                      onChange={(e) => setAutoplay(e.target.checked)}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <label htmlFor="autoplay" className="text-sm font-medium cursor-pointer">
                      Autoplay Next Episode
                    </label>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {seasonData.map((season) => (
                    <button
                      key={season.season_number}
                      onClick={() => setSelectedSeason(season.season_number)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                        selectedSeason === season.season_number
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                          : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      Season {season.season_number}
                    </button>
                  ))}
                </div>
              </div>

              {/* Episode Grid */}
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Season {selectedSeason} Episodes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentSeasonEpisodes.map((episode) => (
                    <button
                      key={episode.episode_number}
                      onClick={() => {
                        setSelectedEpisode(episode.episode_number);
                        setShowEpisodeSelector(false);
                      }}
                      className={`group relative rounded-xl overflow-hidden transition-all hover:scale-105 ${
                        selectedEpisode === episode.episode_number && selectedSeason === selectedSeason
                          ? "ring-4 ring-blue-500"
                          : ""
                      }`}
                    >
                      <div className="relative aspect-video bg-gray-900">
                        {episode.still_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
                            alt={episode.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                            <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center backdrop-blur-sm shadow-2xl">
                            <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>

                        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-lg">
                          <span className="text-sm font-bold">Episode {episode.episode_number}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/90 backdrop-blur-sm p-4">
                        <h4 className="font-semibold text-white mb-1 line-clamp-1">
                          {episode.name}
                        </h4>
                        {episode.runtime && (
                          <p className="text-sm text-gray-400 mb-2">{episode.runtime} min</p>
                        )}
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {episode.overview || "No description available."}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-[#0a0a0a] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded">TV SERIES</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{show.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {show.first_air_date && (
                <span className="text-gray-400 text-lg">{show.first_air_date.slice(0, 4)}</span>
              )}
              {show.number_of_seasons && (
                <span className="text-gray-400 text-lg">{show.number_of_seasons} Season{show.number_of_seasons > 1 ? 's' : ''}</span>
              )}
              {show.vote_average && (
                <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-yellow-500 font-semibold">{show.vote_average.toFixed(1)}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
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

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-3">Overview</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                {show.overview || "No description available."}
              </p>
            </div>
            
            <div className="space-y-4">
              {show.genres && show.genres.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {show.genres.map((genre) => (
                      <span key={genre.id} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {similar.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">More Like This</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {similar.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/player/tv/${item.id}`)}
                    className="group relative aspect-[2/3] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-sm font-semibold line-clamp-2">{item.name}</h3>
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
