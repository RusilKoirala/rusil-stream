'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Plus, Heart } from 'lucide-react';
import { useWatchlist, useRatings, useAddToWatchlist, useRemoveFromWatchlist, useSetRating } from '@/lib/hooks/use-user-data';
import { ContentDetailsModal } from './content-details-modal';

interface Content {
  id?: number;
  contentId?: number;
  type?: 'movie' | 'tv';
  contentType?: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
}

interface ContentCardProps {
  content: Content;
  position?: 'start' | 'middle' | 'end';
  onPlay?: () => void;
  onMoreInfo?: () => void;
  className?: string;
}

/**
 * ContentCard Component
 * 
 * Base content card component with poster image, lazy loading, and hover expansion.
 * Implements Netflix-style hover interactions with 400ms delay and smooth animations.
 * 
 * Requirements: 22.1, 22.2, 22.3, 23.1, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8
 */
export function ContentCard({
  content,
  position = 'middle',
  onPlay,
  onMoreInfo,
  className,
}: ContentCardProps) {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data: watchlist = [] } = useWatchlist(profileId || '');
  const { data: ratings = [] } = useRatings(profileId || '');
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();
  const setRating = useSetRating();
  const [isLiked, setIsLiked] = useState(false);
  const resolvedContentId = content.id ?? content.contentId;
  const resolvedContentType = content.type ?? content.contentType;
  const resolvedContentIdString = resolvedContentId !== undefined ? String(resolvedContentId) : '';

  useEffect(() => {
    setProfileId(localStorage.getItem('selectedProfileId'));
  }, []);

  useEffect(() => {
    if (!resolvedContentIdString) {
      setIsLiked(false);
      return;
    }

    const userRating = ratings.find((r) => r.contentId === resolvedContentIdString);
    setIsLiked((userRating?.rating ?? 0) > 0);
  }, [ratings, resolvedContentIdString]);
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsExpanded(true);
    }, 250);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const getOriginClass = () => {
    if (position === 'start') return 'origin-left';
    if (position === 'end') return 'origin-right';
    return 'origin-center';
  };

  const handleAddToList = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profileId || !resolvedContentIdString || !resolvedContentType) return;
    try {
      if (isInWatchlist) {
        await removeFromWatchlist.mutateAsync({
          contentId: resolvedContentIdString,
          profileId,
        });
      } else {
        await addToWatchlist.mutateAsync({
          contentId: resolvedContentIdString,
          type: resolvedContentType,
          profileId,
        });
      }
    } catch (error) {
      console.error('Failed to update watchlist:', error);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profileId || !resolvedContentIdString) return;
    try {
      await setRating.mutateAsync({
        contentId: resolvedContentIdString,
        rating: isLiked ? 0 : 10,
        updatedAt: new Date().toISOString(),
        profileId,
      });
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to update rating:', error);
    }
  };

  const isInWatchlist = resolvedContentId !== undefined
    ? watchlist.some((item: any) => item.id === resolvedContentId || item.contentId === resolvedContentId)
    : false;

  if (!content.posterPath) {
    return null;
  }

  return (
    <>
      <article
        className={cn('relative cursor-pointer transition-transform duration-220 ease-out', getOriginClass(), isExpanded && 'z-40', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          onMoreInfo?.();
          setIsDetailsOpen(true);
        }}
        style={{
          transform: isExpanded ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)',
        }}
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-[20px] bg-[#1a1a1a] shadow-[0_10px_24px_rgba(0,0,0,0.42)] transition-shadow duration-220',
            isExpanded && 'shadow-[0_14px_28px_rgba(0,0,0,0.5)]'
          )}
        >
          <div className="relative h-63.75 w-full">
            <Image
              src={content.posterPath}
              alt={content.title}
              fill
              sizes="220px"
              className="object-cover"
              loading="lazy"
            />

            <div className="absolute inset-0 bg-black/0 transition-colors duration-200" style={{
              backgroundColor: isExpanded ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)'
            }} />

            <div
              className={cn(
                'absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/40 to-transparent p-3 transition-opacity duration-200',
                isExpanded ? 'opacity-100' : 'opacity-0'
              )}
            >
              <div className="mb-2 line-clamp-1 text-xs font-semibold text-white">{content.title}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                    isLiked
                      ? 'bg-red-500/80 text-white hover:bg-red-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  )}
                  title="Like"
                >
                  <Heart className={cn('h-3.5 w-3.5', isLiked && 'fill-current')} />
                </button>
                <button
                  onClick={handleAddToList}
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                    isInWatchlist
                      ? 'bg-white/40 text-white hover:bg-white/50'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  )}
                  title={isInWatchlist ? 'Remove from list' : 'Add to list'}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <ContentDetailsModal
        content={{
          ...content,
          id: resolvedContentId ?? 0,
          type: resolvedContentType ?? 'movie',
        }}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onWatch={() => {
          setIsDetailsOpen(false);
          onPlay?.();
          if (!resolvedContentId || !resolvedContentType) {
            return;
          }
          router.push(`/player?id=${resolvedContentId}&type=${resolvedContentType}`);
        }}
        isInWatchlist={isInWatchlist}
        isLiked={isLiked}
      />
    </>
  );
}
