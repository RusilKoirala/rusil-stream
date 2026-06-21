import Link from 'next/link';
import { HelpShell } from '@/components/help/help-shell';

export default function ContactSupportPage() {
  return (
    <HelpShell
      title="Contact Support"
      subtitle="Support contact page is coming soon. A dedicated support form will be available here."
    >
      <div className="rounded-2xl border border-white/12 bg-black/35 p-5">
        <p className="text-sm text-white/80">
          Contact Support is coming soon on this page.
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
