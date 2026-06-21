'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Play, Plus, Check, Star, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAddToWatchlist, useRemoveFromWatchlist, useSetRating } from '@/lib/hooks/use-user-data';
import { getGenreLabel } from '@/lib/tmdb/genre-labels';

interface Content {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
}

interface ContentDetailsModalProps {
  content: Content;
  isOpen: boolean;
  onClose: () => void;
  onWatch: () => void;
  isInWatchlist?: boolean;
  isLiked?: boolean;
}

export function ContentDetailsModal({
  content,
  isOpen,
  onClose,
  onWatch,
  isInWatchlist: initialIsInWatchlist = false,
  isLiked: initialIsLiked = false,
}: ContentDetailsModalProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(initialIsInWatchlist);
  const [isSaving, setIsSaving] = useState(false);
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();
  const setRating = useSetRating();
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  useEffect(() => {
    setIsInWatchlist(initialIsInWatchlist);
  }, [initialIsInWatchlist, content.id, isOpen]);

  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked, content.id, isOpen]);

  // Get profileId from localStorage
  const [profileId, setProfileId] = useState<string | null>(null);
  useEffect(() => {
    setProfileId(localStorage.getItem('selectedProfileId'));
  }, []);
  const handleLike = async () => {
    if (!profileId) {
      alert('Please select a profile first');
      return;
    }

    try {
      await setRating.mutateAsync({
        contentId: String(content.id),
        rating: isLiked ? 0 : 10, // 10 for liked (5 stars), 0 to remove like
        updatedAt: new Date().toISOString(),
        profileId,
      });
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to update rating:', error);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const handleAddToList = async () => {
    if (isSaving || addToWatchlist.isPending || removeFromWatchlist.isPending) {
      return;
    }

    if (!profileId) {
      alert('Please select a profile first');
      return;
    }

    if (!content.id) {
      return;
    }

    setIsSaving(true);
    const shouldRemove = isInWatchlist;
    try {
      if (shouldRemove) {
        await removeFromWatchlist.mutateAsync({
          contentId: String(content.id),
          profileId,
        });
      } else {
        await addToWatchlist.mutateAsync({
          contentId: String(content.id),
          type: content.type,
          profileId,
        });
      }
      setIsInWatchlist(!shouldRemove);
    } catch (error) {
      console.error('Failed to update watchlist:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const safeTitle = content.title || 'Untitled';
  const safeType = content.type || 'movie';
  const safeOverview = content.overview || 'No description available.';
  const safeGenreIds = Array.isArray(content.genreIds) ? content.genreIds : [];
  const safeReleaseDate = content.releaseDate || '';
  const safeVoteAverage = typeof content.voteAverage === 'number' ? content.voteAverage : 0;

  const releaseYear = safeReleaseDate ? new Date(safeReleaseDate).getFullYear() : null;
  const displayRating = Number.isFinite(safeVoteAverage) ? safeVoteAverage.toFixed(1) : '6.8';

  return (
    <div
      className="fixed inset-0 z-80 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={`${safeTitle} details`}
      onClick={onClose}
    >
      <article
        className="relative w-full max-w-160 overflow-hidden rounded-[24px] border border-white/12 bg-[#141414] shadow-[0_24px_58px_rgba(0,0,0,0.62)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-56 w-full md:h-62">
          {content.backdropPath ? (
            <Image
              src={content.backdropPath}
              alt={safeTitle}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover"
              priority
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.28)_38%,rgba(10,10,10,0.94)_100%)]" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/80"
          >
            <X className="h-4.5 w-4.5" />
          </button>

          <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
            <h3 className="line-clamp-2 text-2xl font-black text-white md:text-[2rem]">{safeTitle}</h3>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <Button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onWatch();
                }}
                className="h-9 rounded-full bg-[#E50914] px-5 text-sm font-semibold text-white hover:bg-[#f6121d]"
              >
                <Play className="mr-2 h-3.5 w-3.5 fill-current" />
                Watch
              </Button>
              <Button
                onClick={handleAddToList}
                disabled={isSaving}
                variant="outline"
                className={`h-9 rounded-full border px-4 text-sm transition-colors ${
                  isInWatchlist
                    ? 'border-white/40 bg-white/20 text-white hover:bg-white/30'
                    : 'border-white/25 bg-white/5 text-white hover:bg-white/12'
                }`}
              >
                {isInWatchlist ? (
                  <>
                    <Check className="mr-2 h-3.5 w-3.5" />
                    Remove from list
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    Add to List
                  </>
                )}
              </Button>
              <Button
                onClick={handleLike}
                variant="outline"
                className={`h-9 rounded-full border px-4 text-sm transition-colors ${
                  isLiked
                    ? 'border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'border-white/25 bg-white/5 text-white hover:bg-white/12'
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 pb-6 pt-4 md:px-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/84">
            <span className="inline-flex items-center gap-1 text-[#ffd24d]">
              <Star className="h-3.5 w-3.5 fill-current" />
              {displayRating}
            </span>
            {releaseYear ? <span>{releaseYear}</span> : null}
            <span className="uppercase">{safeType}</span>
            <span className="rounded border border-white/35 px-1.5 py-0.5 text-[0.68rem] tracking-wide text-white/80">HD</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {safeGenreIds.slice(0, 3).map((genreId) => (
              <span
                key={genreId}
                className="rounded-full border border-white/20 bg-white/6 px-2.5 py-1 text-[0.72rem] text-white/80"
              >
                {getGenreLabel(genreId, safeType)}
              </span>
            ))}
          </div>

          <p className="line-clamp-4 text-sm leading-7 text-white/74 md:text-[0.98rem]">
            {safeOverview}
          </p>
        </div>
      </article>
    </div>
  );
}
