"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      document.cookie = `username=${encodeURIComponent(data.user?.username || "")}; Path=/; SameSite=Lax`;
      router.replace("/home");
    } else {
      const data = await res.json();
      setError(data.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
      {/* Background image with dark overlay */}
      <div className="absolute inset-0 w-full h-full -z-10">
        <Image
          src="/bg.jpg"
          alt="Background"
          fill
          className="object-cover w-full h-full"
          priority
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <div className="flex flex-col items-center mb-8 z-10">
        <span
          className="text-4xl md:text-5xl font-extrabold tracking-tight select-none font-sans px-8 py-3 rounded-2xl bg-black/60 backdrop-blur-lg border border-white/15 shadow-lg text-[#E50914] drop-shadow-lg"
          style={{
            letterSpacing: "2px",
            textShadow: "0 2px 16px #000, 0 1px 0 #E50914",
          }}
        >
          Rusil Stream
        </span>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-black/60 backdrop-blur-lg border border-white/15 rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col gap-6 z-10 transition-all duration-300"
      >
        <h2 className="text-2xl font-bold mb-2 text-center">Sign In</h2>
        <input
          type="text"
          placeholder="Username"
          className="px-4 py-3 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] placeholder-gray-300 transition-all duration-200"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="px-4 py-3 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] placeholder-gray-300 transition-all duration-200"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        <button
          type="submit"
          className="bg-[#E50914] hover:bg-[#b0060f] text-white font-bold py-3 rounded-lg transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
