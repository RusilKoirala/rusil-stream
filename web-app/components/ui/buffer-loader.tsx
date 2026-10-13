'use client';

import { cn } from '@/lib/utils';

interface BufferLoaderProps {
  fullscreen?: boolean;
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { box: 'h-5 w-5', stroke: 1.75, text: 'text-xs' },
  md: { box: 'h-7 w-7', stroke: 2, text: 'text-xs' },
  lg: { box: 'h-9 w-9', stroke: 2.25, text: 'text-sm' },
} as const;

export function BufferLoader({
  fullscreen = false,
  message,
  className,
  size = 'md',
}: BufferLoaderProps) {
  const s = sizes[size];
  const r = 18;
  const circumference = 2 * Math.PI * r;

  const content = (
    <div
      className="flex flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <svg
        className={cn('animate-spin motion-reduce:animate-none', s.box)}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="20"
          cy="20"
          r={r}
          stroke="currentColor"
          strokeWidth={s.stroke}
          className="text-white/15"
        />
        <circle
          cx="20"
          cy="20"
          r={r}
          stroke="white"
          strokeWidth={s.stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.26} ${circumference * 0.74}`}
        />
      </svg>

      {message ? (
        <p
          className={cn(
            'select-none text-center font-medium tracking-wide text-white/60',
            s.text
          )}
        >
          {message}
        </p>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullscreen
          ? 'fixed inset-0 z-[100] bg-black/55 backdrop-blur-2xl backdrop-saturate-150'
          : 'absolute inset-0 z-30 bg-black/40 backdrop-blur-xl',
        className
      )}
    >
      {content}
    </div>
  );
}
