'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ProfileAvatarProps {
  name: string;
  avatarUrl: string;
  onClick?: () => void;
  className?: string;
}

/**
 * ProfileAvatar Component
 * 
 * Displays a circular avatar image with profile name beneath.
 * Implements hover state with scale and border animation.
 * 
 * Requirements: 2.3
 */
export function ProfileAvatar({
  name,
  avatarUrl,
  onClick,
  className,
}: ProfileAvatarProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col items-center gap-2 transition-transform duration-200',
        'hover:scale-110 focus:scale-110 focus:outline-none',
        className
      )}
    >
      <div className="relative">
        <div
          className={cn(
            'w-32 h-32 rounded-full overflow-hidden border-4 border-transparent',
            'transition-all duration-200',
            'group-hover:border-white group-focus:border-white'
          )}
        >
          <Image
            src={avatarUrl}
            alt={name}
            width={128}
            height={128}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <span className="text-[#B3B3B3] text-base group-hover:text-white group-focus:text-white transition-colors">
        {name}
      </span>
    </button>
  );
}
