import { AuthGuard } from '@/components/auth';
import { DownloadsScreen } from '@/components/downloads';
import { TopNav } from '@/components/navigation';
import { AmbientBackground } from '@/components/ui/ambient-background';

export default async function DownloadsPage() {
  return (
    <AuthGuard>
      <div className="relative min-h-screen overflow-hidden bg-black text-white">
        <AmbientBackground />
        <TopNav />
        <DownloadsScreen />
      </div>
    </AuthGuard>
  );
}
