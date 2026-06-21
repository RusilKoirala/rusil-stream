'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  contentId?: number;
  contentType?: 'movie' | 'tv';
}

const logoCache = new Map<string, string | null>();

async function fetchContentLogo(id: number, type: 'movie' | 'tv'): Promise<string | null> {
  const cacheKey = `${type}:${id}`;
  
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey) ?? null;
  }

  try {
    const response = await fetch(`/api/content/logo?id=${id}&type=${type}`, {
      cache: 'force-cache',
    });
    
    if (!response.ok) return null;
    const data = (await response.json()) as { logoPath: string | null };
    logoCache.set(cacheKey, data.logoPath);
    return data.logoPath;
  } catch {
    return null;
  }
}

export function BrandLogo({ className, imageClassName, contentId, contentType }: BrandLogoProps) {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!contentId || !contentType) {
      setLogoSrc(null);
      return;
    }

    setIsLoading(true);
    fetchContentLogo(contentId, contentType)
      .then((src) => {
        setLogoSrc(src);
        setIsLoading(false);
      })
      .catch(() => {
        setLogoSrc(null);
        setIsLoading(false);
      });
  }, [contentId, contentType]);

  // Use fetched logo if available, otherwise fall back to brand logo
  const imageSrc = logoSrc || '/logo.svg';
  const altText = logoSrc ? `Content logo for ID ${contentId}` : 'Rusil Stream logo';

  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-2xl border border-white/25 bg-[radial-gradient(circle_at_25%_15%,#ffffff_0%,#f6f7fb_42%,#e6e9f1_100%)] p-0.5 shadow-[0_16px_36px_rgba(0,0,0,0.28)]',
        className
      )}
    >
      <span className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(140deg,rgba(255,255,255,0.78),rgba(255,255,255,0.08)_48%,rgba(255,255,255,0.46))] opacity-85" />
      <span className="relative inline-flex h-full w-full items-center justify-center overflow-hidden rounded-[calc(1rem-3px)] bg-white/96">
        <Image
          src={imageSrc}
          alt={altText}
          width={160}
          height={160}
          priority={!contentId}
          className={cn('h-full w-full object-cover', imageClassName)}
          style={{ transform: 'scale(2.25)' }}
        />
      </span>
    </span>
  );
}