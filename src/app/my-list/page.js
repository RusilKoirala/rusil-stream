"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "../../components/Loading";
import Logo from "../../components/Logo";

export default function MyListPage() {
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [myList, setMyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        }

        const savedRes = await fetch(`/api/saved?profileId=${profileId}`);
        if (savedRes.ok) {
          const { saved } = await savedRes.json();
          setMyList(saved.map(s => ({
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

  async function removeFromList(movieId) {
    const profileId = localStorage.getItem("selectedProfileId");
    if (!profileId) return;

    try {
      await fetch(`/api/saved?profileId=${profileId}&movieId=${movieId}`, {
        method: "DELETE"
      });
      setMyList(myList.filter(item => item.id !== movieId));
    } catch (error) {
      console.error("Failed to remove from list:", error);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a0a]/98 backdrop-blur-xl shadow-2xl" : "bg-gradient-to-b from-black/90 via-black/50 to-transparent"}`}>
        <div className="flex items-center justify-between px-4 md:px-12 py-5">
          <div className="flex items-center gap-10">
            <Link href="/home">
              <Logo className="text-3xl md:text-4xl" />
            </Link>
            
            <div className="hidden lg:flex items-center gap-7 text-sm font-semibold">
              <Link href="/home" className="text-gray-400 hover:text-gray-300 transition">Home</Link>
              <Link href="/movies" className="text-gray-400 hover:text-gray-300 transition">Movies</Link>
              <Link href="/tv-shows" className="text-gray-400 hover:text-gray-300 transition">TV Shows</Link>
              <Link href="/my-list" className="text-white hover:text-gray-300 transition">My List</Link>
            </div>
          </div>

          <Link href="/home" className="text-gray-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 md:px-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4">My List</h1>
          <p className="text-gray-400 text-lg">Your personal collection of favorites</p>
        </div>

        {myList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-24 h-24 text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2">Your list is empty</h2>
            <p className="text-gray-400 mb-8">Start adding movies and TV shows you want to watch</p>
            <Link
              href="/home"
              className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition"
            >
              Browse Content
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {myList.map((item) => (
              <div key={item.id} className="group relative">
                <Link href={`/player/${item.id}`} className="block">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-105">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center backdrop-blur-sm shadow-2xl">
                        <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-gray-300 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </Link>
                
                <button
                  onClick={() => removeFromList(item.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/80 hover:bg-red-600 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  title="Remove from list"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
