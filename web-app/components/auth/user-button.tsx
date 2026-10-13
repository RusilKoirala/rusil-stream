'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { Settings, LogOut, User as UserIcon, ChevronRight } from 'lucide-react';

interface UserButtonProps {
  onTabChange?: (tab: any) => void;
  activeTab?: string;
}

export function UserButton({ onTabChange, activeTab }: UserButtonProps) {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      window.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!isLoaded) {
    return (
      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/10 animate-pulse border border-white/15" />
    );
  }

  if (!isSignedIn || !user) {
    return (
      <button
        type="button"
        onClick={() => router.push('/sign-in')}
        className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/80 hover:border-white/60 hover:text-white hover:bg-black/70 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl backdrop-blur-2xl cursor-pointer"
        title="Sign In"
      >
        <UserIcon className="h-4 w-4" />
      </button>
    );
  }

  const displayName = user.fullName || user.firstName || 'User';
  const email = user.primaryEmailAddress?.emailAddress || '';
  const initial = (user.firstName?.[0] || displayName[0] || 'U').toUpperCase();

  const handleSettingsClick = () => {
    setOpen(false);
    if (onTabChange) {
      onTabChange('settings');
    } else {
      router.push('/settings');
    }
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Profile Avatar Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border bg-black/45 p-0.5 shadow-xl backdrop-blur-2xl cursor-pointer transition-all duration-200 group ${
          open || activeTab === 'settings'
            ? 'border-white ring-2 ring-white/35 scale-105 shadow-[0_0_15px_rgba(255,255,255,0.35)]'
            : 'border-white/20 hover:border-white/60 hover:ring-2 hover:ring-white/20 hover:scale-105 active:scale-95'
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="User profile menu"
      >
        <div className="relative h-full w-full overflow-hidden rounded-full bg-[#1e2029]">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={displayName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-[#e50914] to-[#ff4b55] text-xs font-bold text-white">
              {initial}
            </div>
          )}
        </div>
      </button>

      {/* Smooth Glassmorphism Dropdown */}
      <div
        role="menu"
        className={`absolute right-0 top-full mt-2.5 w-68 overflow-hidden rounded-2xl border border-white/12 bg-[#12141c]/95 p-2 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-3xl z-50 origin-top-right transition-all duration-200 ease-out ${
          open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none invisible'
        }`}
      >
        {/* User Identity Header */}
        <div className="p-3 border-b border-white/10 flex items-center gap-3 bg-white/[0.02] rounded-xl">
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-white/20 ring-2 ring-white/10 bg-[#1e2029]">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={displayName}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-[#e50914] to-[#ff4b55] text-xs font-bold text-white">
                {initial}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white leading-snug">
              {displayName}
            </p>
            {email && (
              <p className="truncate text-xs text-white/50 leading-snug">
                {email}
              </p>
            )}
          </div>
        </div>

        {/* Menu Options */}
        <div className="pt-2 pb-1 space-y-1">
          {/* Settings option */}
          <button
            type="button"
            onClick={handleSettingsClick}
            className="group/item flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="h-4 w-4 text-white/70 group-hover/item:text-white group-hover/item:rotate-45 transition-transform duration-300" />
              <span className="font-medium">Settings</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-white/30 group-hover/item:text-white/70 group-hover/item:translate-x-0.5 transition-all duration-200" />
          </button>

          {/* Divider */}
          <div className="h-px bg-white/10 mx-2 my-1" />

          {/* Sign Out option */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              // Clear locally cached per-account data so the next user on this
              // device does not inherit this account's watch history / cache.
              localStorage.removeItem('cinrift_continue_watching');
              localStorage.removeItem('continue_watching');
              localStorage.removeItem('selectedProfileId');
              queryClient.clear();
              signOut({ redirectUrl: '/' });
            }}
            className="group/out flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all duration-150 cursor-pointer"
          >
            <LogOut className="h-4 w-4 transition-transform duration-200 group-hover/out:-translate-x-0.5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
