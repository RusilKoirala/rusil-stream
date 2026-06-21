'use client';

import { useQuery, useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import type { ProfilePreferences } from '@/lib/db';
import type { Content } from '@/lib/tmdb/types';

export interface Profile {
  id?: string;
  _id?: string;
  name: string;
  avatarUrl?: string;
  isKids?: boolean;
  maturityRating?: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
  pinEnabled?: boolean;
  language?: string;
  avatar?: string;
  pinRequired: boolean;
  preferences?: ProfilePreferences;
}

export interface WatchProgress {
  contentId: string;
  type: 'movie' | 'tv';
  progress: number;
  duration: number;
  updatedAt: string;
}

export interface Rating {
  contentId: string;
  rating: number;
  updatedAt: string;
}

class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

// Profiles
export function useProfiles(options?: { enabled?: boolean }) {
  const { isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const response = await fetch('/api/profiles', { cache: 'default' });

      if (!response.ok) {
        throw new HttpError('Failed to fetch profiles', response.status);
      }

      return response.json() as Promise<Profile[]>;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    enabled: isLoaded && isSignedIn && options?.enabled !== false,
    retry: (failureCount, error) => {
      if (error instanceof HttpError && (error.status === 401 || error.status === 403)) {
        return false;
      }

      return failureCount < 1;
    },
  });
}

export function useCreateProfile(): UseMutationResult<Profile, Error, Omit<Profile, 'id'>> {
  const queryClient = useQueryClient();
  return useMutation<Profile, Error, Omit<Profile, 'id'>>({
    mutationFn: async (data: Omit<Profile, 'id'>) => {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create profile');
      return response.json() as Promise<Profile>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

export function useUpdateProfile(): UseMutationResult<Profile, Error, { id: string; data: Partial<Profile> }> {
  const queryClient = useQueryClient();
  return useMutation<Profile, Error, { id: string; data: Partial<Profile> }>({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Profile> }) => {
      const response = await fetch(`/api/profiles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json() as Promise<Profile>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

export function useDeleteProfile(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete profile');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

// Watchlist
export function useWatchlist(profileId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['watchlist', profileId],
    queryFn: async () => {
      const response = await fetch(`/api/watchlist?profileId=${profileId}`, { cache: 'default' });
      if (!response.ok) throw new Error('Failed to fetch watchlist');
      return response.json() as Promise<Content[]>;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    enabled: !!profileId && options?.enabled !== false,
  });
}

interface AddToWatchlistData {
  contentId: string;
  type: 'movie' | 'tv';
  profileId: string;
}

export function useAddToWatchlist(): UseMutationResult<void, Error, AddToWatchlistData> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, AddToWatchlistData>({
    mutationFn: async (data: AddToWatchlistData) => {
      const payload = {
        profileId: data.profileId,
        contentId: data.contentId,
        contentType: data.type,
      };

      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = 'Failed to add to watchlist';
        let errorCode: string | undefined;
        try {
          const errorData = await response.json();
          if (typeof errorData?.error === 'string') {
            errorCode = errorData.error;
          }
          if (typeof errorData?.message === 'string') {
            message = errorData.message;
          }
        } catch {
          // Ignore JSON parse errors and keep fallback message.
        }

        const isDuplicateEntry =
          response.status === 409 ||
          errorCode === 'DUPLICATE_ENTRY' ||
          message.toLowerCase().includes('already in watchlist');

        if (isDuplicateEntry) {
          // Treat duplicate add as a successful no-op.
          return;
        }

        throw new Error(message);
      }
    },
    onSuccess: (_: void, variables: AddToWatchlistData) => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', variables.profileId] });
    },
  });
}

interface RemoveFromWatchlistData {
  contentId: string;
  profileId: string;
}

export function useRemoveFromWatchlist(): UseMutationResult<void, Error, RemoveFromWatchlistData> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, RemoveFromWatchlistData>({
    mutationFn: async (data: RemoveFromWatchlistData) => {
      const response = await fetch(
        `/api/watchlist/${data.contentId}?profileId=${data.profileId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        let message = 'Failed to remove from watchlist';
        let errorCode: string | undefined;

        try {
          const errorData = await response.json();
          if (typeof errorData?.error === 'string') {
            errorCode = errorData.error;
          }
          if (typeof errorData?.message === 'string') {
            message = errorData.message;
          }
        } catch {
          // Ignore JSON parse errors and keep fallback message.
        }

        const isAlreadyRemoved =
          response.status === 404 ||
          errorCode === 'NOT_FOUND' ||
          message.toLowerCase().includes('not found');

        if (isAlreadyRemoved) {
          // Treat removing a missing item as a successful no-op.
          return;
        }

        throw new Error(message);
      }
    },
    onSuccess: (_: void, variables: RemoveFromWatchlistData) => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', variables.profileId] });
    },
  });
}

// Watch Progress
export function useWatchProgress(profileId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['watch-progress', profileId],
    queryFn: async () => {
      const response = await fetch(`/api/watch-progress?profileId=${profileId}`, { cache: 'default' });
      if (!response.ok) throw new Error('Failed to fetch watch progress');
      return response.json() as Promise<WatchProgress[]>;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    enabled: !!profileId && options?.enabled !== false,
  });
}

interface UpdateWatchProgressData extends WatchProgress {
  profileId: string;
}

export function useUpdateWatchProgress(): UseMutationResult<void, Error, UpdateWatchProgressData> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateWatchProgressData>({
    mutationFn: async (data: UpdateWatchProgressData) => {
      const { profileId, ...payload } = data;
      const response = await fetch('/api/watch-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, profileId }),
      });
      if (!response.ok) throw new Error('Failed to update watch progress');
    },
    onSuccess: (_: void, variables: UpdateWatchProgressData) => {
      queryClient.invalidateQueries({ queryKey: ['watch-progress', variables.profileId] });
    },
  });
}

// Ratings
export function useRatings(profileId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['ratings', profileId],
    queryFn: async () => {
      const response = await fetch(`/api/ratings?profileId=${profileId}`, { cache: 'default' });
      if (!response.ok) throw new Error('Failed to fetch ratings');
      return response.json() as Promise<Rating[]>;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    enabled: !!profileId && options?.enabled !== false,
  });
}

interface SetRatingData extends Rating {
  profileId: string;
}

export function useSetRating(): UseMutationResult<void, Error, SetRatingData> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, SetRatingData>({
    mutationFn: async (data: SetRatingData) => {
      const { profileId, ...payload } = data;
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, profileId }),
      });
      if (!response.ok) throw new Error('Failed to set rating');
    },
    onSuccess: (_: void, variables: SetRatingData) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', variables.profileId] });
    },
  });
}

// Continue Watching (Recent)
export function useContinueWatching(profileId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['continue-watching', profileId],
    queryFn: async () => {
      const response = await fetch(
        `/api/watch-progress?profileId=${profileId}&limit=10`,
        { cache: 'default' }
      );
      if (!response.ok) throw new Error('Failed to fetch continue watching');
      return response.json() as Promise<WatchProgress[]>;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    enabled: !!profileId && options?.enabled !== false,
  });
}
