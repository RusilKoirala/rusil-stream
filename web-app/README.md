# Streaming Platform - Web Application

A Netflix-style streaming platform built with Next.js 14+, TypeScript, and shadcn/ui.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **UI Components**: shadcn/ui (customized for Netflix design)
- **Styling**: Tailwind CSS
- **Font**: Inter (Netflix Sans fallback)
- **Theme**: Dark theme with Netflix colors

## Netflix Color Palette

- **Background**: `#141414` - Main background
- **Cards/Panels**: `#181818` - Cards and panels
- **Elevated Elements**: `#232323` - Elevated elements
- **Highest Surfaces**: `#2F2F2F` - Highest surfaces
- **Brand Color**: `#E50914` - Netflix red (customizable)
- **Primary Text**: `#FFFFFF` - White at full opacity
- **Secondary Text**: `#B3B3B3` - Secondary labels
- **Muted Text**: `#737373` - Captions and placeholders
- **Borders**: `rgba(255, 255, 255, 0.1)` - White at 10% opacity

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB instance (local or Atlas)
- TMDB API key
- Auth0 or Clerk account
- Resend API key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Fill in your environment variables in `.env.local`:
   - TMDB API key
   - MongoDB URI
   - Auth0/Clerk credentials
   - Resend API key

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
```

### Environment Variables

See `.env.example` for all required environment variables.

## Project Structure

```
web-app/
├── app/                    # Next.js App Router
│   ├── api/               # Backend API routes
│   ├── globals.css        # Global styles with Netflix theme
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
├── public/               # Static assets
├── .env.local           # Local environment variables (not committed)
├── .env.example         # Environment variables template
└── package.json         # Dependencies
```

## Features

- ✅ Next.js 14+ with App Router
- ✅ TypeScript strict mode
- ✅ shadcn/ui components
- ✅ Tailwind CSS
- ✅ Dark theme with Netflix colors
- ✅ Inter font (Netflix Sans fallback)
- ✅ Environment variables configuration

## Next Steps

1. Set up MongoDB connection
2. Configure Auth0 or Clerk authentication
3. Set up TMDB API integration
4. Configure Resend email service
5. Implement backend API routes
6. Build frontend components

## License

This is a demonstration project for educational purposes.
