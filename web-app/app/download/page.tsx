import { Download, ShieldCheck, WifiOff } from 'lucide-react';
import { PublicNav } from '@/components/navigation';

const DEFAULT_VERSION = '1.2.0';
const GITHUB_REPO = 'RusilKoirala/rusil-stream';
const APK_FILENAME = 'rusilstream.apk';

function getDownloadUrl(): string {
  // Allow a full override via env
  const override =
    process.env.ANDROID_DOWNLOAD_URL ||
    process.env.NEXT_PUBLIC_ANDROID_DOWNLOAD_URL;

  if (override) {
    try {
      const parsed = new URL(override);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        return parsed.toString();
      }
    } catch {
      // fall through
    }
  }

  // Direct asset download URL (not the release page)
  const version = process.env.NEXT_PUBLIC_APP_VERSION || DEFAULT_VERSION;
  return `https://github.com/${GITHUB_REPO}/releases/download/v${version}/${APK_FILENAME}`;
}

function AndroidIcon({ className = '' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/android.svg"
      alt="Android"
      className={className}
    />
  );
}

export default function DownloadPage() {
  const downloadUrl = getDownloadUrl();
  const version = process.env.NEXT_PUBLIC_APP_VERSION || DEFAULT_VERSION;
  const apkFilename = APK_FILENAME;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <PublicNav />

      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-28 -top-36 h-[48rem] w-[56rem] rounded-full bg-[radial-gradient(circle,rgba(229,9,20,0.08)_0%,rgba(229,9,20,0.03)_32%,transparent_68%)] blur-2xl animate-ambient-drift" />
        <div className="absolute -right-36 -top-24 h-[42rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.035)_0%,transparent_70%)] blur-3xl animate-ambient-float" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 py-24 text-center">

        {/* App icon */}
        <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-8 py-6">
          <AndroidIcon className="h-auto w-48" />
        </div>

        {/* Text */}
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
          Rusil Stream for Android
        </h1>
        <p className="mt-3 text-[0.9rem] leading-[1.7] text-muted-foreground">
          The full streaming experience, natively on Android. No Play Store required.
        </p>

        {/* Version badge */}
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.72rem] font-semibold text-white/55">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          v{version}
        </div>

        {/* CTA */}
        <a
          href={downloadUrl}
          download={apkFilename}
          className="mt-8 inline-flex h-12 w-full max-w-xs items-center justify-center gap-2.5 rounded-full bg-primary text-[0.9rem] font-bold tracking-wide text-white transition-colors duration-200 hover:bg-[#f21822] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
        >
          <Download className="h-4 w-4" aria-hidden />
          Download APK
        </a>


        {/* Requirements */}
        <div className="mt-10 w-full max-w-xs space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-[0.82rem]">
            <span className="inline-flex items-center gap-2 text-white/70">
              <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden />
              Unknown Sources
            </span>
            <span className="text-[0.75rem] font-semibold text-emerald-400">Enable</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-[0.82rem]">
            <span className="inline-flex items-center gap-2 text-white/70">
              <WifiOff className="h-4 w-4 text-amber-400" aria-hidden />
              Android 7.0+
            </span>
            <span className="text-[0.75rem] text-white/45">Required</span>
          </div>
        </div>

        {/* Steps */}
        <ol className="mt-10 w-full max-w-xs space-y-3 text-left">
          {[
            'Download the APK file',
            'Allow installs from unknown sources if prompted',
            'Open the app and sign in to sync your profiles',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-[0.82rem] text-muted-foreground">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/5 text-[0.65rem] font-bold text-white/40">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
