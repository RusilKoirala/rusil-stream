import Link from 'next/link';
import { PublicNav } from '@/components/navigation';
import { AmbientBackground } from '@/components/ui/ambient-background';

interface HelpShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function HelpShell({ title, subtitle, children }: HelpShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <AmbientBackground />
      <PublicNav />

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-28 md:px-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Back to Home
          </Link>
        </div>

        <section className="rounded-3xl border border-white/12 bg-white/5 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Help Center</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm text-white/75 md:text-base">{subtitle}</p>

          <div className="mt-7">{children}</div>
        </section>
      </main>
    </div>
  );
}
