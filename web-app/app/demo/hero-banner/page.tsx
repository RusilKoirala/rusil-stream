import { HeroBanner } from '@/components/home'
import { PublicNav } from '@/components/navigation'

export default function HeroBannerDemo() {
  return (
    <div className="min-h-screen bg-[#141414]">
      <PublicNav />
      <HeroBanner />
      
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          HeroBanner Component Demo
        </h2>
        <p className="text-white/70 mb-4">
          This page demonstrates the HeroBanner component with auto-rotating trending content.
        </p>
        <ul className="text-white/70 space-y-2">
          <li>✓ Fetches top 5 trending titles from TMDB API</li>
          <li>✓ Auto-rotates every 6 seconds</li>
          <li>✓ 800ms cross-fade transition</li>
          <li>✓ Full-width backdrop image</li>
          <li>✓ Gradient fade to dark background</li>
          <li>✓ Title and synopsis display</li>
          <li>✓ Play and More Info buttons</li>
        </ul>
      </div>
    </div>
  )
}
