"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "../../components/Loading";
import AppNavbar from "../../components/AppNavbar";

export default function MoviesPage() {
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [action, setAction] = useState([]);
  const [comedy, setComedy] = useState([]);
  const [horror, setHorror] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState("");
  const router = useRouter();

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
          fetch("/api/movies?type=popular&mediaType=movie"),
          fetch("/api/movies?type=top_rated&mediaType=movie"),
          fetch("/api/movies?query=action"),
          fetch("/api/movies?query=comedy"),
          fetch("/api/movies?query=horror")
        ]);

        const data = await Promise.all(responses.map(r => r.json()));

        setPopular(data[0].results || []);
        setTopRated(data[1].results || []);
        setAction(data[2].results || []);
        setComedy(data[3].results || []);
        setHorror(data[4].results || []);
        setLoading(false);
      } catch (error) {
        console.error("Init error:", error);
        setLoading(false);
      }
    }
    init();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("selectedProfileId");
    router.push("/login");
  }

  function MovieCard({ movie }) {
    return (
      <Link href={`/player/${movie.id}`} className="group relative flex-shrink-0 w-[160px] sm:w-[200px] md:w-[240px] transition-all duration-300 hover:scale-105 hover:z-10">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center backdrop-blur-sm shadow-2xl transform group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="mt-3 px-1">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-gray-300 transition-colors">
            {movie.title}
          </h3>
        </div>
      </Link>
    );
  }

  function Carousel({ title, movies }) {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
      if (scrollRef.current) {
        const scrollAmount = direction === "left" ? -800 : 800;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    };

    if (!movies || movies.length === 0) return null;

    return (
      <div className="mb-10 md:mb-14">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-5 px-4 md:px-12">
          {title}
        </h2>
        <div className="relative group/carousel">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-[#0a0a0a] to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          >
            <svg className="w-10 h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide px-4 md:px-12 scroll-smooth pb-2"
          >
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 flex items-center justify-center"
          >
            <svg className="w-10 h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AppNavbar
        profileName={profileName}
        profilePic={profilePic}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      <main className="pt-24 pb-12">
        <div className="px-4 md:px-12 mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4">Movies</h1>
          <p className="text-gray-400 text-lg">Explore thousands of movies across all genres</p>
        </div>

        <Carousel title="Popular Movies" movies={popular} />
        <Carousel title="Top Rated" movies={topRated} />
        <Carousel title="Action & Adventure" movies={action} />
        <Carousel title="Comedy" movies={comedy} />
        <Carousel title="Horror" movies={horror} />
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
