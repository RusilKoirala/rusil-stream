# Home Components

This directory contains components for the home screen of the streaming platform.

## Components

### HeroBanner

The `HeroBanner` component displays an auto-rotating showcase of trending content at the top of the home screen.

**Features:**
- Fetches top 5 trending titles from `/api/content/trending`
- Auto-rotates every 6 seconds with 800ms cross-fade transition
- Displays full-width backdrop image with gradient fade to dark background
- Shows title, synopsis (truncated to 3 lines), and action buttons
- Includes "Play" and "More Info" buttons styled with Netflix colors
- Responsive design for mobile, tablet, and desktop

**Requirements Implemented:**
- 5.1: Hero banner at top of home screen
- 5.2: Auto-rotation through top 5 trending titles every 6 seconds
- 5.3: Cross-fade transition over 800ms
- 5.4: Backdrop image filling full viewport width
- 5.5: Title logo or name in large text
- 5.6: Short synopsis display
- 5.7: "Play" button
- 5.8: "More Info" button
- 5.9: Gradient fade to dark background

**Usage:**

```tsx
import { HeroBanner } from '@/components/home'

export default function HomePage() {
  return (
    <div>
      <HeroBanner />
      {/* Other home screen content */}
    </div>
  )
}
```

**Props:**
None - the component is self-contained and manages its own state.

**Dependencies:**
- `/api/content/trending` - API endpoint for fetching trending content
- `@/components/ui/button` - shadcn/ui Button component
- `@/components/ui/card` - shadcn/ui Card component
- `next/image` - Next.js Image component for optimized images
- `lucide-react` - Icons for Play and Info buttons

**Styling:**
- Uses Netflix dark theme colors (#141414)
- Gradient overlays for text readability
- Responsive text sizing
- Smooth transitions and animations
