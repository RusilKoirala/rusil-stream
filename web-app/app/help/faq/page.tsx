import Link from 'next/link';
import { HelpShell } from '@/components/help/help-shell';

const REPO_URL = 'http://github.com/rusilkoirala/rusilstream';

export default function HelpFaqPage() {
  return (
    <HelpShell
      title="FAQ and Documentation"
      subtitle="Documentation currently lives in the project GitHub repository."
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/12 bg-black/35 p-5">
          <h2 className="text-lg font-semibold text-white">Documentation</h2>
          <p className="mt-2 text-sm text-white/75">
            Open the main docs and project notes from GitHub.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white/85 transition hover:bg-white/10"
          >
            Open GitHub Documentation
          </a>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/35 p-5">
          <h2 className="text-lg font-semibold text-white">Quick Notes</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/75">
            <li>This website and backend API run from the same Next.js app.</li>
            <li>Help routes stay under this same domain.</li>
          </ul>
        </div>

        <div>
          <Link
            href="/help"
            className="inline-flex rounded-full border border-white/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white/85 transition hover:bg-white/10"
          >
            Return to Help
          </Link>
        </div>
      </div>
    </HelpShell>
  );
}
