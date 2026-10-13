'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { UnifiedHomeScreen } from '@/components/home';
import { useProfiles, useCreateProfile } from '@/lib/hooks/use-user-data';

export function ProfileGate() {
  const { user, isLoaded: userLoaded } = useUser();
  const { data: profiles = [], isLoading: profilesLoading } = useProfiles();
  const createProfile = useCreateProfile();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!userLoaded || profilesLoading || initializedRef.current) return;

    const currentProfileId = localStorage.getItem('selectedProfileId');

    if (profiles.length > 0) {
      const exists = profiles.some((p) => (p.id || p._id) === currentProfileId);
      const activeId = exists ? currentProfileId! : (profiles[0].id || profiles[0]._id || '');
      if (activeId) {
        localStorage.setItem('selectedProfileId', activeId);
      }
      initializedRef.current = true;
    } else if (user) {
      // Auto-create a default profile in background with Clerk user details
      initializedRef.current = true;
      const defaultName = user.firstName || user.fullName || 'Main Profile';
      const defaultAvatar = user.imageUrl || '/avatars/avatar1.png';

      createProfile.mutate(
        {
          name: defaultName,
          avatarUrl: defaultAvatar,
          isKids: false,
          maturityRating: 'R',
          pinEnabled: false,
          pinRequired: false,
          language: 'en',
          preferences: {
            autoplayNextEpisode: true,
            autoplayPreviews: true,
            dataSaverMode: false,
            subtitleLanguage: 'en',
            audioLanguage: 'en',
            selectedGenres: [],
            notifications: {
              enabled: true,
              newReleases: true,
              watchlistUpdates: true,
              recommendedContent: true,
              episodeReminders: true,
            },
          },
        },
        {
          onSuccess: (newProf) => {
            const newId = newProf.id || newProf._id;
            if (newId) {
              localStorage.setItem('selectedProfileId', newId);
            }
          },
          onError: () => {
            // Fallback to user ID if DB write fails
            localStorage.setItem('selectedProfileId', user.id);
          },
        }
      );
    }
  }, [user, userLoaded, profiles, profilesLoading, createProfile]);

  return <UnifiedHomeScreen />;
}
