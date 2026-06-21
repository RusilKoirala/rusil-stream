'use client';

import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWatchlist, useRatings, useAddToWatchlist, useRemoveFromWatchlist, useSetRating } from '@/lib/hooks/use-user-data';
import { Plus, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
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

interface Top10CardProps {
  content: Content;
  rank: number;
  position?: 'start' | 'middle' | 'end';
  onPlay?: () => void;
  onMoreInfo?: () => void;
  className?: string;
}

/**
 * Top10Card Component
 * 
 * Extends ContentCard with large semi-transparent rank number overlay on left edge.
 * Styled to match Netflix Top 10 design with distinctive rank display.
 * 
 * Requirements: 4.5, 4.11
 */
export function Top10Card({
  content,
  rank,
  onPlay,
  onMoreInfo,
  className,
}: Top10CardProps) {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { data: watchlist = [] } = useWatchlist(profileId || '');
  const { data: ratings = [] } = useRatings(profileId || '');
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();
  const setRating = useSetRating();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
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
        className={"relative cursor-pointer transition-transform duration-200 hover:-translate-y-1 " + (className ?? '')}
        onClick={() => {
          onMoreInfo?.();
          setIsDetailsOpen(true);
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute bottom-0 left-0 z-10 pointer-events-none">
          <svg
            viewBox="0 0 100 150"
            className="h-43.75 w-29.5"
            aria-hidden="true"
          >
            <text
              x="50"
              y="130"
              fontSize="140"
              fontWeight="900"
              textAnchor="middle"
              fill="transparent"
              stroke="#ffffff"
              strokeWidth="6"
              fontFamily="Netflix Sans, Inter, sans-serif"
            >
              {rank}
            </text>
            <text
              x="50"
              y="130"
              fontSize="140"
              fontWeight="900"
              textAnchor="middle"
              fill="#000000"
              fontFamily="Netflix Sans, Inter, sans-serif"
            >
              {rank}
            </text>
          </svg>
        </div>

        <div className="relative ml-12 overflow-hidden rounded-[20px] bg-[#1a1a1a] shadow-[0_14px_32px_rgba(0,0,0,0.45)]">
          <div className="relative aspect-2/3 w-full">
            <Image
              src={content.posterPath}
              alt={content.title}
              fill
              sizes="220px"
              className="object-cover"
              loading="lazy"
            />
            <div className={cn(
              'absolute inset-0 bg-black/30 transition-opacity duration-200 flex items-end justify-end p-2',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}>
              <div className="flex gap-1.5">
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
