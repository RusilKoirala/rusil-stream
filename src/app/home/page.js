// Home page with Netflix-style carousels
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Loading from "../../components/Loading";

export default function HomePage() {
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [action, setAction] = useState([]);
  const [editors, setEditors] = useState([]);
  const [family, setFamily] = useState([]);
  const [horror, setHorror] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [username, setUsername] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("/api/movies").then(res => res.json()),
      fetch("/api/movies?query=top").then(res => res.json()),
      fetch("/api/movies?query=action").then(res => res.json()),
      fetch("/api/movies?query=drama").then(res => res.json()),
      fetch("/api/movies?query=family").then(res => res.json()),
      fetch("/api/movies?query=horror").then(res => res.json()),
    ]).then(([tr, top, act, ed, fam, hor]) => {
      setTrending(tr.results || []);
      setTopRated(top.results || []);
      setAction(act.results || []);
      setEditors(ed.results ? ed.results.slice(0, 10) : []);
      setFamily(fam.results || []);
      setHorror(hor.results || []);
      setFeatured(tr.results && tr.results.length > 0 ? tr.results[0] : null);
      setHeroIndex(0);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check login status from localStorage (or cookies if you prefer)
      const isAuth = localStorage.getItem('rusil_auth') === '1';
      setIsLoggedIn(isAuth);
      if (isAuth) {
        setProfilePic(localStorage.getItem('rusil_profilePic'));
        setUsername(localStorage.getItem('rusil_username') || '');
      } else {
        setProfilePic(null);
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('rusil_auth');
    localStorage.removeItem('rusil_profilePic');
    localStorage.removeItem('rusil_username');
    setIsLoggedIn(false);
    setProfilePic(null);
    router.push('/login');
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    const res = await fetch(`/api/movies?query=${encodeURIComponent(searchTerm)}`);
    const data = await res.json();
    setSearchResults(data.results?.filter(m => m.poster_path) || []);
    setSearchLoading(false);
    // Optionally, navigate to /movie?query=searchTerm
    // router.push(`/movie?query=${encodeURIComponent(searchTerm)}`);
  }

  function Carousel({ title, movies }) {
    // Drag-to-scroll for desktop
    const ref = useRef(null);
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      let isDown = false;
      let startX, scrollLeft;
      const onMouseDown = (e) => {
        isDown = true;
        el.classList.add('carousel-draggable');
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
      };
      const onMouseLeave = () => {
        isDown = false;
        el.classList.remove('carousel-draggable');
      };
      const onMouseUp = () => {
        isDown = false;
        el.classList.remove('carousel-draggable');
      };
      const onMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 2; // scroll-fast
        el.scrollLeft = scrollLeft - walk;
      };
      el.addEventListener('mousedown', onMouseDown);
      el.addEventListener('mouseleave', onMouseLeave);
      el.addEventListener('mouseup', onMouseUp);
      el.addEventListener('mousemove', onMouseMove);
      return () => {
        el.removeEventListener('mousedown', onMouseDown);
        el.removeEventListener('mouseleave', onMouseLeave);
        el.removeEventListener('mouseup', onMouseUp);
        el.removeEventListener('mousemove', onMouseMove);
      };
    }, []);
    return (
      <section className="mb-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 px-2 md:px-0">{title}</h2>
        <div ref={ref} className="flex gap-6 overflow-x-auto no-scrollbar pb-2 px-2 md:px-0 carousel-draggable">
          {movies.filter(movie => movie.poster_path).map(movie => (
            <Link key={movie.id} href={`/player/${movie.id}`} className="group relative min-w-[180px] md:min-w-[220px]">
              <div className="relative w-[180px] md:w-[220px] h-[270px] md:h-[330px] rounded-lg overflow-hidden bg-gray-800 shadow-2xl">
                <img 
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  style={{aspectRatio: '2/3'}}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p className="text-white text-base font-bold mb-1 truncate">{movie.title}</p>
                  <div className="flex gap-2 text-xs text-gray-200">
                    {movie.release_date && <span>{movie.release_date.slice(0,4)}</span>}
                    {movie.vote_average && <span>★ {movie.vote_average.toFixed(1)}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // Hero Banner
  function HeroBanner({ movie }) {
    if (!movie) return null;
    return (
      <div className="relative w-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px] flex items-end bg-black mb-10 overflow-hidden rounded-2xl shadow-2xl group">
        <img
          src={movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : "/logo/rusil-stream.svg"}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover scale-105 md:scale-110 transition-transform duration-700 group-hover:scale-105"
          style={{ filter: 'brightness(0.85) blur(0.5px)' }}
        />
        {/* Multi-layered fade overlays for cinematic effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-[#181818] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 p-6 md:p-16 max-w-2xl w-full">
          <h1 className="text-3xl md:text-6xl font-extrabold text-white drop-shadow-xl mb-4 leading-tight">
            {movie.title}
          </h1>
          <p className="text-base md:text-2xl text-gray-200 mb-6 line-clamp-3 drop-shadow-lg">
            {movie.overview}
          </p>
          <div className="flex gap-4">
            <Link href={`/player/${movie.id}`} className="inline-block bg-[#E50914] text-white text-lg md:text-xl font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-[#b0060f] transition-all focus:outline-none focus:ring-2 focus:ring-[#E50914]">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v15z" />
                </svg>
                Watch Now
              </span>
            </Link>
            <Link href="/login" className="inline-block bg-white/10 text-white text-lg md:text-xl font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-white/20 border border-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-[#E50914]">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Hero Banner Carousel
  function HeroBannerCarousel({ movies }) {
    const banners = movies.filter(m => m.backdrop_path).slice(0, 5);
    useEffect(() => {
      if (banners.length < 2) return;
      const interval = setInterval(() => {
        setHeroIndex(i => (i + 1) % banners.length);
      }, 6000);
      return () => clearInterval(interval);
    }, [banners.length]);
    if (!banners.length) return null;
    const movie = banners[heroIndex];
    return (
      <div className="relative w-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px] flex items-end bg-black mb-10 overflow-hidden rounded-2xl shadow-2xl group">
        <img
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover scale-105 md:scale-110 transition-transform duration-700 group-hover:scale-105"
          style={{ filter: 'brightness(0.85) blur(0.5px)' }}
        />
        {/* Multi-layered fade overlays for cinematic effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-[#181818] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 p-6 md:p-16 max-w-2xl w-full">
          <h1 className="text-3xl md:text-6xl font-extrabold text-white drop-shadow-xl mb-4 leading-tight">
            {movie.title}
          </h1>
          <p className="text-base md:text-2xl text-gray-200 mb-6 line-clamp-3 drop-shadow-lg">
            {movie.overview}
          </p>
          <Link href={`/player/${movie.id}`} className="inline-block bg-[#E50914] text-white text-lg md:text-xl font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-[#b0060f] transition-all focus:outline-none focus:ring-2 focus:ring-[#E50914]">
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v15z" />
              </svg>
              Watch Now
            </span>
          </Link>
        </div>
        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-200 ${i === heroIndex ? 'bg-[#E50914] scale-125 shadow-lg' : 'bg-white/40'}`}
              aria-label={`Show ${i+1}`}
            />
          ))}
        </div>
      </div>
    );
  }

  // ProfileDropdown component
  function ProfileDropdown({ onLogout }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="focus:outline-none"
          aria-label="Account menu"
        >
          {profilePic ? (
            <span className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center shadow-lg">
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            </span>
          ) : (
            <span className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 1115 0v.75A2.25 2.25 0 0117.25 22.5h-10.5A2.25 2.25 0 014.5 20.25v-.75z" />
              </svg>
            </span>
          )}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-44 bg-[#181818] rounded-xl shadow-2xl py-2 z-50 border border-gray-700 animate-fade-in">
            <button
              onClick={() => { setOpen(false); router.push('/settings'); }}
              className="block w-full text-left px-5 py-3 text-white hover:bg-gray-800 transition rounded-t-xl"
            >
              Settings
            </button>
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="block w-full text-left px-5 py-3 text-white hover:bg-gray-800 transition rounded-b-xl"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a1020] via-[#101a2b] to-[#181f2e] text-white flex flex-col">
      <header className="w-full px-2 sm:px-4 md:px-8 py-3 md:py-6 flex items-center justify-between relative z-30 bg-transparent">
        <Image src="/logo/logo.png" alt="Rusil Stream Logo" width={120} height={38} className="w-[90px] h-[28px] md:w-[120px] md:h-[38px] object-contain" />
        {/* Hamburger for mobile */}
        <button
          className="md:hidden ml-2 p-2 rounded focus:outline-none"
          onClick={() => setNavOpen(v => !v)}
          aria-label="Open navigation menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 flex-1 justify-end">
          <form onSubmit={handleSearch} className="flex-1 max-w-xs md:max-w-lg mx-2 md:mx-8 flex items-center gap-2 md:gap-3">
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 px-2 py-1 md:px-5 md:py-2 rounded-lg bg-[#181f2e] text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#E50914] placeholder-gray-400 shadow"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="bg-[#E50914] hover:bg-[#b0060f] text-white font-bold px-2 py-1 md:px-5 md:py-2 rounded-lg transition flex items-center gap-1 md:gap-2 text-xs md:text-base">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
              <span className="hidden md:inline">Search</span>
            </button>
          </form>
          <Link href="/" className="text-lg font-bold hover:underline">Home</Link>
          <div className="relative ml-4">
            {isLoggedIn ? (
              <ProfileDropdown onLogout={handleLogout} />
            ) : (
              <Link href="/login" title="Login">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white hover:text-[#E50914] transition">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9m0 0l3-3m-3 3l3 3" />
                </svg>
              </Link>
            )}
          </div>
        </nav>
        {/* Mobile nav overlay */}
        {navOpen && (
          <div className="fixed inset-0 bg-black/80 z-40 flex flex-col items-center justify-start pt-20 gap-8 animate-fade-in md:hidden">
            <form onSubmit={handleSearch} className="w-11/12 flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 px-3 py-2 rounded-lg bg-[#181f2e] text-white text-base focus:outline-none focus:ring-2 focus:ring-[#E50914] placeholder-gray-400 shadow"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="bg-[#E50914] hover:bg-[#b0060f] text-white font-bold px-4 py-2 rounded-lg transition flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
                Search
              </button>
            </form>
            <Link href="/" className="text-lg font-bold hover:underline" onClick={() => setNavOpen(false)}>Home</Link>
            <div className="relative">
              {isLoggedIn ? (
                <ProfileDropdown onLogout={() => { setNavOpen(false); handleLogout(); }} />
              ) : (
                <Link href="/login" title="Login" onClick={() => setNavOpen(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white hover:text-[#E50914] transition">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9m0 0l3-3m-3 3l3 3" />
                  </svg>
                </Link>
              )}
            </div>
            <button className="absolute top-4 right-4 p-2" onClick={() => setNavOpen(false)} aria-label="Close menu">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </header>
      {/* Search Results Section */}
      {searchTerm && (
        <section className="w-full max-w-5xl mx-auto px-1 md:px-4 mt-2">
          <div className="bg-[#101a2b] rounded-2xl shadow-2xl p-2 md:p-6">
            {searchLoading ? (
              <div className="text-center text-gray-300 py-8">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-6">
                {searchResults.map(movie => (
                  <Link
                    key={movie.id}
                    href={`/player/${movie.id}`}
                    className="group flex flex-col items-center bg-[#181f2e] rounded-lg p-1 md:p-3 hover:bg-[#232b3a] transition shadow-lg"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                      alt={movie.title}
                      className="w-16 h-24 md:w-24 md:h-36 object-cover rounded mb-1 md:mb-2 shadow"
                    />
                    <span className="text-white text-xs md:text-base font-semibold text-center line-clamp-2">{movie.title}</span>
                    <span className="text-xs text-gray-400">{movie.release_date?.slice(0,4)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">No results found.</div>
            )}
          </div>
        </section>
      )}
      <main className="flex-1 w-full px-0 md:px-12 max-w-[1600px] mx-auto">
        {loading ? (
          <Loading />
        ) : (
          <>
            <HeroBannerCarousel movies={trending} />
            <Carousel title="Trending Now" movies={trending} />
            <Carousel title="Top Rated" movies={topRated} />
            <Carousel title="Action Movies" movies={action} />
            <Carousel title="Family Movies" movies={family} />
            <Carousel title="Horror Movies" movies={horror} />
            <Carousel title="Editor's Picks" movies={editors} />
          </>
        )}
      </main>
    </div>
  );
}

// Add no-scrollbar utility to your global CSS:
// .no-scrollbar::-webkit-scrollbar { display: none; }
// .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
