import Link from 'next/link';
import { HelpShell } from '@/components/help/help-shell';

const HELP_ITEMS = [
  {
    href: '/help/feedback',
    title: 'Feedback',
    description: 'Share product feedback and ideas. This section is coming soon.',
    badge: 'Coming Soon',
  },
  {
    href: '/help/faq',
    title: 'FAQ and Documentation',
    description: 'Browse common questions and open the GitHub documentation.',
    badge: 'Available',
  },
  {
    href: '/help/contact-support',
    title: 'Contact Support',
    description: 'Direct support contact form is coming soon on this page.',
    badge: 'Coming Soon',
  },
] as const;

export default function HelpPage() {
  return (
    <HelpShell
      title="Support, Docs, and Updates"
      subtitle="Main website and API are served from the same Next.js app, so these help routes stay on the same domain."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {HELP_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-2xl border border-white/12 bg-black/25 p-5 transition hover:border-white/30 hover:bg-black/45"
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/55">{item.badge}</p>
            <h2 className="mt-2 text-lg font-semibold text-white group-hover:text-white">{item.title}</h2>
            <p className="mt-2 text-sm text-white/70">{item.description}</p>
          </Link>
        ))}
      </div>
    </HelpShell>
  );
}
