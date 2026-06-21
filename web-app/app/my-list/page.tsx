import { AuthGuard } from '@/components/auth';
import { TopNav } from '@/components/navigation';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { MyListScreen } from '@/components/watchlist/my-list-screen';

export default async function MyListPage() {
  return (
    <AuthGuard>
      <div className="relative min-h-screen overflow-hidden bg-black">
        <AmbientBackground />
        <TopNav />
        <MyListScreen />
      </div>
    </AuthGuard>
  );
}
