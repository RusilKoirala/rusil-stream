"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

function getCookie(name) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : "";
}

export default function Navbar() {
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState("");

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

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-black/80 border-b border-white/10">
      <Link href="/home" className="text-2xl font-bold text-[#E50914]">Rusil Stream</Link>
      <div className="flex items-center gap-4">
        {profilePic ? (
          <Image src={profilePic} alt="Profile" width={40} height={40} className="rounded-full border-2 border-[#E50914] object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold border-2 border-[#E50914]">{username[0] ? username[0].toUpperCase() : "U"}</div>
        )}
      </div>
    </nav>
  );
}
