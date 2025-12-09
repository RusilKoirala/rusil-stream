"use client";
import Logo from "./Logo";

export default function Loading({ fullScreen = true }) {
  if (!fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black"></div>
      
      {/* Minimal content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
  
        
        {/* Clean spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
