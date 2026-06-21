'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const STORAGE_KEY = 'brave-banner-dismissed';

function isBraveBrowser(): boolean {
  // Brave exposes navigator.brave with an isBrave() method
  return typeof window !== 'undefined' && !!(navigator as unknown as { brave?: { isBrave?: unknown } }).brave;
}

function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isDismissed(): boolean {
  try {
    return (
      localStorage.getItem(STORAGE_KEY) === 'true' ||
      document.cookie.split(';').some((c) => c.trim().startsWith(`${STORAGE_KEY}=true`))
    );
  } catch {
    return false;
  }
}

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
    // Cookie expires in 1 year
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${STORAGE_KEY}=true; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}

export function BraveBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show on mobile, if already dismissed, or if already using Brave
    if (isMobileDevice() || isDismissed() || isBraveBrowser()) return;
    setVisible(true);
  }, []);

  function dismiss() {
    persist();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-label="Use Brave Browser recommendation"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-4 px-5 py-3.5 rounded-xl shadow-2xl"
      style={{
        background: 'rgba(16, 16, 16, 0.92)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        maxWidth: '480px',
        width: 'calc(100vw - 3rem)',
      }}
    >
      {/* Brave icon */}
      <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center">
        <Image
          src="/brave.svg"
          alt="Brave Browser"
          width={36}
          height={36}
          priority
          style={{ width: 36, height: 36 }}
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium leading-snug">
          Better with Brave
        </p>
        <p className="text-[#B3B3B3] text-xs leading-snug mt-0.5">
          Watch without ads — Brave blocks them automatically.
        </p>
      </div>

      {/* Download button */}
      <a
        href="https://brave.com/download/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors duration-150"
        style={{
          background: '#E50914',
          color: '#ffffff',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = '#c40812';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = '#E50914';
        }}
      >
        Download
      </a>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss banner"
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md transition-colors duration-150 text-[#B3B3B3] hover:text-white hover:bg-white/10"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M1 1l10 10M11 1L1 11"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
