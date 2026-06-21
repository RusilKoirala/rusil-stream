# Theme Configuration

This document describes the Netflix-style dark theme configuration for the streaming platform.

## Color Palette

The platform uses a dark theme with the following Netflix-inspired colors:

### Background Colors
- **Main Background**: `#141414` - Used for the main page background
- **Cards/Panels**: `#181818` - Used for content cards and panel backgrounds
- **Elevated Elements**: `#232323` - Used for dropdowns, modals, and elevated surfaces
- **Highest Surfaces**: `#2F2F2F` - Used for the topmost UI elements

### Text Colors
- **Primary Text**: `#FFFFFF` (white at full opacity) - Main text content
- **Secondary Text**: `#B3B3B3` - Secondary labels and metadata
- **Muted Text**: `#737373` - Captions, placeholders, and less important text

### Accent Colors
- **Brand Color**: `#E50914` (Netflix red) - Primary buttons, active states, progress bars, focus rings
  - This can be customized via the `NEXT_PUBLIC_BRAND_COLOR` environment variable

### UI Elements
- **Borders**: `rgba(255, 255, 255, 0.1)` - White at 10% opacity for subtle borders

## Typography

### Font Family
- **Primary Font**: Inter (Google Font)
- **Fallback**: Netflix Sans (if available)

The Inter font is loaded via Next.js font optimization and configured in `app/layout.tsx`.

### Font Weights
- **Regular**: 400 - Body text
- **Medium**: 500 - Labels and secondary headings
- **Semibold**: 600 - Subheadings
- **Bold**: 700 - Main headings and emphasis

## Customization

### Brand Color
To customize the brand color, set the `NEXT_PUBLIC_BRAND_COLOR` environment variable in your `.env.local` file:

```env
NEXT_PUBLIC_BRAND_COLOR=#YOUR_COLOR_HERE
```

The brand color is used for:
- Primary buttons
- Active navigation states
- Progress bars
- Focus rings (TV app)
- Links and interactive elements

### Logo
To use a custom logo, set the `NEXT_PUBLIC_LOGO_URL` environment variable:

```env
NEXT_PUBLIC_LOGO_URL=https://yourdomain.com/logo.png
```

### App Name
To customize the application name, set the `NEXT_PUBLIC_APP_NAME` environment variable:

```env
NEXT_PUBLIC_APP_NAME=Your Platform Name
```

## CSS Variables

The theme is implemented using CSS custom properties in `app/globals.css`. The main variables are:

```css
:root {
  --background: #141414;
  --foreground: #ffffff;
  --card: #181818;
  --primary: #E50914;
  --muted-foreground: #B3B3B3;
  --border: rgba(255, 255, 255, 0.1);
  /* ... and more */
}
```

These variables are automatically applied to shadcn/ui components through Tailwind CSS utility classes.

## Tailwind Configuration

The theme colors are integrated with Tailwind CSS through the `@theme` directive in `globals.css`. This allows you to use semantic color names in your components:

```tsx
<div className="bg-background text-foreground">
  <div className="bg-card border border-border">
    <button className="bg-primary text-primary-foreground">
      Click me
    </button>
  </div>
</div>
```

## Dark Mode

The application is configured to always use dark mode by adding the `dark` class to the `<html>` element in `app/layout.tsx`:

```tsx
<html className="dark">
```

This ensures the Netflix-style dark theme is always active.

## shadcn/ui Components

All shadcn/ui components are automatically styled with the Netflix theme colors. The components use the CSS variables defined in `globals.css`, so they will automatically adapt if you customize the brand color.

## Animation and Motion

The theme includes smooth transitions and animations matching Netflix's design:

- **Hover states**: 200ms ease-out transitions
- **Modal animations**: 250ms scale + fade
- **Page transitions**: 150-200ms fade
- **Card expansions**: 200ms ease-out with scale and translate

These are implemented using Tailwind CSS transition utilities and custom CSS animations.
