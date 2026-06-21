import Link from 'next/link';
import { HelpShell } from '@/components/help/help-shell';

export default function FeedbackPage() {
  return (
    <HelpShell
      title="Feedback"
      subtitle="Feedback page is coming soon. We are preparing an in-app feedback flow for this route."
    >
      <div className="rounded-2xl border border-white/12 bg-black/35 p-5">
        <p className="text-sm text-white/80">
          Feedback submissions are not live yet. Please check back soon.
        </p>
        <div className="mt-4">
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
