'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FiPlay } from 'react-icons/fi';

interface ContentCardProps {
  id: number;
  title: string;
  poster: string;
  backdrop?: string;
  mediaType: 'movie' | 'tv';
  progress?: number;
  rating?: number;
  year?: string;
  size?: 'normal' | 'large';
}

export function ContentCard({
  id,
  title,
  poster,
  backdrop,
  mediaType,
  progress,
  rating,
  year,
  size = 'normal',
}: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const href = `/${mediaType === 'movie' ? 'movies' : 'tv'}/${id}`;

  // Card dimensions based on size
  const dimensions = size === 'large' 
    ? { width: 480, height: 270, containerClass: 'w-[480px] h-[270px]' }
    : { width: 280, height: 420, containerClass: 'w-[280px] h-[420px]' };

  return (
    <Link
      href={href}
      className={cn(
        'relative group flex-shrink-0 overflow-hidden rounded-xl transition-all duration-300',
        dimensions.containerClass,
        'hover:scale-105 hover:z-10'
      )}
      onMouseEnter={() => {
        setIsHovered(true);
        // Simulate preview loading after 800ms
        setTimeout(() => setPreviewLoaded(true), 800);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setPreviewLoaded(false);
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={size === 'large' && backdrop ? backdrop : poster}
          alt={title}
          fill
          className="object-cover"
          sizes={size === 'large' ? '480px' : '280px'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Progress Bar */}
      {progress !== undefined && progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-red-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Hover Overlay with Play Button */}
      <div
        className={cn(
          'absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center transform transition-transform group-hover:scale-110">
          <FiPlay size={24} className="text-black ml-1" />
        </div>
      </div>

      {/* Title and Info - Always Visible at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">
          {title}
        </h3>
        {(rating || year) && (
          <div className="flex items-center gap-3 text-sm text-white/70">
            {year && <span>{year}</span>}
            {rating && (
              <span className="flex items-center gap-1">
                ★ {rating.toFixed(1)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Optional: Video Preview on Hover */}
      {previewLoaded && isHovered && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          {/* Preview video would go here */}
        </video>
      )}
    </Link>
  );
}
