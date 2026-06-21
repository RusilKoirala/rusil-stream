import { AuthGuard } from '@/components/auth';
import { BrowseGrid } from '@/components/browse';
import { TopNav } from '@/components/navigation';
import { AmbientBackground } from '@/components/ui/ambient-background';

export default async function TvPage() {
  return (
    <AuthGuard>
      <div className="relative min-h-screen overflow-hidden bg-black">
        <AmbientBackground />
        <TopNav />
        <BrowseGrid
          title="TV Shows"
          endpoint="/api/content/popular?type=tv"
          description="Popular TV shows from TMDB with the same Netflix-style card interactions."
        />
      </div>
    </AuthGuard>
  );
}
