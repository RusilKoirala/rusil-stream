'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProfileForm } from './profile-form';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Profile {
  _id: string;
  name: string;
  avatarUrl: string;
  isKids: boolean;
  maturityRating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
  pinEnabled: boolean;
  language: string;
}

interface ProfileFormData {
  name: string;
  avatarUrl: string;
  maturityRating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
  pinEnabled: boolean;
  language: string;
}

/**
 * ProfileManager Component
 * 
 * Displays grid of existing profiles with edit/delete actions.
 * Shows "Add Profile" button if under 5 profiles.
 * Implements create, edit, delete flows calling Profile API routes.
 * 
 * Requirements: 2.4, 18.3
 */
export function ProfileManager() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profiles');

      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }

      const data = await response.json();
      setProfiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (data: ProfileFormData) => {
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          isKids: data.maturityRating === 'G' || data.maturityRating === 'PG',
          preferences: {
            autoplayNextEpisode: true,
            autoplayPreviews: true,
            dataSaverMode: false,
            subtitleLanguage: data.language,
            audioLanguage: data.language,
            selectedGenres: [],
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create profile');
      }

      await fetchProfiles();
      setMode('list');
    } catch (err) {
      console.error('Error creating profile:', err);
      throw err;
    }
  };

  const handleUpdateProfile = async (data: ProfileFormData) => {
    if (!selectedProfile) return;

    try {
      const response = await fetch(`/api/profiles/${selectedProfile._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      await fetchProfiles();
      setMode('list');
      setSelectedProfile(null);
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) {
      return;
    }

    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete profile');
      }

      await fetchProfiles();
    } catch (err) {
      console.error('Error deleting profile:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete profile');
    }
  };

  const handleEditProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setMode('edit');
  };

  const handleCancel = () => {
    setMode('list');
    setSelectedProfile(null);
  };

  const handleDone = () => {
    router.push('/profiles');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 py-14">
        <div className="text-white text-xl">Loading profiles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 py-14">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="px-1 py-2">
      <div className="mx-auto max-w-6xl">
        {mode === 'list' ? (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-white">Manage Profiles</h1>
                <p className="mt-1 text-sm text-white/60">Up to 5 profiles per account</p>
              </div>
              <Button
                variant="outline"
                onClick={handleDone}
                className="border-white/25 text-white/75 hover:border-white hover:text-white"
              >
                Done
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
              {profiles.map((profile) => (
                <Card
                  key={profile._id}
                  className="group border-white/10 bg-white/[0.03] p-5 transition hover:border-white/25 hover:bg-white/[0.06]"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-28 w-28 overflow-hidden rounded-md border border-white/10 shadow-[0_8px_22px_rgba(0,0,0,0.35)]">
                      <Image
                        src={profile.avatarUrl}
                        alt={profile.name}
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-center text-base font-semibold text-white">
                      {profile.name}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => handleEditProfile(profile)}
                        className="border-white/30 text-white/70 hover:border-white hover:text-white"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => handleDeleteProfile(profile._id)}
                        className="border-red-500/70 text-red-300 hover:border-red-400 hover:bg-red-500/15 hover:text-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {profiles.length < 5 && (
                <Card
                  className={cn(
                    'border border-dashed border-white/20 bg-white/[0.02] p-5',
                    'cursor-pointer transition hover:border-white/45 hover:bg-white/[0.06]',
                    'flex items-center justify-center'
                  )}
                  onClick={() => setMode('create')}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-28 w-28 items-center justify-center rounded-md border border-white/20 bg-white/[0.03]">
                      <Plus className="h-10 w-10 text-white/65" />
                    </div>
                    <h3 className="text-base font-semibold text-white/75">
                      Add Profile
                    </h3>
                  </div>
                </Card>
              )}
            </div>
          </>
        ) : mode === 'create' ? (
          <>
            <h1 className="mb-8 text-3xl font-semibold text-white">Add Profile</h1>
            <ProfileForm
              onSubmit={handleCreateProfile}
              onCancel={handleCancel}
              submitLabel="Create Profile"
            />
          </>
        ) : (
          <>
            <h1 className="mb-8 text-3xl font-semibold text-white">Edit Profile</h1>
            <ProfileForm
              initialData={selectedProfile || undefined}
              onSubmit={handleUpdateProfile}
              onCancel={handleCancel}
              submitLabel="Save Changes"
            />
          </>
        )}
      </div>
    </div>
  );
}
