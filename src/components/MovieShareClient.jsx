'use client';

import { useState } from 'react';

export default function MovieShareClient({ url, title }) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareOn = (platform) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(`Check out "${title}" on Rusil Stream`);
    
    const links = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=Check out this movie: ${url}`
    };

    window.open(links[platform], '_blank', 'width=600,height=400');
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="group bg-gradient-to-r from-red-600 via-pink-600 to-orange-500 text-white px-7 py-3 rounded-xl font-semibold shadow-[0_10px_30px_rgba(229,9,20,0.35)] hover:shadow-[0_12px_40px_rgba(229,9,20,0.45)] transition-all flex items-center gap-2 cursor-pointer"
      >
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm transition-transform group-hover:-translate-y-0.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </span>
        <span className="text-lg">Share</span>
      </button>

      {showMenu && (
        <div
          className="absolute top-full mt-3 right-0 z-50 min-w-[240px] rounded-2xl bg-black/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.55)] animate-fade-in"
          style={{ zIndex: 9999 }}
        >
          <div className="px-4 pt-4 pb-3 border-b border-white/5">
            <p className="text-sm text-gray-400">Share this title</p>
            <p className="text-base font-semibold text-white truncate">{title}</p>
          </div>

          <div className="p-3">
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition text-left text-white cursor-pointer"
            >
              <span className={`flex items-center justify-center w-10 h-10 rounded-xl ${copied ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white"}`}>
                {copied ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                )}
              </span>
              <div className="flex flex-col text-sm font-semibold leading-tight">
                <span>{copied ? "Link copied" : "Copy link"}</span>
                <span className="text-xs text-gray-400">{url}</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
