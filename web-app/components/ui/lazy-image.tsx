'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Skeleton } from './skeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(!priority);

  return (
    <div className="relative overflow-hidden rounded-lg">
      {isLoading && <Skeleton className="absolute inset-0" />}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoading(false)}
        quality={75}
      />
    </div>
  );
}
