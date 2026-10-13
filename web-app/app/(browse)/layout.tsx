import { AppleTVNav } from '@/components/home';

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <AppleTVNav />
      {children}
    </div>
  );
}
