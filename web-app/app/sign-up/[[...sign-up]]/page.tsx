'use client';

import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { hasClerkClientConfig } from '@/lib/auth/clerk-config';
import { Sparkles, Shield, Zap } from 'lucide-react';

const MOSAIC_POSTERS = [
  'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
  'https://image.tmdb.org/t/p/w500/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg',
  'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg',
  'https://image.tmdb.org/t/p/w500/gNBCvtYyGPbjPCT1k3MvJuNuXR6.jpg',
  'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
  'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
  'https://image.tmdb.org/t/p/w500/jWXrQstj7p3Wl5MfYWY6IHqRpDb.jpg',
  'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg',
  'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
  'https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg',
  'https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg',
  'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
  'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
  'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
  'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg',
];

function PosterMosaic() {
  const col1 = MOSAIC_POSTERS.slice(0, 5);
  const col2 = MOSAIC_POSTERS.slice(5, 11);
  const col3 = MOSAIC_POSTERS.slice(11, 16);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="flex h-full gap-3 px-3 py-3 opacity-60">
        <div className="flex flex-1 flex-col gap-3 animate-[scrollUp_28s_linear_infinite]">
          {[...col1, ...col1].map((src, i) => (
            <div key={i} className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-lg">
              <Image src={src} alt="" fill unoptimized className="object-cover" sizes="220px" />
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-3 animate-[scrollDown_32s_linear_infinite]">
          {[...col2, ...col2].map((src, i) => (
            <div key={i} className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-lg">
              <Image src={src} alt="" fill unoptimized className="object-cover" sizes="220px" />
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-3 animate-[scrollUp_36s_linear_infinite]">
          {[...col3, ...col3].map((src, i) => (
            <div key={i} className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-lg">
              <Image src={src} alt="" fill unoptimized className="object-cover" sizes="220px" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_0%,transparent_30%,transparent_70%,#09090b_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#09090b_0%,transparent_15%,transparent_85%,#09090b_100%)]" />
      <div className="absolute inset-0 bg-[#09090b]/25" />
    </div>
  );
}

const PERKS = [
  {
    icon: Sparkles,
    title: 'Personalized For You',
    desc: 'Each profile learns your taste and sharpens your recommendations.',
  },
  {
    icon: Zap,
    title: 'Instant Playback',
    desc: 'Resume exactly where you left off across every device.',
  },
  {
    icon: Shield,
    title: 'Profile Protection',
    desc: 'PIN-lock any profile and keep kids\' content separate.',
  },
];

const clerkAppearance = {
  variables: {
    colorPrimary: '#E50914',
    colorBackground: '#111116',
    colorForeground: '#ffffff',
    colorMutedForeground: '#9ca3af',
    colorNeutral: '#9ca3af',
    colorDanger: '#ff6a74',
    borderRadius: '0.85rem',
    fontFamily: 'inherit',
    fontSize: '15px',
  },
  elements: {
    rootBox: 'w-full',
    cardBox: 'w-full',
    card: 'w-full rounded-2xl border border-white/10 bg-[#111116]/95 shadow-[0_32px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl !p-7',
    headerTitle: '!text-white text-[1.55rem] font-bold tracking-tight',
    headerSubtitle: '!text-white/50 text-sm',
    socialButtonsBlockButton:
      'h-11 rounded-xl border border-white/15 bg-white/7 !text-white hover:bg-white/12 hover:border-white/25 transition-all duration-200 opacity-100 disabled:opacity-100',
    socialButtonsBlockButtonText: '!text-white/90 font-medium',
    socialButtonsBlockButton__github: 'hidden',
    socialButtonsProviderIcon: '!opacity-100 contrast-125',
    socialButtonsProviderIcon__apple: '[filter:brightness(0)_invert(1)]',
    dividerLine: 'bg-white/10',
    dividerText: '!text-white/35 text-xs',
    formFieldLabel: '!text-white/75 text-[0.82rem] font-medium',
    formFieldInput:
      'h-11 rounded-xl !border !border-white/15 !bg-[#16161d] !text-white text-sm ' +
      'placeholder:!text-white/40 focus:!border-[#E50914] focus:!ring-1 focus:!ring-[#E50914] transition-colors duration-200',
    formButtonPrimary:
      'h-11 rounded-xl !bg-[#E50914] hover:!bg-[#b80710] !text-white font-bold text-sm ' +
      'shadow-[0_4px_24px_rgba(229,9,20,0.4)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] mt-2 cursor-pointer',
    footerActionText: '!text-white/45 text-sm',
    footerActionLink: '!text-white/80 hover:!text-white font-medium transition-colors',
    formResendCodeLink: '!text-white/70 hover:!text-white transition-colors',
    identityPreviewText: '!text-white/80',
    identityPreviewEditButton: '!text-white/60 hover:!text-white transition-colors',
    formFieldHintText: '!text-white/40 text-xs',
    formFieldErrorText: '!text-red-400 text-xs',
    alertText: '!text-white',
    otpCodeFieldInput: 'bg-[#0c0c10] border-white/15 text-white focus:border-white/40 rounded-xl',
  },
} as const;

export default function SignUpPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hasAuth = hasClerkClientConfig();

  return (
    <>
      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
      `}</style>

      <main className="relative flex min-h-screen overflow-hidden bg-[#09090b]">

        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <div className="relative hidden w-[52%] shrink-0 lg:flex lg:flex-col">
          <PosterMosaic />

          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <BrandLogo className="h-11 w-11 shrink-0 transition-transform duration-200 group-hover:scale-105" />
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-white/80">
                Rusil Stream
              </span>
            </Link>

            {/* Hero copy */}
            <div className="max-w-md">
              <p className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/40">
                Start for free
              </p>
              <h1 className="text-[2.8rem] font-black leading-[1.05] tracking-tight text-white xl:text-[3.4rem]">
                Your whole<br />
                library,{' '}
                <span className="bg-[linear-gradient(135deg,#ffffff_0%,rgba(255,255,255,0.5)_100%)] bg-clip-text text-transparent">
                  everywhere.
                </span>
              </h1>
              <p className="mt-5 text-[0.96rem] leading-[1.75] text-white/55">
                Create your free account and get instant access to thousands of movies and shows.
              </p>

              {/* Perks */}
              <div className="mt-8 space-y-3">
                {PERKS.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3.5 rounded-2xl border border-white/8 bg-white/4 px-4 py-3.5 backdrop-blur-sm"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <Icon className="h-4 w-4 text-white/70" />
                    </div>
                    <div>
                      <p className="text-[0.88rem] font-semibold text-white">{title}</p>
                      <p className="mt-0.5 text-[0.78rem] leading-relaxed text-white/45">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom */}
            <p className="text-[0.72rem] text-white/25">
              Already have an account?{' '}
              <Link href="/sign-in" className="text-white/50 hover:text-white/80 transition-colors underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
        <div className="relative flex flex-1 flex-col items-center justify-center px-5 py-10 lg:px-10 xl:px-16">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-white/4 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-white/3 blur-3xl" />
          </div>

          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandLogo className="h-10 w-10 shrink-0" />
            <span className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-white/70">
              Rusil Stream
            </span>
          </div>

          {/* Form */}
          <div
            className={`relative w-full max-w-[420px] transition-all duration-700 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {hasAuth ? (
              <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                fallbackRedirectUrl="/"
                forceRedirectUrl="/"
                appearance={clerkAppearance}
              />
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#111116]/95 p-8 text-center shadow-[0_32px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl">
                <p className="text-lg font-semibold text-white">Sign Up Unavailable</p>
                <p className="mt-2 text-sm text-white/50">
                  Authentication is not configured. Please set up Clerk keys.
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-white/90"
                >
                  Back to Home
                </Link>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-[0.72rem] text-white/20">
            © {new Date().getFullYear()} Rusil Stream ·{' '}
            <Link href="/" className="hover:text-white/50 transition-colors">Home</Link>
            {' · '}
            <Link href="/help" className="hover:text-white/50 transition-colors">Help</Link>
          </p>
        </div>
      </main>
    </>
  );
}
