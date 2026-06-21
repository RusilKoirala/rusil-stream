import { Download, ShieldCheck, WifiOff, Tv, Smartphone } from 'lucide-react';
import { PublicNav } from '@/components/navigation';

const DEFAULT_VERSION = '1.2.0';
const TV_VERSION = '5.1.0';
const GITHUB_REPO = 'RusilKoirala/rusil-stream';
const APK_FILENAME = 'rusilstream.apk';
const TV_APK_FILENAME = 'rusilstreamtv.apk';

function getDownloadUrl(): string {
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

  const version = process.env.NEXT_PUBLIC_APP_VERSION || DEFAULT_VERSION;
  return `https://github.com/${GITHUB_REPO}/releases/download/v${version}/${APK_FILENAME}`;
}

function getTvDownloadUrl(): string {
  const override = process.env.NEXT_PUBLIC_TV_DOWNLOAD_URL;
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

  return `https://github.com/${GITHUB_REPO}/releases/download/v${TV_VERSION}/${TV_APK_FILENAME}`;
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

function AndroidTvIcon({ className = '' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/androidtv.svg"
      alt="Android"
      className={className}
    />
  );
}

export default function DownloadPage() {
  const downloadUrl = getDownloadUrl();
  const tvDownloadUrl = getTvDownloadUrl();
  const version = process.env.NEXT_PUBLIC_APP_VERSION || DEFAULT_VERSION;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <PublicNav />

      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-28 -top-36 h-[48rem] w-[56rem] rounded-full bg-[radial-gradient(circle,rgba(229,9,20,0.08)_0%,rgba(229,9,20,0.03)_32%,transparent_68%)] blur-2xl animate-ambient-drift" />
        <div className="absolute -right-36 -top-24 h-[42rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.035)_0%,transparent_70%)] blur-3xl animate-ambient-float" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center px-4 py-24">

        <h1 className="text-center text-4xl font-extrabold tracking-tight text-white">
          Download Rusil Stream
        </h1>
        <p className="mt-3 text-center text-[0.95rem] leading-[1.7] text-muted-foreground">
          Available for Android phones, tablets, and Android TV.
        </p>

        {/* Download cards */}
        <div className="mt-14 grid w-full gap-8 md:grid-cols-2">

          {/* ── Mobile Card ── */}
          <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-5">
              <AndroidIcon className="w-16 h-16" /> 
            </div>

            <h2 className="mt-5 text-xl font-bold text-white">
              Android Mobile
            </h2>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
              Phones &amp; tablets. The full streaming experience in your pocket.
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.72rem] font-semibold text-white/55">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              v{version}
            </div>

            <a
              href={downloadUrl}
              download={APK_FILENAME}
              className="mt-6 inline-flex h-12 w-full max-w-xs items-center justify-center gap-2.5 rounded-full bg-primary text-[0.9rem] font-bold tracking-wide text-white transition-colors duration-200 hover:bg-[#f21822] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            >
              <Download className="h-4 w-4" aria-hidden />
              Download APK
            </a>

            <div className="mt-6 w-full max-w-xs space-y-2">
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

            <ol className="mt-6 w-full max-w-xs space-y-2.5 text-left">
              {[
                'Download the APK file',
                'Allow installs from unknown sources',
                'Open the app and sign in',
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

          {/* ── TV Card ── */}
          <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-5">
              <AndroidIcon className="w-16 h-16" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-white">
              Android TV
            </h2>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
              Built for the big screen. Navigate with your remote, link with a 6-digit code.
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.72rem] font-semibold text-white/55">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              v{TV_VERSION}
            </div>

            <a
              href={tvDownloadUrl}
              download={TV_APK_FILENAME}
              className="mt-6 inline-flex h-12 w-full max-w-xs items-center justify-center gap-2.5 rounded-full bg-primary text-[0.9rem] font-bold tracking-wide text-white transition-colors duration-200 hover:bg-[#f21822] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            >
              <Download className="h-4 w-4" aria-hidden />
              Download TV APK
            </a>

            <div className="mt-6 w-full max-w-xs space-y-2">
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
                  Android TV 7.0+
                </span>
                <span className="text-[0.75rem] text-white/45">Required</span>
              </div>
            </div>

            <ol className="mt-6 w-full max-w-xs space-y-2.5 text-left">
              {[
                'Download the APK to your TV (USB or file transfer)',
                'Enable unknown sources in TV settings',
                'Open the app — it shows a 6-digit activation code',
                'Go to rusilstream.app/link-device and enter the code',
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
        </div>

        {/* Release notes link */}
        <a
          href={`https://github.com/${GITHUB_REPO}/releases`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-12 text-[0.82rem] text-white/40 underline-offset-4 transition-colors hover:text-white/70 hover:underline"
        >
          View all releases &amp; changelog →
        </a>
      </div>
    </main>
  );
}

