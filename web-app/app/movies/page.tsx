import { AuthGuard } from '@/components/auth';
import { BrowseGrid } from '@/components/browse';
import { TopNav } from '@/components/navigation';
import { AmbientBackground } from '@/components/ui/ambient-background';

export default async function MoviesPage() {
  return (
    <AuthGuard>
      <div className="relative min-h-screen overflow-hidden bg-black">
        <AmbientBackground />
        <TopNav />
        <BrowseGrid
          title="Movies"
          endpoint="/api/content/popular?type=movie"
          description="Popular movies from TMDB updated for your profile context."
        />
      </div>
    </AuthGuard>
  );
}
