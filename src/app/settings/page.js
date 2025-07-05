"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

function getCookie(name) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : "";
}

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const user = getCookie("username");
    setUsername(user);
    if (user) {
      fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: "" })
      })
        .then(res => res.json())
        .then(data => setProfilePic(data.user?.profilePicture || ""));
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    document.cookie = `username=${encodeURIComponent(username)}; Path=/; SameSite=Lax`;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-[#141414] text-white">
      <div className="flex flex-col items-center mb-8">
        <span className="text-4xl md:text-5xl font-extrabold tracking-tight select-none font-sans px-8 py-3 rounded-2xl bg-black/60 backdrop-blur-lg border border-white/15 shadow-lg text-[#E50914] drop-shadow-lg" style={{ letterSpacing: "2px", textShadow: "0 2px 16px #000, 0 1px 0 #E50914" }}>Rusil Stream</span>
      </div>
      <form onSubmit={handleSave} className="bg-black/60 backdrop-blur-lg border border-white/15 rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-6">
        <h2 className="text-2xl font-bold mb-2 text-center">Profile Settings</h2>
        <div className="flex flex-col items-center gap-2">
          {profilePic ? (
            <Image src={profilePic} alt="Profile" width={80} height={80} className="rounded-full border-2 border-[#E50914] bg-white/10 object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-3xl font-bold border-2 border-[#E50914]">{username[0] ? username[0].toUpperCase() : "U"}</div>
          )}
        </div>
        <input
          type="text"
          placeholder="Username"
          className="px-4 py-3 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] placeholder-gray-300 transition-all duration-200"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          type="submit"
          className="bg-[#E50914] hover:bg-[#b0060f] text-white font-bold py-3 rounded-lg transition"
        >
          Save
        </button>
        {saved && <div className="text-green-400 text-center">Profile updated!</div>}
      </form>
    </div>
  );
}
