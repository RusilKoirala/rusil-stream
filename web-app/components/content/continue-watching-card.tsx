'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, MoreVertical, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface ContinueWatchingCardProps {
  content: Content;
  percentageWatched: number;
  position?: 'start' | 'middle' | 'end';
  onResume?: () => void;
  onRemove?: () => void;
  className?: string;
}

/**
 * ContinueWatchingCard Component
 * 
 * Displays backdrop image with red progress bar showing watch progress.
 * Shows "Resume" button and three-dot menu with "Remove from Continue Watching" on hover.
 * 
 * Requirements: 10.3, 10.4, 10.5
 */
export function ContinueWatchingCard({
  content,
  percentageWatched,
  position = 'middle',
  onResume,
  onRemove,
  className,
}: ContinueWatchingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Wait 400ms before expanding
    hoverTimeoutRef.current = setTimeout(() => {
      setIsExpanded(true);
    }, 400);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsExpanded(false);
    setShowMenu(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // Determine expansion direction based on position
  const getExpansionClass = () => {
    if (!isExpanded) return '';
    
    switch (position) {
      case 'start':
        return 'origin-left';
      case 'end':
        return 'origin-right';
      default:
        return 'origin-center';
    }
  };

  // Use backdrop if available, otherwise fall back to poster
  const imageUrl = content.backdropPath || content.posterPath;

  return (
    <div
      className={cn(
        'relative group transition-all duration-200 ease-out',
        getExpansionClass(),
        isExpanded && 'z-50',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isExpanded ? 'scale(1.2) translateY(-8px)' : 'scale(1)',
        transition: 'transform 200ms ease-out',
      }}
    >
      <Card className="overflow-hidden bg-[#181818] border-none rounded-md">
        {/* Backdrop Image with Shimmer Skeleton (Requirement 10.3) */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#2F2F2F]">
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#2F2F2F] via-[#3F3F3F] to-[#2F2F2F] animate-shimmer" />
          )}
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={content.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              className={cn(
                'object-cover transition-opacity duration-300',
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setIsImageLoaded(true)}
              loading="lazy"
            />
          )}

          {/* Resume Button Overlay (Requirement 10.4) */}
          {isExpanded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Button
                size="icon"
                className="rounded-full bg-white text-black hover:bg-white/90 w-12 h-12"
                onClick={(e) => {
                  e.stopPropagation();
                  onResume?.();
                }}
              >
                <Play className="w-6 h-6 fill-current" />
              </Button>
            </div>
          )}

          {/* Three-dot Menu Button (Requirement 10.5) */}
          {isExpanded && (
            <div className="absolute top-2 right-2" ref={menuRef}>
              <Button
                size="icon-sm"
                variant="ghost"
                className="rounded-full bg-black/60 hover:bg-black/80"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute top-full right-0 mt-1 bg-[#181818] border border-white/10 rounded-md shadow-lg min-w-[200px] py-1">
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove?.();
                      setShowMenu(false);
                    }}
                  >
                    <X className="w-4 h-4" />
                    Remove from Continue Watching
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Red Progress Bar at Bottom (Requirement 10.3) */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2F2F2F]">
            <div
              className="h-full bg-[#E50914] transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, percentageWatched))}%` }}
            />
          </div>
        </div>

        {/* Expanded Panel */}
        {isExpanded && (
          <div className="p-4 space-y-2 bg-[#181818]">
            {/* Title */}
            <h3 className="font-semibold text-white text-sm line-clamp-1">
              {content.title}
            </h3>

            {/* Progress Text */}
            <p className="text-xs text-[#B3B3B3]">
              {Math.round(percentageWatched)}% watched
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
