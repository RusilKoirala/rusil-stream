'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignOutButton } from '@clerk/nextjs';
import { ChevronDown, LogOut, Settings, UserCircle2 } from 'lucide-react';
import { useProfiles } from '@/lib/hooks/use-user-data';

/**
 * UserButton - Custom profile menu component
 * 
 * Displays selected profile avatar and a custom dropdown with
 * settings and Clerk sign out actions.
 * 
 * Requirements: 15.11, 15.12
 * 
 * @example
 * ```tsx
 * <UserButton />
 * ```
 */
export function UserButton() {
  const { data: profiles = [] } = useProfiles();
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = localStorage.getItem('selectedProfileId') || '';
    setSelectedProfileId(current);

    const onStorage = () => {
      setSelectedProfileId(localStorage.getItem('selectedProfileId') || '');
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      window.addEventListener('mousedown', handleOutsideClick);
    }

    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const selectedProfile = useMemo(() => {
    const match = profiles.find((profile) => {
      const profileId = profile.id || profile._id || '';
      return profileId === selectedProfileId;
    });

    return match || profiles[0];
  }, [profiles, selectedProfileId]);

  const avatarUrl = selectedProfile?.avatarUrl || '/avatars/avatar1.png';
  const profileName = selectedProfile?.name || 'Profile';

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-black/35 px-2 py-1 text-white/90 hover:bg-black/55"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
      >
        <div className="relative h-8 w-8 overflow-hidden rounded-sm border border-white/20">
          <Image
            src={avatarUrl}
            alt={profileName}
            fill
            sizes="32px"
            className="object-cover"
          />
        </div>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border border-white/15 bg-[#181818] shadow-[0_16px_34px_rgba(0,0,0,0.55)]"
        >
          <div className="border-b border-white/10 px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 overflow-hidden rounded-sm border border-white/20">
                <Image src={avatarUrl} alt={profileName} fill sizes="32px" className="object-cover" />
              </div>
              <span className="truncate text-sm text-white">{profileName}</span>
            </div>
          </div>

          <div className="p-1.5">
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded px-2.5 py-2 text-sm text-white/90 hover:bg-white/10"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>

            <Link
              href="/"
              className="flex items-center gap-2 rounded px-2.5 py-2 text-sm text-white/90 hover:bg-white/10"
              role="menuitem"
              onClick={() => {
                localStorage.removeItem('selectedProfileId');
                setOpen(false);
              }}
            >
              <UserCircle2 className="h-4 w-4" />
              Switch Profile
            </Link>

            <SignOutButton>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-sm text-white/90 hover:bg-white/10"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
