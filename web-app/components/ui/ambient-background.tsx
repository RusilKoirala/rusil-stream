import { cn } from '@/lib/utils';

interface AmbientBackgroundProps {
  className?: string;
}

export function AmbientBackground({ className }: AmbientBackgroundProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div className="absolute -left-28 -top-36 h-192 w-3xl rounded-full bg-[radial-gradient(circle,rgba(229,9,20,0.1)_0%,rgba(229,9,20,0.05)_30%,rgba(0,0,0,0)_68%)] blur-2xl animate-ambient-drift" />
      <div className="absolute -right-36 -top-24 h-168 w-2xl rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_30%,rgba(0,0,0,0)_70%)] blur-3xl animate-ambient-float" />
      <div className="absolute -bottom-96 left-1/2 h-160 w-248 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.028)_0%,rgba(0,0,0,0)_68%)] blur-3xl animate-ambient-pulse" />
    </div>
  );
}