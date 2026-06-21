# HeroBanner Implementation

## Overview

The HeroBanner component is a full-width, auto-rotating content showcase that displays trending titles at the top of the home screen. It implements Requirements 5.1-5.9 from the specification.

## Implementation Details

### Component Structure

```
HeroBanner
├── Backdrop Image Layer (with transitions)
├── Gradient Overlays (bottom and left)
└── Content Overlay
    ├── Title
    ├── Synopsis (3-line truncation)
    └── Action Buttons (Play, More Info)
```

### Key Features

1. **Data Fetching**
   - Fetches top 5 trending titles from `/api/content/trending?timeWindow=day`
   - Filters out content without backdrop images
   - Handles loading and error states

2. **Auto-Rotation**
   - Rotates through content every 6 seconds
   - Uses `setInterval` for timing
   - Cleans up interval on unmount

3. **Transitions**
   - 800ms cross-fade between content items
   - Uses CSS `transition-opacity` with `duration-[800ms]`
   - Manages transition state to coordinate opacity changes

4. **Visual Design**
   - Full viewport width backdrop image
   - Gradient fade from transparent to #141414 (bottom)
   - Gradient fade from #141414/80 to transparent (left)
   - Netflix-style button styling

5. **Responsive Layout**
   - Responsive text sizing (text-4xl → text-6xl)
   - Responsive padding and spacing
   - Mobile-optimized button layout

### State Management

```typescript
const [trendingContent, setTrendingContent] = useState<Content[]>([])
const [currentIndex, setCurrentIndex] = useState(0)
const [isTransitioning, setIsTransitioning] = useState(false)
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

### Transition Logic

The component uses a two-phase transition:

1. **Fade Out Phase** (0-800ms)
   - Set `isTransitioning = true`
   - Opacity transitions from 100% to 0%

2. **Content Switch + Fade In** (800ms+)
   - Update `currentIndex` to next item
   - Set `isTransitioning = false`
   - Opacity transitions from 0% to 100%

This creates a smooth cross-fade effect where the old content fades out while the new content fades in.

### Error Handling

- **Loading State**: Shows animated skeleton with gradient
- **Error State**: Returns null (fails silently)
- **Empty State**: Returns null if no content available
- **Missing Backdrop**: Filters out content without backdrop images

### Accessibility

- Uses semantic HTML structure
- Alt text on images
- Keyboard-accessible buttons
- Proper heading hierarchy

### Performance Optimizations

- Next.js Image component with `priority` flag for LCP
- Lazy loading for non-critical images
- Efficient re-renders with proper dependency arrays
- Cleanup of intervals to prevent memory leaks

## Testing

### Manual Testing

Visit `/demo/hero-banner` to see the component in action.

**Test Cases:**
1. ✓ Component loads and displays first trending item
2. ✓ Auto-rotation occurs every 6 seconds
3. ✓ Transitions are smooth (800ms cross-fade)
4. ✓ All 5 items rotate in sequence
5. ✓ Rotation loops back to first item
6. ✓ Loading state displays correctly
7. ✓ Buttons are styled correctly
8. ✓ Responsive layout works on mobile/tablet/desktop

### Integration Testing

The component integrates with:
- `/api/content/trending` endpoint
- TMDB image CDN (via Next.js Image)
- shadcn/ui Button component
- Tailwind CSS utilities

## Requirements Validation

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 5.1 | ✓ | Hero banner displays at top of home screen |
| 5.2 | ✓ | Auto-rotates through top 5 trending titles every 6 seconds |
| 5.3 | ✓ | Cross-fade transition over 800ms |
| 5.4 | ✓ | Backdrop image fills full viewport width |
| 5.5 | ✓ | Title displayed in large text (text-4xl to text-6xl) |
| 5.6 | ✓ | Synopsis displayed with 3-line truncation (line-clamp-3) |
| 5.7 | ✓ | "Play" button with white background |
| 5.8 | ✓ | "More Info" button with secondary styling |
| 5.9 | ✓ | Gradient fade to dark background (#141414) |

## Future Enhancements

Potential improvements for future iterations:

1. **Click Handlers**: Add navigation to detail view on "More Info" click
2. **Play Functionality**: Implement video player launch on "Play" click
3. **Pause on Hover**: Pause auto-rotation when user hovers over banner
4. **Manual Navigation**: Add left/right arrows for manual content switching
5. **Progress Indicators**: Add dots or progress bar showing current position
6. **Preloading**: Preload next image for smoother transitions
7. **Title Logo**: Use title logo image instead of text when available
8. **Trailer Autoplay**: Play trailer video in background (muted)

## Dependencies

```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "lucide-react": "^0.x.x",
  "@/components/ui/button": "shadcn/ui",
  "@/components/ui/card": "shadcn/ui"
}
```

## File Structure

```
web-app/components/home/
├── hero-banner.tsx          # Main component
├── index.ts                 # Barrel export
├── README.md                # Usage documentation
└── IMPLEMENTATION.md        # This file
```
