'use client';

import { useEffect, useMemo, useState } from 'react';
import { TopNav } from '@/components/navigation';
import { HomeScreen } from '@/components/home';
import { ProfilePicker } from './profile-picker';
import { useProfiles } from '@/lib/hooks/use-user-data';

interface Profile {
  id?: string;
  _id?: string;
}

export function ProfileGate() {
  const { data: profiles = [], isLoading } = useProfiles();
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSelectedProfileId(localStorage.getItem('selectedProfileId') || '');
    setIsReady(true);
  }, []);

  const hasValidProfileSelected = useMemo(() => {
    if (!selectedProfileId) return false;

    return (profiles as Profile[]).some((profile) => {
      const profileId = profile.id || profile._id || '';
      return profileId === selectedProfileId;
    });
  }, [profiles, selectedProfileId]);

  if (!isReady || isLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-white/80 text-lg">Loading...</div>
      </div>
    );
  }

  if (!hasValidProfileSelected) {
    return <ProfilePicker onProfileSelected={setSelectedProfileId} />;
  }

  return (
    <>
      <TopNav />
      <HomeScreen />
    </>
  );
}
