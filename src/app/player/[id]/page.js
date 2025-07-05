"use client";
import React from "react";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "../../../components/Loading";
import Image from "next/image";
import Link from "next/link";
import DefaultProfileSVG from "../../../components/DefaultProfileSVG"; // Import a default SVG component (create if not exists)

export default function PlayerPage(props) {
  const params =
    typeof React.use === "function" && typeof props.params?.then === "function"
      ? React.use(props.params)
      : props.params;
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState("");
  const [profilePicError, setProfilePicError] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/movies?id=${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setMovie(data);
        setLoading(false);
      });
    if (typeof window !== "undefined") {
      let pic = localStorage.getItem("rusil_profilePic") || "";
      if (!pic) {
        fetch("/api/users.json")
          .then((res) => res.json())
          .then((users) => {
            const demoUser = users.find((u) => u.username === "rusil");
            setProfilePic(demoUser?.profilePicture || "");
          });
      } else {
        setProfilePic(pic);
      }
    }
  }, [params?.id]);

  if (!params?.id) return notFound();
  if (loading) return <Loading />;
  if (!movie) return notFound();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-2">
      {/* Transparent Navbar with logo, Home, and profile icon */}
      <div className="fixed top-0 left-0 w-full flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent z-20">
        <a href="/home">
          <Image
            src="/logo/logo.png"
            alt="Rusil Stream Logo"
            width={120}
            height={40}
            priority
          />
        </a>
        <div className="flex items-center gap-4">
          <a
            href="/home"
            className="text-white font-semibold text-lg hover:text-[#E50914] transition"
          >
            Home
          </a>
          <a href="/settings" className="ml-2">
            {profilePic && !profilePicError ? (
              <img
                src={profilePic}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-white bg-gray-800"
                onError={() => setProfilePicError(true)}
              />
            ) : (
              <DefaultProfileSVG className="w-10 h-10 text-gray-400 bg-gray-800 rounded-full border-2 border-white" />
            )}
          </a>
        </div>
      </div>
      {/* Main content: stacked layout always */}
      <div className="w-full max-w-4xl flex flex-col gap-8 mt-24 mb-12">
        {/* Video Player */}
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
          <iframe
            src={`https://vidsrc.to/embed/movie/${params.id}`}
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
        {/* Movie Details */}
        <div className="bg-[#181818]/70 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/10 transition-all duration-300">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {movie.title}
          </h1>
          <div className="flex flex-wrap gap-4 items-center mb-2">
            {movie.release_date && (
              <span className="text-gray-400 font-semibold">
                {movie.release_date.slice(0, 4)}
              </span>
            )}
            {movie.vote_average && (
              <span className="bg-[#E50914] text-white px-2 py-1 rounded text-xs font-bold">
                ★ {movie.vote_average.toFixed(1)}
              </span>
            )}
          </div>
          <p className="text-gray-200 text-lg mb-4">
            {movie.overview && movie.overview.trim().length > 0
              ? movie.overview
              : "Failed to get description ..."}
          </p>
          <div className="flex flex-wrap gap-2 text-sm text-gray-400">
            {movie.genres && movie.genres.length > 0 && (
              <span>Genres: {movie.genres.map((g) => g.name).join(", ")}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
