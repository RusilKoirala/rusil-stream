"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "../../components/Loading";
import Logo from "../../components/Logo";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [trending, setTrending] = useState([]);
  const [movies, setMovies] = useState([]);
  const [tvShows, setTVShows] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [myList, setMyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const router = useRouter();
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('nav')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  useEffect(() => {
    async function init() {
      try {
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) {
          router.replace("/login");
          return;
        }
        const userData = await userRes.json();
        setUser(userData.user);
        
        const profileId = localStorage.getItem("selectedProfileId");
        if (!profileId) {
          router.replace("/profiles");
          return;
        }
        
        const profile = userData.user.profiles.find(p => p._id === profileId);
        if (profile) {
          setProfileName(profile.name);
          setProfilePic(profile.avatarUrl || "");
        }

        const responses = await Promise.all([
          fetch("/api/movies?type=trending"),
          fetch("/api/movies?type=popular&mediaType=movie"),
          fetch("/api/movies?type=popular&mediaType=tv"),
          fetch("/api/movies?type=top_rated&mediaType=movie"),
          fetch(`/api/history?profileId=${profileId}`),
          fetch(`/api/saved?profileId=${profileId}`)
        ]);

        const data = await Promise.all(responses.map(r => r.json()));

        setTrending(data[0].results || []);
        setMovies(data[1].results || []);
        setTVShows(data[2].results || []);
        setTopRated(data[3].results || []);
        
        if (data[4].history && data[4].history.length > 0) {
          setContinueWatching(data[4].history.map(h => ({
            id: h.movieId,
            title: h.movieTitle,
            poster_path: h.posterPath,
            watchedPercentage: h.watchedPercentage,
            media_type: 'movie'
          })));
        }

        if (data[5].saved && data[5].saved.length > 0) {
          setMyList(data[5].saved.map(s => ({
            id: s.movieId,
            title: s.movieTitle,
            poster_path: s.posterPath,
            media_type: 'movie'
          })));
        }

        setLoading(false);
      } catch (error) {
        console.error("Init error:", error);
        setLoading(false);
      }
    }
    init();
  }, [router]);

  useEffect(() => {
    if (trending.length > 1) {
      const interval = setInterval(() => {
        setHeroIndex((prev) => (prev + 1) % Math.min(trending.length, 5));
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [trending]);

  useEffect(() => {
    if (searchTerm.trim()) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(async () => {
        setSearchLoading(true);
        try {
          const res = await fetch(`/api/movies?query=${encodeURIComponent(searchTerm)}&mediaType=multi`);
          const data = await res.json();
          setSearchResults(data.results?.filter(m => m.poster_path || m.backdrop_path) || []);
        } catch (error) {
          console.error("Search error:", error);
        }
        setSearchLoading(false);
      }, 500);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("selectedProfileId");
    router.push("/login");
  }

  function ContentCard({ item, showProgress }) {
    const isTV = item.media_type === 'tv' || item.name;
    const title = item.title || item.name;
    const link = isTV ? `/player/tv/${item.id}` : `/player/${item.id}`;
    
    return (
      <Link href={link} className="group relative flex-shrink-0 w-[140px] sm:w-[160px] md:w-[200px] lg:w-[240px] transition-all duration-300 hover:scale-105 hover:z-10">
        <div className="relative aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden shadow-2xl">
          <img
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/95 flex items-center justify-center backdrop-blur-sm shadow-2xl transform group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 md:w-7 md:h-7 text-black ml-0.5 md:ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {isTV && (
            <div className="absolute top-1.5 md:top-2 right-1.5 md:right-2 bg-blue-500 text-white text-xs font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs">
              TV
            </div>
          )}

          {showProgress && item.watchedPercentage > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
              <div 
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${item.watchedPercentage}%` }}
              />
            </div>
          )}
        </div>
        
        <div className="mt-2 md:mt-3 px-1">
          <h3 className="text-xs md:text-sm font-semibold text-white truncate group-hover:text-gray-300 transition-colors">
            {title}
          </h3>
        </div>
      </Link>
    );
  }

  function Carousel({ title, items, showProgress = false }) {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
      if (scrollRef.current) {
        const scrollAmount = direction === "left" ? -800 : 800;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    };

    if (!items || items.length === 0) return null;

    return (
      <div className="mb-10 md:mb-14">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-5 px-4 md:px-12">
          {title}
        </h2>
        <div className="relative group/carousel">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 md:w-16 bg-gradient-to-r from-black/60 via-black/30 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          >
            <svg className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            className="flex gap-2 md:gap-3 lg:gap-4 overflow-x-auto scrollbar-hide px-4 md:px-12 scroll-smooth pb-2"
          >
            {items.map((item) => (
              <ContentCard key={`${item.id}-${item.media_type}`} item={item} showProgress={showProgress} />
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 md:w-16 bg-gradient-to-l from-black/60 via-black/30 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          >
            <svg className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  function PremiumHero() {
    const featured = trending[heroIndex];
    if (!featured) return null;

    const isTV = featured.media_type === 'tv' || featured.name;
    const title = featured.title || featured.name;
    const link = isTV ? `/player/tv/${featured.id}` : `/player/${featured.id}`;

    return (
      <div className="relative h-screen w-full mb-8 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={`https://image.tmdb.org/t/p/original${featured.backdrop_path || featured.poster_path}`}
            alt={title}
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
        </div>

        <div className="relative h-full flex items-center px-4 md:px-8 lg:px-12 xl:px-16 max-w-7xl pt-20 md:pt-24">
          <div className="max-w-2xl space-y-3 md:space-y-5 lg:space-y-7">
            {isTV && (
              <div className="inline-block bg-blue-500 text-white text-xs md:text-sm font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-lg">
                TV SERIES
              </div>
            )}
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight drop-shadow-2xl">
              {title}
            </h1>
            
            {featured.vote_average && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-yellow-500/30">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-yellow-500 font-bold text-base md:text-lg">{featured.vote_average.toFixed(1)}</span>
                </div>
              </div>
            )}
            
            <p className="text-sm md:text-base lg:text-lg text-gray-200 line-clamp-2 md:line-clamp-3 leading-relaxed drop-shadow-lg max-w-xl">
              {featured.overview}
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 pt-2">
              <Link
                href={link}
                className="group flex items-center gap-2 md:gap-3 bg-white hover:bg-gray-100 text-black font-bold px-6 md:px-6 lg:px-8 py-3 md:py-3 lg:py-4 rounded-lg transition-all duration-200 shadow-2xl hover:shadow-white/20 hover:scale-105 w-full sm:w-auto justify-center sm:justify-start"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="text-sm md:text-base lg:text-lg">Play Now</span>
              </Link>
              
              <Link
                href={link}
                className="flex items-center gap-2 md:gap-3 bg-white/10 hover:bg-white/20 text-white font-bold px-6 md:px-6 lg:px-8 py-3 md:py-3 lg:py-4 rounded-lg transition-all duration-200 backdrop-blur-md border border-white/20 hover:border-white/40 hover:scale-105 w-full sm:w-auto justify-center sm:justify-start"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm md:text-base lg:text-lg">More Info</span>
              </Link>
            </div>
          </div>
        </div>

        {trending.length > 1 && (
          <div className="absolute bottom-6 md:bottom-8 right-4 md:right-8 flex gap-2">
            {trending.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === heroIndex ? 'w-8 md:w-12 bg-white' : 'w-6 md:w-8 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a0a]/98 backdrop-blur-xl shadow-2xl" : "bg-gradient-to-b from-black/90 via-black/50 to-transparent"}`}>
        <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 py-4 md:py-5">
          <div className="flex items-center gap-10">
            <Link href="/home">
              <Logo className="text-2xl md:text-3xl" />
            </Link>
            
            <div className="hidden md:flex items-center gap-4 lg:gap-7 text-xs md:text-sm font-semibold">
              <Link href="/home" className="text-white hover:text-gray-300 transition">Home</Link>
              <Link href="/movies" className="text-gray-400 hover:text-gray-300 transition">Movies</Link>
              <Link href="/tv-shows" className="text-gray-400 hover:text-gray-300 transition">TV Shows</Link>
              <Link href="/my-list" className="text-gray-400 hover:text-gray-300 transition">My List</Link>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-full transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Button - Always shows as icon on mobile */}
            <button
              onClick={() => {
                setSearchOpen(true);
                setMobileMenuOpen(false);
              }}
              className="p-2.5 hover:bg-white/10 rounded-full transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 hover:opacity-80 transition"
              >
                {profilePic ? (
                  <img src={profilePic} alt={profileName} className="w-9 h-9 rounded-lg object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold shadow-lg">
                    {profileName.charAt(0).toUpperCase()}
                  </div>
                )}
                <svg className={`w-4 h-4 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-semibold text-white">{profileName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setProfileMenuOpen(false); router.push("/profiles"); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition"
                  >
                    Switch Profile
                  </button>
                  <button
                    onClick={() => { setProfileMenuOpen(false); router.push("/settings"); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition"
                  >
                    Account Settings
                  </button>
                  <div className="border-t border-white/10 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/98 backdrop-blur-xl border-t border-white/10">
            <div className="px-4 py-4 space-y-1">
              <Link 
                href="/home" 
                className="block px-4 py-3 text-white font-semibold rounded-lg hover:bg-white/10 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/movies" 
                className="block px-4 py-3 text-gray-400 font-semibold rounded-lg hover:bg-white/10 hover:text-white transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Movies
              </Link>
              <Link 
                href="/tv-shows" 
                className="block px-4 py-3 text-gray-400 font-semibold rounded-lg hover:bg-white/10 hover:text-white transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                TV Shows
              </Link>
              <Link 
                href="/my-list" 
                className="block px-4 py-3 text-gray-400 font-semibold rounded-lg hover:bg-white/10 hover:text-white transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                My List
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
          {/* Search Header */}
          <div className="flex items-center gap-3 md:gap-4 p-4 md:p-6 border-b border-white/10">
            <button
              onClick={() => { setSearchOpen(false); setSearchTerm(""); setSearchResults([]); }}
              className="p-2 hover:bg-white/10 rounded-full transition-all flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex-1 relative min-w-0">
              <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-3 md:px-4 py-2.5 md:py-3">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search movies and TV shows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent text-white placeholder-gray-400 outline-none flex-1 text-base md:text-lg min-w-0"
                  autoFocus
                />
                {searchTerm && (
                  <button 
                    onClick={() => { setSearchTerm(""); setSearchResults([]); }}
                    className="p-1 hover:bg-white/10 rounded-full transition-all flex-shrink-0"
                  >
                    <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
              {searchTerm ? (
                <>
                  <h2 className="text-xl md:text-2xl font-bold mb-6">Search Results for "{searchTerm}"</h2>
                  {searchLoading ? (
                    <div className="text-center py-20">
                      <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                      {searchResults.map((item) => (
                        <div key={`${item.id}-${item.media_type}`} onClick={() => setSearchOpen(false)}>
                          <ContentCard item={item} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 text-gray-400 text-lg">
                      No results found for "{searchTerm}"
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">Search Movies & TV Shows</h3>
                  <p className="text-gray-500">Start typing to find your favorite content</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main>
        <PremiumHero />
        
        <div className="pt-8">
          {continueWatching.length > 0 && (
            <Carousel title="Continue Watching" items={continueWatching} showProgress={true} />
          )}
          
          {myList.length > 0 && (
            <Carousel title="My List" items={myList} />
          )}
          
          <Carousel title="Trending Now" items={trending} />
          <Carousel title="Popular Movies" items={movies} />
          <Carousel title="Popular TV Shows" items={tvShows} />
          <Carousel title="Top Rated" items={topRated} />
        </div>
      </main>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
