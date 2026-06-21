import { SignIn } from '@clerk/nextjs';
import { PublicNav } from '@/components/navigation';

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0c10] px-4 py-10 pt-24">
      <PublicNav />

      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-105 w-105 rounded-full bg-[#e50914]/20 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-90 w-90 rounded-full bg-[#ff7b00]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_55%)]" />
      </div>

      <section className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#111319]/90 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur">
        <div className="grid lg:grid-cols-[1.1fr_1fr]">

          {/* Left panel */}
          <div className="hidden border-r border-white/10 bg-linear-to-b from-[#1a1d24] to-[#12141a] p-10 lg:block">
            <p className="text-xs uppercase tracking-[0.22em] text-[#ff6168]">
              Rusil Stream
            </p>

            <h1 className="mt-5 text-4xl font-semibold leading-tight text-white">
              Movies, shows, and moments worth replaying.
            </h1>

            <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
              Continue where you left off, discover curated picks, and keep every profile personalized.
            </p>

            <div className="mt-10 space-y-3 text-sm text-white/70">
              <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                Personalized rows for each profile
              </p>
              <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                Resume playback synced across devices
              </p>
              <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                Your watchlist, always one click away
              </p>
            </div>
          </div>

          {/* Right panel */}
          <div className="p-5 md:p-8 lg:p-10">
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              appearance={{
                variables: {
                  colorPrimary: '#E50914',
                  colorBackground: '#151820',
                  colorInput: '#ffffff',


                  colorNeutral: '#b7becb',
                  colorDanger: '#ff6a74',
                  borderRadius: '0.9rem',
                },

                elements: {
                  rootBox: 'w-full text-white',
                  cardBox: 'w-full text-white',

                  card:
                    'w-full max-w-none rounded-2xl border border-white/10 bg-[#151820]/95 shadow-none',

                  headerTitle:
                    '!text-white text-3xl font-semibold tracking-tight',

                  headerSubtitle: '!text-[#bec3cf]',

                  socialButtonsBlockButton:
                    'h-12 bg-[#0f1218] border border-white/20 text-white hover:bg-[#191d27] transition-colors ' +
                    'opacity-100 disabled:opacity-100 data-[disabled]:opacity-100 aria-disabled:opacity-100 ' +
                    'data-[selected]:bg-[#0f1218] data-[selected]:text-white data-[selected]:border-white/25',

                  socialButtonsBlockButtonText: 'text-white/95',

                  socialButtonsBlockButton__google:
                    'bg-[#0f1218] text-white border border-white/25 hover:bg-[#191d27] ' +
                    'data-[selected]:bg-[#0f1218] data-[selected]:text-white',

                  socialButtonsBlockButton__apple:
                    'bg-[#0f1218] text-white border border-white/25 hover:bg-[#191d27] ' +
                    'data-[selected]:bg-[#0f1218]',

                  socialButtonsBlockButton__github: 'hidden',

                  /* TEXT */
                  socialButtonsBlockButtonText__google: 'text-white',
                  socialButtonsBlockButtonText__apple: 'text-white',

                  /* ICONS */
                  socialButtonsProviderIcon:
                    '!opacity-100 grayscale-0 contrast-125',

                  socialButtonsProviderIcon__apple:
                    '!text-white [filter:brightness(0)_invert(1)]',

                  socialButtonsProviderIcon__google:
                    '!opacity-100',

                  /* Divider */
                  dividerLine: 'bg-white/15',
                  dividerText: '!text-white/55',

                  /* Inputs */
                  formFieldLabel: '!text-white/90 text-sm',

                  formFieldInput:
                    'h-12 border border-white/20 bg-[#0f1218] text-white placeholder:text-white/40 ' +
                    'focus:border-[#ff4a53] focus:ring-[#ff4a53]/35',

                  /* Primary button */
                  formButtonPrimary:
                    'h-12 bg-white text-[#0b0c10] hover:bg-[#f2f2f2] ' +
                    'shadow-[0_8px_24px_rgba(255,255,255,0.2)]',

                  /* Footer */
                  footerActionText: '!text-white/70',
                  footerActionLink:
                    '!text-[#ff3b45] hover:!text-[#ff5962]',

                  formResendCodeLink:
                    '!text-[#ff3b45] hover:!text-[#ff5962]',

                  identityPreviewText: '!text-white/80',

                  identityPreviewEditButton:
                    '!text-[#ff3b45] hover:!text-[#ff5962]',

                  formFieldHintText: '!text-white/55',
                  formFieldErrorText: '!text-[#ff9ca3]',
                  alertText: '!text-white',

                  otpCodeFieldInput:
                    'bg-[#0f1218] border-white/20 text-white',
                },
              }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
