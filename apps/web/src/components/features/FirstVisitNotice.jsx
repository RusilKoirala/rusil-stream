'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'rs_seen_brave_notice_v1';

export default function FirstVisitNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        // Detect Brave softly; fall back to showing once for others.
        const detectBrave = async () => {
          try {
            if (navigator.brave && (await navigator.brave.isBrave?.())) {
              setVisible(true);
              return;
            }
          } catch (_) {
            /* ignore */
          }
          // Show once for non-Brave too, then remember dismissal
          setVisible(true);
        };
        detectBrave();
      }
    } catch (err) {
      console.error('Notice init failed', err);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (_) {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] px-4 w-full max-w-3xl">
      <div className="bg-black/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] px-5 py-4 text-white flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/8 border border-white/10">
            <img src="/brave.svg" alt="Brave" className="w-8 h-8" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-base font-semibold">Zero-ad experience</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              For the cleanest playback, watch with Brave (built-in ad blocking). One-time heads up; dismiss to continue.
            </p>
          </div>
          <button
            onClick={dismiss}
            className="ml-3 text-sm text-gray-300 hover:text-white transition"
            aria-label="Dismiss notice"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={dismiss}
            className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition"
          >
            Got it
          </button>
          <button
            onClick={() => window.open('https://brave.com/download/', '_blank')}
            className="px-4 py-2 rounded-lg bg-green-500/20 text-white border border-green-400/30 hover:bg-green-500/30 transition font-semibold inline-flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
            </svg>
            Download Brave
          </button>
        </div>
      </div>
    </div>
  );
}
