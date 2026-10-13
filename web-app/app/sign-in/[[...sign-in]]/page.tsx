'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { BrandLogo } from '@/components/ui/brand-logo';

// 100% verified active TMDB posters (all return HTTP 200)
const MOSAIC_POSTERS = [
  'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', // Shawshank Redemption
  'https://image.tmdb.org/t/p/w500/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg', // Pulp Fiction
  'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg', // Fight Club
  'https://image.tmdb.org/t/p/w500/gNBCvtYyGPbjPCT1k3MvJuNuXR6.jpg', // Inception
  'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', // Interstellar
  'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', // Game of Thrones
  'https://image.tmdb.org/t/p/w500/jWXrQstj7p3Wl5MfYWY6IHqRpDb.jpg', // Stranger Things
  'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg', // Money Heist
  'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', // Oppenheimer
  'https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg', // Fast X
  'https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg', // Fast & Furious
  'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', // The Dark Knight
  'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', // Avengers Infinity War
  'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg', // Avengers Endgame
  'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg', // Kung Fu Panda 4
  'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg', // Poor Things
];

function PosterMosaic() {
  const col1 = MOSAIC_POSTERS.slice(0, 5);
  const col2 = MOSAIC_POSTERS.slice(5, 11);
  const col3 = MOSAIC_POSTERS.slice(11, 16);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Three columns of scrolling posters — more vibrant (opacity-60) and less dark */}
      <div className="flex h-full gap-3 px-3 py-3 opacity-60">
        {/* Column 1 — scroll up */}
        <div className="flex flex-1 flex-col gap-3 animate-[scrollUp_28s_linear_infinite]">
          {[...col1, ...col1].map((src, i) => (
            <div key={i} className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-lg">
              <Image src={src} alt="" fill unoptimized className="object-cover" sizes="220px" />
            </div>
          ))}
        </div>
        {/* Column 2 — scroll down */}
        <div className="flex flex-1 flex-col gap-3 animate-[scrollDown_32s_linear_infinite]">
          {[...col2, ...col2].map((src, i) => (
            <div key={i} className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-lg">
              <Image src={src} alt="" fill unoptimized className="object-cover" sizes="220px" />
            </div>
          ))}
        </div>
        {/* Column 3 — scroll up */}
        <div className="flex flex-1 flex-col gap-3 animate-[scrollUp_36s_linear_infinite]">
          {[...col3, ...col3].map((src, i) => (
            <div key={i} className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-lg">
              <Image src={src} alt="" fill unoptimized className="object-cover" sizes="220px" />
            </div>
          ))}
        </div>
      </div>

      {/* Subtle vignettes — showing more art, less heavy dark overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_0%,transparent_30%,transparent_70%,#09090b_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#09090b_0%,transparent_15%,transparent_85%,#09090b_100%)]" />
      <div className="absolute inset-0 bg-[#09090b]/25" />
    </div>
  );
}

export default function SignInPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* Keyframes for seamless mosaic marquee scroll */}
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
          {/* Animated poster mosaic background */}
          <PosterMosaic />

          {/* Clean minimal content over mosaic — no long text blocks or stats */}
          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
            {/* Top: brand */}
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <BrandLogo className="h-11 w-11 shrink-0 transition-transform duration-200 group-hover:scale-105" />
              <span className="text-[0.75rem] font-bold uppercase tracking-[0.28em] text-white/90">
                Rusil Stream
              </span>
            </Link>

            {/* Center: clean headline */}
            <div className="max-w-md">
              <h1 className="text-[2.8rem] font-black leading-[1.08] tracking-tight text-white xl:text-[3.4rem]">
                Movies &<br />
                shows you'll{' '}
                <span
                  className="bg-[linear-gradient(135deg,#ffffff_0%,rgba(255,255,255,0.55)_100%)] bg-clip-text text-transparent"
                >
                  love.
                </span>
              </h1>
            </div>

            {/* Bottom: subtle badge */}
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-md w-fit">
              <div className="flex -space-x-1.5">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-white ring-2 ring-[#09090b]">🎬</span>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-white ring-2 ring-[#09090b]">🍿</span>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-white ring-2 ring-[#09090b]">✨</span>
              </div>
              <p className="text-[0.78rem] text-white/60 font-medium">
                Stream anywhere, anytime.
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
        <div className="relative flex flex-1 flex-col items-center justify-center px-5 py-8 lg:px-10 xl:px-14">
          {/* Subtle ambient glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-white/4 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-white/3 blur-3xl" />
          </div>

          {/* Mobile-only brand */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <BrandLogo className="h-10 w-10 shrink-0" />
            <span className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-white/70">
              Rusil Stream
            </span>
          </div>

          {/* Shorter, sleek Clerk Sign-In Form with brand button and dark inputs */}
          <div
            className={`relative w-full max-w-[400px] transition-all duration-700 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/"
              forceRedirectUrl="/"
              appearance={{
                variables: {
                  colorPrimary: '#E50914',
                  colorBackground: '#111116',
                  colorForeground: '#ffffff',
                  colorMutedForeground: '#9ca3af',
                  colorNeutral: '#9ca3af',
                  colorDanger: '#ff6a74',
                  borderRadius: '0.75rem',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                },
                elements: {
                  rootBox: 'w-full',
                  cardBox: 'w-full',

                  // Compact, shorter card height
                  card:
                    'w-full rounded-2xl border border-white/10 bg-[#111116]/95 shadow-[0_24px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl !p-6 sm:!p-7',

                  headerTitle:
                    '!text-white text-xl font-bold tracking-tight',

                  headerSubtitle: '!text-white/50 text-xs mt-1',

                  // Compact social buttons
                  socialButtonsBlockButton:
                    'h-11 rounded-xl border border-white/15 bg-white/7 !text-white hover:bg-white/12 hover:border-white/25 transition-all duration-200 text-xs font-medium',

                  socialButtonsBlockButtonText: '!text-white/90 text-xs font-medium',
                  socialButtonsBlockButton__github: 'hidden',

                  socialButtonsProviderIcon: '!opacity-100 contrast-125',
                  socialButtonsProviderIcon__apple:
                    '[filter:brightness(0)_invert(1)]',

                  dividerLine: 'bg-white/10',
                  dividerText: '!text-white/35 text-[11px]',
                  dividerRow: '!my-3',

                  formFieldRow: '!mb-3',
                  formFieldLabel: '!text-white/75 text-xs font-medium !mb-1.5',

                  // Dark sleek inputs with clear placeholder
                  formFieldInput:
                    'h-11 rounded-xl !border !border-white/15 !bg-[#16161d] !text-white text-sm ' +
                    'placeholder:!text-white/40 focus:!border-[#E50914] focus:!ring-1 focus:!ring-[#E50914] ' +
                    'transition-colors duration-200',

                  // Brand red primary submit button with crisp white text
                  formButtonPrimary:
                    'h-11 rounded-xl !bg-[#E50914] hover:!bg-[#b80710] !text-white font-bold text-sm ' +
                    'shadow-[0_4px_24px_rgba(229,9,20,0.4)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] mt-2 cursor-pointer',

                  footerActionText: '!text-white/45 text-xs',
                  footerActionLink: '!text-white/80 hover:!text-white font-medium text-xs transition-colors',

                  formResendCodeLink: '!text-white/70 hover:!text-white text-xs transition-colors',

                  identityPreviewText: '!text-white/80 text-xs',
                  identityPreviewEditButton: '!text-white/60 hover:!text-white text-xs transition-colors',

                  formFieldHintText: '!text-white/40 text-[11px]',
                  formFieldErrorText: '!text-red-400 text-xs mt-1',
                  alertText: '!text-white text-xs',

                  otpCodeFieldInput:
                    'bg-[#0c0c10] border-white/15 text-white focus:border-white/40 rounded-xl h-10',
                },
              }}
            />
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-[0.72rem] text-white/20">
            © {new Date().getFullYear()} Rusil Stream · {' '}
            <Link href="/" className="hover:text-white/50 transition-colors">Home</Link>
            {' · '}
            <Link href="/help" className="hover:text-white/50 transition-colors">Help</Link>
          </p>
        </div>
      </main>
    </>
  );
}
