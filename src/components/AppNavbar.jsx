"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

export default function AppNavbar({
  profileName,
  profilePic,
  userEmail,
  onSearchOpen,
  onLogout,
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuOpen && !event.target.closest("[data-profile-menu]") && !event.target.closest("[data-profile-trigger]")) {
        setProfileMenuOpen(false);
      }
      if (mobileMenuOpen && !event.target.closest("nav")) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [profileMenuOpen, mobileMenuOpen]);

  const linkClass = (path) => (
    `${pathname === path ? "text-white" : "text-gray-400 hover:text-gray-300"} transition font-semibold`
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-gradient-to-b from-black/90 via-black/50 to-transparent`}>
      <div className="flex items-center justify-between px-4 md:px-12 py-5">
        <div className="flex items-center gap-10">
          <Link href="/home" aria-label="Rusil Stream Home">
            <Logo className="text-xl md:text-2xl" />
          </Link>

          <div className="hidden lg:flex items-center gap-7 text-sm">
            <Link href="/home" className={linkClass("/home")}>Home</Link>
            <Link href="/movies" className={linkClass("/movies")}>Movies</Link>
            <Link href="/tv-shows" className={linkClass("/tv-shows")}>TV Shows</Link>
            <Link href="/my-list" className={linkClass("/my-list")}>My List</Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-full transition"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {onSearchOpen && (
            <button
              onClick={onSearchOpen}
              className="p-2.5 hover:bg-white/10 rounded-full transition"
              aria-label="Search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          {profileName && (
            <div className="relative" data-profile-menu>
              <button
                data-profile-trigger
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 hover:opacity-90 transition"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
              >
                {profilePic ? (
                  <img src={profilePic} alt={profileName} className="w-9 h-9 rounded-md object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-md bg-white/10 flex items-center justify-center text-sm font-semibold">
                    {profileName.charAt(0).toUpperCase()}
                  </div>
                )}
                <svg className={`hidden md:block w-4 h-4 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-black/90 backdrop-blur border border-white/10 rounded-xl shadow-lg py-2">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-semibold text-white">{profileName}</p>
                    {userEmail && <p className="text-xs text-gray-400 mt-0.5">{userEmail}</p>}
                  </div>
                  <Link onClick={() => setProfileMenuOpen(false)} href="/profiles" className="block w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition">
                    Switch Profile
                  </Link>
                  <Link onClick={() => setProfileMenuOpen(false)} href="/settings" className="block w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition">
                    Account Settings
                  </Link>
                  {onLogout && (
                    <div className="border-t border-white/10 mt-2 pt-2">
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur border-t border-white/10">
          <div className="px-4 py-4 space-y-1">
            <Link href="/home" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-400 font-semibold rounded-lg hover:bg-white/10 hover:text-white transition">Home</Link>
            <Link href="/movies" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-400 font-semibold rounded-lg hover:bg-white/10 hover:text-white transition">Movies</Link>
            <Link href="/tv-shows" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-400 font-semibold rounded-lg hover:bg-white/10 hover:text-white transition">TV Shows</Link>
            <Link href="/my-list" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-400 font-semibold rounded-lg hover:bg-white/10 hover:text-white transition">My List</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
