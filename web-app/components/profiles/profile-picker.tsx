'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useProfiles } from '@/lib/hooks/use-user-data';
import Image from 'next/image';
import { Pencil } from 'lucide-react';

interface ProfilePickerProps {
  onProfileSelected?: (profileId: string) => void;
}

/**
 * ProfilePicker Component
 * 
 * Full-screen profile selection grid.
 * Displays grid of profile avatars with names using shadcn/ui Card.
 * Fetches profiles from GET /api/profiles.
 * Navigates to home screen on profile selection.
 * Shows "Manage Profiles" button.
 * Styled with dark background (#141414) and Netflix layout.
 * 
 * Requirements: 2.2, 2.3, 2.4
 */
export function ProfilePicker({ onProfileSelected }: ProfilePickerProps) {
  const router = useRouter();
  const { data: profiles = [], isLoading, isError } = useProfiles();

  const normalizedProfiles = useMemo(() => {
    return profiles
      .map((profile) => ({
        profileId: profile.id || profile._id || '',
        name: profile.name,
        avatarUrl: profile.avatarUrl || '/avatars/avatar1.png',
      }))
      .filter((profile) => Boolean(profile.profileId));
  }, [profiles]);

  const handleProfileSelect = (profileId: string) => {
    localStorage.setItem('selectedProfileId', profileId);

    if (onProfileSelected) {
      onProfileSelected(profileId);
      return;
    }

    router.push('/');
  };

  const handleManageProfiles = () => {
    router.push('/settings');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center px-4">
        <div className="text-white/80 text-lg">Loading profiles...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-red-300 text-lg">Unable to load profiles.</div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="border-white/30 text-white/80 hover:border-white hover:text-white"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#141414] px-4 py-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(229,9,20,0.14),transparent_40%),radial-gradient(circle_at_80%_90%,rgba(255,255,255,0.06),transparent_35%)]" />

      <div className="relative mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col items-center justify-center">
        <h1 className="mb-14 text-center text-4xl font-semibold tracking-tight text-white md:text-5xl">
          Who&apos;s watching?
        </h1>

        <div className="mb-14 grid w-full max-w-4xl grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {normalizedProfiles.map((profile) => (
            <button
              key={profile.profileId}
              onClick={() => handleProfileSelect(profile.profileId)}
              className="group flex flex-col items-center gap-3"
            >
              <div className="relative aspect-square w-full max-w-[156px] overflow-hidden rounded-md border-2 border-transparent bg-white/5 transition duration-200 group-hover:scale-[1.04] group-hover:border-white group-focus:border-white group-focus:outline-none">
                <Image
                  src={profile.avatarUrl}
                  alt={profile.name}
                  fill
                  sizes="(max-width: 768px) 33vw, 156px"
                  className="object-cover"
                />
              </div>
              <span className="text-base text-[#B3B3B3] transition-colors group-hover:text-white group-focus:text-white">
                {profile.name}
              </span>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleManageProfiles}
            className="h-11 rounded-none border-[#808080] px-8 tracking-[0.2em] text-[#808080] uppercase hover:border-white hover:bg-transparent hover:text-white"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Manage Profiles
          </Button>
        </div>
      </div>
    </div>
  );
}
