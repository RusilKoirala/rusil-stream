import { AuthGuard } from '@/components/auth';
import { TopNav } from '@/components/navigation';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { SearchScreen } from '@/components/search/search-screen';

export default async function SearchPage() {
  return (
    <AuthGuard>
      <div className="relative min-h-screen overflow-hidden bg-black text-white">
        <AmbientBackground />
        <TopNav />
        <SearchScreen />
      </div>
    </AuthGuard>
  );
}
