import { AuthGuard } from '@/components/auth';
import { TopNav } from '@/components/navigation';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { SettingsScreenClient } from '@/components/settings/settings-screen-client';

export default async function SettingsPage() {
  return (
    <AuthGuard>
      <div className="relative min-h-screen overflow-hidden bg-black text-white">
        <AmbientBackground />
        <TopNav />
        <SettingsScreenClient />
      </div>
    </AuthGuard>
  );
}
