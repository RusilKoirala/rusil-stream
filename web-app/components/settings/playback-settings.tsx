'use client';

import { useEffect, useState } from 'react';
import { useProfiles } from '@/lib/hooks/use-user-data';
import { useUpdateProfile } from '@/lib/hooks/use-user-data';
import { LoadingSpinner } from '@/components/ui/skeleton';
import { Play, Wifi } from 'lucide-react';
import type { ProfilePreferences } from '@/lib/db/types';

export function PlaybackSettings() {
  const { data: profiles = [], isLoading } = useProfiles();
  const updateProfile = useUpdateProfile();
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const getProfileId = (profile: { id?: string; _id?: string }) => profile.id || profile._id || '';

  useEffect(() => {
    const currentProfile = localStorage.getItem('selectedProfileId') || '';
    if (currentProfile) {
      setSelectedProfileId(currentProfile);
    }
  }, []);

  useEffect(() => {
    if (selectedProfileId) return;
    if (profiles.length > 0) {
      setSelectedProfileId(getProfileId(profiles[0]));
    }
  }, [profiles, selectedProfileId]);

  const selectedProfile = profiles.find((p) => getProfileId(p) === selectedProfileId);
  const prefs = selectedProfile?.preferences || {
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
  };

  const handleToggle = async (key: keyof ProfilePreferences) => {
    if (!selectedProfileId || !selectedProfile) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      const updatedPrefs = {
        autoplayNextEpisode: selectedProfile.preferences?.autoplayNextEpisode ?? true,
        autoplayPreviews: selectedProfile.preferences?.autoplayPreviews ?? true,
        dataSaverMode: selectedProfile.preferences?.dataSaverMode ?? false,
        subtitleLanguage: selectedProfile.preferences?.subtitleLanguage ?? 'en',
        audioLanguage: selectedProfile.preferences?.audioLanguage ?? 'en',
        selectedGenres: selectedProfile.preferences?.selectedGenres ?? [],
        notifications: selectedProfile.preferences?.notifications ?? {
          enabled: true,
          newReleases: true,
          watchlistUpdates: true,
          recommendedContent: true,
          episodeReminders: true,
        },
        [key]: !prefs[key],
      };

      await updateProfile.mutateAsync({
        id: selectedProfileId,
        data: { preferences: updatedPrefs },
      });

      setSaveMessage('✓ Saved successfully');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      setSaveMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-white/70">No profiles found. Create a profile first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Current Profile</label>
        <select
          value={selectedProfileId}
          onChange={(e) => setSelectedProfileId(e.target.value)}
          required
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white focus:border-white/40 focus:outline-none"
        >
          <option value="">Choose a profile...</option>
          {profiles.map((profile) => (
            <option key={getProfileId(profile)} value={getProfileId(profile)}>
              {profile.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-white/60">Playback preferences are synced with the selected profile.</p>
      </div>

      {selectedProfile && (
        <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-6">
          {/* Autoplay Settings */}
          <div className="space-y-4 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Play className="h-5 w-5 text-white/70" />
                <div>
                  <p className="font-medium text-white">Autoplay Next Episode</p>
                  <p className="text-sm text-white/50">Automatically play the next episode</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('autoplayNextEpisode')}
                disabled={isSaving}
                className={`relative h-8 w-14 rounded-full transition-colors ${
                  prefs.autoplayNextEpisode ? 'bg-red-600' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${
                    prefs.autoplayNextEpisode ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Play className="h-5 w-5 text-white/70" />
                <div>
                  <p className="font-medium text-white">Autoplay Previews</p>
                  <p className="text-sm text-white/50">Play preview videos when browsing</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('autoplayPreviews')}
                disabled={isSaving}
                className={`relative h-8 w-14 rounded-full transition-colors ${
                  prefs.autoplayPreviews ? 'bg-red-600' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${
                    prefs.autoplayPreviews ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Data Saving */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 text-white/70" />
              <div>
                <p className="font-medium text-white">Data Saver Mode</p>
                <p className="text-sm text-white/50">Reduce video quality to save data</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('dataSaverMode')}
              disabled={isSaving}
              className={`relative h-8 w-14 rounded-full transition-colors ${
                prefs.dataSaverMode ? 'bg-red-600' : 'bg-white/20'
              }`}
            >
              <div
                className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${
                  prefs.dataSaverMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`rounded-lg p-3 text-sm ${
              saveMessage.includes('✓') 
                ? 'bg-green-900/20 text-green-200' 
                : 'bg-red-900/20 text-red-200'
            }`}>
              {saveMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
